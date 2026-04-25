<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';

setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$db = new Database();
$conn = $db->getConnection();

// Get authenticated doctor
$doctor = requireRole('doctor');

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            getConsultationById($conn, $_GET['id'], $doctor['id']);
        } else {
            getDoctorConsultations($conn, $doctor['id']);
        }
        break;
        
    case 'POST':
        createConsultation($conn, $doctor['id']);
        break;
        
    case 'PUT':
        if (isset($_GET['id'])) {
            updateConsultation($conn, $_GET['id'], $doctor['id']);
        } else {
            sendError('Consultation ID is required for update');
        }
        break;
        
    default:
        sendError('Method not allowed', 405);
}

$db->closeConnection();

// Functions
function getDoctorConsultations($conn, $doctorId) {
    $status = $_GET['status'] ?? 'all';
    $date_from = $_GET['date_from'] ?? null;
    $date_to = $_GET['date_to'] ?? null;
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 50;
    $offset = isset($_GET['offset']) ? intval($_GET['offset']) : 0;
    
    $sql = "SELECT c.*, u.nom as patient_name, u.email as patient_email,
                   cab.nom_cabinet, cab.adresse as cabinet_address
            FROM consultations c
            LEFT JOIN users u ON c.id_patient = u.id
            LEFT JOIN cabinets cab ON c.id_cabinet = cab.id_cabinet
            WHERE c.id_docteur = ?";
    
    $params = [$doctorId];
    $types = "i";
    
    if ($status !== 'all') {
        $sql .= " AND c.statut = ?";
        $params[] = $status;
        $types .= "s";
    }
    
    if ($date_from) {
        $sql .= " AND c.date_consultation >= ?";
        $params[] = $date_from;
        $types .= "s";
    }
    
    if ($date_to) {
        $sql .= " AND c.date_consultation <= ?";
        $params[] = $date_to;
        $types .= "s";
    }
    
    $sql .= " ORDER BY c.date_consultation DESC LIMIT ? OFFSET ?";
    $params[] = $limit;
    $params[] = $offset;
    $types .= "ii";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $consultations = [];
    while ($row = $result->fetch_assoc()) {
        $consultations[] = $row;
    }
    
    // Get total count for pagination
    $countSql = "SELECT COUNT(*) as total FROM consultations WHERE id_docteur = ?";
    $countParams = [$doctorId];
    $countTypes = "i";
    
    if ($status !== 'all') {
        $countSql .= " AND statut = ?";
        $countParams[] = $status;
        $countTypes .= "s";
    }
    
    if ($date_from) {
        $countSql .= " AND date_consultation >= ?";
        $countParams[] = $date_from;
        $countTypes .= "s";
    }
    
    if ($date_to) {
        $countSql .= " AND date_consultation <= ?";
        $countParams[] = $date_to;
        $countTypes .= "s";
    }
    
    $countStmt = $conn->prepare($countSql);
    $countStmt->bind_param($countTypes, ...$countParams);
    $countStmt->execute();
    $countResult = $countStmt->get_result();
    $total = $countResult->fetch_assoc()['total'];
    
    sendResponse([
        'consultations' => $consultations,
        'total' => $total,
        'limit' => $limit,
        'offset' => $offset
    ]);
}

function getConsultationById($conn, $id, $doctorId) {
    $sql = "SELECT c.*, u.nom as patient_name, u.email as patient_email, u.telephone as patient_phone,
                   cab.nom_cabinet, cab.adresse as cabinet_address, cab.telephone as cabinet_phone
            FROM consultations c
            LEFT JOIN users u ON c.id_patient = u.id
            LEFT JOIN cabinets cab ON c.id_cabinet = cab.id_cabinet
            WHERE c.id = ? AND c.id_docteur = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $id, $doctorId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        sendError('Consultation not found', 404);
    }
    
    $consultation = $result->fetch_assoc();
    sendResponse($consultation);
}

function createConsultation($conn, $doctorId) {
    $data = getRequestBody();
    
    $required = ['id_patient', 'date_consultation', 'motif'];
    foreach ($required as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            sendError("Field '$field' is required");
        }
    }
    
    $id_patient = $data['id_patient'];
    $date_consultation = $data['date_consultation'];
    $motif = $data['motif'];
    $id_cabinet = $data['id_cabinet'] ?? null;
    $diagnostic = $data['diagnostic'] ?? null;
    $ordonnance = $data['ordonnance'] ?? null;
    $notes = $data['notes'] ?? null;
    $statut = $data['statut'] ?? 'scheduled';
    
    // Validate date
    if (!strtotime($date_consultation)) {
        sendError('Invalid date format');
    }
    
    // Validate patient exists
    $stmt = $conn->prepare("SELECT id FROM users WHERE id = ? AND role = 'patient'");
    $stmt->bind_param("i", $id_patient);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        sendError('Patient not found', 404);
    }
    
    // Validate cabinet if provided
    if ($id_cabinet) {
        $stmt = $conn->prepare("SELECT id_cabinet FROM cabinets WHERE id_cabinet = ? AND id_docteur = ?");
        $stmt->bind_param("ii", $id_cabinet, $doctorId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            sendError('Cabinet not found or access denied', 404);
        }
    }
    
    $stmt = $conn->prepare("INSERT INTO consultations 
                         (id_patient, id_docteur, id_cabinet, date_consultation, motif, diagnostic, ordonnance, notes, statut, created_at, updated_at) 
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())");
    
    $stmt->bind_param("iiissssss", $id_patient, $doctorId, $id_cabinet, $date_consultation, $motif, $diagnostic, $ordonnance, $notes, $statut);
    
    if ($stmt->execute()) {
        $consultationId = $conn->insert_id;
        
        // Get the created consultation with patient and cabinet info
        $stmt = $conn->prepare("SELECT c.*, u.nom as patient_name, u.email as patient_email,
                                       cab.nom_cabinet, cab.adresse as cabinet_address
                                FROM consultations c
                                LEFT JOIN users u ON c.id_patient = u.id
                                LEFT JOIN cabinets cab ON c.id_cabinet = cab.id_cabinet
                                WHERE c.id = ?");
        $stmt->bind_param("i", $consultationId);
        $stmt->execute();
        $result = $stmt->get_result();
        $consultation = $result->fetch_assoc();
        
        sendResponse($consultation, 201);
    } else {
        sendError('Failed to create consultation');
    }
}

function updateConsultation($conn, $id, $doctorId) {
    $data = getRequestBody();
    
    // Check if consultation exists and belongs to doctor
    $stmt = $conn->prepare("SELECT id FROM consultations WHERE id = ? AND id_docteur = ?");
    $stmt->bind_param("ii", $id, $doctorId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        sendError('Consultation not found or access denied', 404);
    }
    
    $updates = [];
    $types = '';
    $params = [];
    
    if (isset($data['date_consultation'])) {
        if (!strtotime($data['date_consultation'])) {
            sendError('Invalid date format');
        }
        $updates[] = "date_consultation = ?";
        $types .= 's';
        $params[] = $data['date_consultation'];
    }
    
    if (isset($data['motif'])) {
        $updates[] = "motif = ?";
        $types .= 's';
        $params[] = $data['motif'];
    }
    
    if (isset($data['diagnostic'])) {
        $updates[] = "diagnostic = ?";
        $types .= 's';
        $params[] = $data['diagnostic'];
    }
    
    if (isset($data['ordonnance'])) {
        $updates[] = "ordonnance = ?";
        $types .= 's';
        $params[] = $data['ordonnance'];
    }
    
    if (isset($data['notes'])) {
        $updates[] = "notes = ?";
        $types .= 's';
        $params[] = $data['notes'];
    }
    
    if (isset($data['statut'])) {
        $validStatuses = ['scheduled', 'completed', 'cancelled'];
        if (!in_array($data['statut'], $validStatuses)) {
            sendError('Invalid status');
        }
        $updates[] = "statut = ?";
        $types .= 's';
        $params[] = $data['statut'];
    }
    
    if (isset($data['id_cabinet'])) {
        // Validate cabinet
        $stmt = $conn->prepare("SELECT id_cabinet FROM cabinets WHERE id_cabinet = ? AND id_docteur = ?");
        $stmt->bind_param("ii", $data['id_cabinet'], $doctorId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            sendError('Cabinet not found or access denied', 404);
        }
        
        $updates[] = "id_cabinet = ?";
        $types .= 'i';
        $params[] = $data['id_cabinet'];
    }
    
    if (empty($updates)) {
        sendError('No fields to update');
    }
    
    $updates[] = "updated_at = NOW()";
    $params[] = $id;
    $types .= 'i';
    
    $sql = "UPDATE consultations SET " . implode(', ', $updates) . " WHERE id = ?";
    $stmt = $conn->prepare($sql);
    
    $stmt->bind_param($types, ...$params);
    
    if ($stmt->execute()) {
        // Get updated consultation with patient and cabinet info
        $stmt = $conn->prepare("SELECT c.*, u.nom as patient_name, u.email as patient_email,
                                       cab.nom_cabinet, cab.adresse as cabinet_address
                                FROM consultations c
                                LEFT JOIN users u ON c.id_patient = u.id
                                LEFT JOIN cabinets cab ON c.id_cabinet = cab.id_cabinet
                                WHERE c.id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $consultation = $result->fetch_assoc();
        
        sendResponse($consultation);
    } else {
        sendError('Failed to update consultation');
    }
}
?>
