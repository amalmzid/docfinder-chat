<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';

setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$db = new Database();
$conn = $db->getConnection();

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            getAppointmentById($conn, $_GET['id']);
        } elseif (isset($_GET['patient_id'])) {
            getAppointmentsByPatient($conn, $_GET['patient_id']);
        } elseif (isset($_GET['doctor'])) {
            getAppointmentsByDoctor($conn, $_GET['doctor']);
        } else {
            getAllAppointments($conn);
        }
        break;
        
    case 'POST':
        createAppointment($conn);
        break;
        
    case 'PUT':
        if (isset($_GET['id'])) {
            updateAppointment($conn, $_GET['id']);
        } else {
            sendError('ID is required for update');
        }
        break;
        
    case 'DELETE':
        if (isset($_GET['id'])) {
            deleteAppointment($conn, $_GET['id']);
        } else {
            sendError('ID is required for delete');
        }
        break;
        
    default:
        sendError('Method not allowed', 405);
}

$db->closeConnection();

// Functions
function getAllAppointments($conn) {
    $user = authenticateToken();
    
    if (!$user) {
        sendError('Unauthorized', 401);
    }
    
    $sql = "SELECT a.*, 
                   p.nom as patient_name, p.email as patient_email,
                   d.nom as doctor_name, d.specialite,
                   c.nom_cabinet, c.adresse as cabinet_address
            FROM rendez_vous a
            LEFT JOIN patient p ON a.id_patient = p.id_patient
            LEFT JOIN docteur d ON a.id_docteur = d.id_docteur
            LEFT JOIN cabinets c ON a.id_cabinet = c.id_cabinet";
    
    // Filter based on user role
    if ($user['role'] === 'patient') {
        $sql .= " WHERE a.id_patient = " . $user['user_id'];
    } elseif ($user['role'] === 'doctor') {
        $sql .= " WHERE a.id_docteur = " . $user['user_id'];
    }
    
    $sql .= " ORDER BY a.date_rdv DESC";
    
    $result = $conn->query($sql);
    
    $appointments = [];
    while ($row = $result->fetch_assoc()) {
        $appointments[] = $row;
    }
    
    sendResponse($appointments);
}

function getAppointmentById($conn, $id) {
    $user = authenticateToken();
    
    if (!$user) {
        sendError('Unauthorized', 401);
    }
    
    $stmt = $conn->prepare("SELECT a.*, 
                                   p.nom as patient_name, p.email as patient_email,
                                   d.nom as doctor_name, d.specialite,
                                   c.nom_cabinet, c.adresse as cabinet_address
                            FROM rendez_vous a
                            LEFT JOIN patient p ON a.id_patient = p.id_patient
                            LEFT JOIN docteur d ON a.id_docteur = d.id_docteur
                            LEFT JOIN cabinets c ON a.id_cabinet = c.id_cabinet
                            WHERE a.id_rdv = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        sendError('Appointment not found', 404);
    }
    
    $appointment = $result->fetch_assoc();
    
    // Check permissions
    if ($user['role'] === 'patient' && $appointment['id_patient'] != $user['user_id']) {
        sendError('Forbidden', 403);
    } elseif ($user['role'] === 'doctor' && $appointment['id_docteur'] != $user['user_id']) {
        sendError('Forbidden', 403);
    }
    
    sendResponse($appointment);
}

function getAppointmentsByPatient($conn, $patientId) {
    $stmt = $conn->prepare("SELECT r.*, d.nom as doctor_name, d.specialite
                            FROM rendez_vous r
                            LEFT JOIN docteur d ON r.id_docteur = d.id_docteur
                            WHERE r.id_patient = ?
                            ORDER BY r.date_rdv DESC");
    $stmt->bind_param("i", $patientId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $appointments = [];
    while ($row = $result->fetch_assoc()) {
        $appointments[] = $row;
    }
    
    sendResponse([
        'success' => true,
        'appointments' => $appointments
    ]);
}

function getAppointmentsByDoctor($conn, $doctorId) {
    $user = requireAuth();
    
    // Doctors can only see their own appointments
    if ($user['role'] === 'doctor' && $user['user_id'] != $doctorId) {
        sendError('Forbidden', 403);
    }
    
    $stmt = $conn->prepare("SELECT a.*, 
                                   p.nom as patient_name, p.email as patient_email
                            FROM rendez_vous a
                            LEFT JOIN patient p ON a.id_patient = p.id_patient
                            WHERE a.id_docteur = ?
                            ORDER BY a.date_rdv DESC");
    $stmt->bind_param("i", $doctorId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $appointments = [];
    while ($row = $result->fetch_assoc()) {
        $appointments[] = $row;
    }
    
    sendResponse([
        'success' => true,
        'appointments' => $appointments
    ]);
}

function createAppointment($conn) {
    $data = getRequestBody();
    
    $required = ['id_patient', 'id_docteur', 'date_rdv', 'motif'];
    foreach ($required as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            sendError("Field '$field' is required");
        }
    }
    
    $id_patient = $data['id_patient'];
    $id_docteur = $data['id_docteur'];
    $date_rdv = $data['date_rdv'];
    $motif = $data['motif'];
    $id_cabinet = $data['id_cabinet'] ?? null;
    $statut = $data['statut'] ?? 'pending';
    
    // Verify patient exists
    $stmt = $conn->prepare("SELECT id_patient FROM patient WHERE id_patient = ?");
    $stmt->bind_param("i", $id_patient);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        sendError('Patient not found', 404);
    }
    
    // Verify doctor exists
    $stmt = $conn->prepare("SELECT id_docteur FROM docteur WHERE id_docteur = ?");
    $stmt->bind_param("i", $id_docteur);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        sendError('Doctor not found', 404);
    }
    
    // Verify cabinet exists if provided
    if ($id_cabinet) {
        $stmt = $conn->prepare("SELECT id_cabinet FROM cabinet WHERE id_cabinet = ?");
        $stmt->bind_param("i", $id_cabinet);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            sendError('Cabinet not found', 404);
        }
    }
    
    // Create appointment
    $query = "INSERT INTO rendez_vous (id_patient, id_docteur, date_rdv, heure, statut) VALUES (?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("iisss", $id_patient, $id_docteur, $date_rdv, $date_rdv, $statut);
    
    if ($stmt->execute()) {
        $appointmentId = $conn->insert_id;
        
        // Get the created appointment with doctor info
        $query = "SELECT r.id_rdv, r.id_patient, r.id_docteur, r.date_rdv, r.heure, r.statut, d.nom as doctor_name, d.specialite 
                  FROM rendez_vous r 
                  LEFT JOIN docteur d ON r.id_docteur = d.id_docteur 
                  WHERE r.id_rdv = ?";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("i", $appointmentId);
        $stmt->execute();
        $result = $stmt->get_result();
        $appointment = $result->fetch_assoc();
        
        sendResponse([
            'success' => true,
            'message' => 'Appointment created successfully',
            'appointment' => $appointment
        ]);
    } else {
        sendError('Failed to create appointment');
    }
}

function updateAppointment($conn, $id) {
    $user = requireAuth();
    
    $data = getRequestBody();
    
    // Check if appointment exists and permissions
    $stmt = $conn->prepare("SELECT id_patient, id_docteur FROM rendez_vous WHERE id_rdv = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        sendError('Appointment not found', 404);
    }
    
    $appointment = $result->fetch_assoc();
    
    // Check permissions
    if ($user['role'] === 'patient' && $appointment['id_patient'] != $user['user_id']) {
        sendError('Forbidden', 403);
    } elseif ($user['role'] === 'doctor' && $appointment['id_docteur'] != $user['user_id']) {
        sendError('Forbidden', 403);
    }
    
    $updates = [];
    $types = '';
    $params = [];
    
    if (isset($data['date_rdv'])) {
        $updates[] = "date_rdv = ?";
        $types .= 's';
        $params[] = $data['date_rdv'];
    }
    
        
    if (isset($data['statut'])) {
        $validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
        if (!in_array($data['statut'], $validStatuses)) {
            sendError('Invalid status');
        }
        $updates[] = "statut = ?";
        $types .= 's';
        $params[] = $data['statut'];
    }
    
        
    if (empty($updates)) {
        sendError('No fields to update');
    }
    
    $params[] = $id;
    $types .= 'i';
    
    $sql = "UPDATE rendez_vous SET " . implode(', ', $updates) . " WHERE id_rdv = ?";
    $stmt = $conn->prepare($sql);
    
    $stmt->bind_param($types, ...$params);
    
    if ($stmt->execute()) {
        // Get updated appointment
        $stmt = $conn->prepare("SELECT a.*, 
                                       p.nom as patient_name, p.email as patient_email,
                                       d.nom as doctor_name, d.specialite
                                FROM rendez_vous a
                                LEFT JOIN patient p ON a.id_patient = p.id_patient
                                LEFT JOIN docteur d ON a.id_docteur = d.id_docteur
                                WHERE a.id_rdv = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $appointment = $result->fetch_assoc();
        
        sendResponse($appointment);
    } else {
        sendError('Failed to update appointment');
    }
}

function deleteAppointment($conn, $id) {
    $user = requireAuth();
    
    // Check if appointment exists and permissions
    $stmt = $conn->prepare("SELECT id_patient, id_docteur FROM rendez_vous WHERE id_rdv = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        sendError('Appointment not found', 404);
    }
    
    $appointment = $result->fetch_assoc();
    
    // Check permissions
    if ($user['role'] === 'patient' && $appointment['id_patient'] != $user['user_id']) {
        sendError('Forbidden', 403);
    } elseif ($user['role'] === 'doctor' && $appointment['id_docteur'] != $user['user_id']) {
        sendError('Forbidden', 403);
    }
    
    $stmt = $conn->prepare("DELETE FROM rendez_vous WHERE id_rdv = ?");
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        sendResponse(['message' => 'Appointment deleted successfully']);
    } else {
        sendError('Failed to delete appointment');
    }
}
?>
