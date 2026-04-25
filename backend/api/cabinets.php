<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';

setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$db = new Database();
$conn = $db->getConnection();

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            getCabinetById($conn, $_GET['id']);
        } elseif (isset($_GET['doctor'])) {
            getCabinetsByDoctor($conn, $_GET['doctor']);
        } else {
            getAllCabinets($conn);
        }
        break;
        
    case 'POST':
        createCabinet($conn);
        break;
        
    case 'PUT':
        if (isset($_GET['id'])) {
            updateCabinet($conn, $_GET['id']);
        } else {
            sendError('ID is required for update');
        }
        break;
        
    case 'DELETE':
        if (isset($_GET['id'])) {
            deleteCabinet($conn, $_GET['id']);
        } else {
            sendError('ID is required for delete');
        }
        break;
        
    default:
        sendError('Method not allowed', 405);
}

$db->closeConnection();

// Functions
function getAllCabinets($conn) {
    $sql = "SELECT c.*, d.nom as doctor_name, d.specialite 
            FROM cabinets c 
            LEFT JOIN doctors d ON c.id_docteur = d.id_docteur 
            ORDER BY c.created_at DESC";
    $result = $conn->query($sql);
    
    $cabinets = [];
    while ($row = $result->fetch_assoc()) {
        $cabinets[] = $row;
    }
    
    sendResponse($cabinets);
}

function getCabinetById($conn, $id) {
    $stmt = $conn->prepare("SELECT c.*, d.nom as doctor_name, d.specialite 
                             FROM cabinets c 
                             LEFT JOIN doctors d ON c.id_docteur = d.id_docteur 
                             WHERE c.id_cabinet = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        sendError('Cabinet not found', 404);
    }
    
    $cabinet = $result->fetch_assoc();
    sendResponse($cabinet);
}

function getCabinetsByDoctor($conn, $doctorId) {
    $stmt = $conn->prepare("SELECT c.*, d.nom as doctor_name, d.specialite 
                             FROM cabinets c 
                             LEFT JOIN doctors d ON c.id_docteur = d.id_docteur 
                             WHERE c.id_docteur = ? 
                             ORDER BY c.created_at DESC");
    $stmt->bind_param("i", $doctorId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $cabinets = [];
    while ($row = $result->fetch_assoc()) {
        $cabinets[] = $row;
    }
    
    sendResponse($cabinets);
}

function createCabinet($conn) {
    $data = getRequestBody();
    
    $required = ['id_docteur', 'nom_cabinet', 'adresse', 'horaire_travail', 'specialite'];
    foreach ($required as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            sendError("Field '$field' is required");
        }
    }
    
    $id_docteur = $data['id_docteur'];
    $nom_cabinet = $data['nom_cabinet'];
    $adresse = $data['adresse'];
    $telephone = $data['telephone'] ?? null;
    $horaire_travail = $data['horaire_travail'];
    $specialite = $data['specialite'];
    
    // Verify doctor exists
    $stmt = $conn->prepare("SELECT id_docteur FROM doctors WHERE id_docteur = ?");
    $stmt->bind_param("i", $id_docteur);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        sendError('Doctor not found', 404);
    }
    
    $stmt = $conn->prepare("INSERT INTO cabinets (id_docteur, nom_cabinet, adresse, telephone, horaire_travail, specialite, created_at, updated_at) 
                         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())");
    $stmt->bind_param("isssss", $id_docteur, $nom_cabinet, $adresse, $telephone, $horaire_travail, $specialite);
    
    if ($stmt->execute()) {
        $cabinetId = $conn->insert_id;
        
        // Get the created cabinet with doctor info
        $stmt = $conn->prepare("SELECT c.*, d.nom as doctor_name, d.specialite 
                                 FROM cabinets c 
                                 LEFT JOIN doctors d ON c.id_docteur = d.id_docteur 
                                 WHERE c.id_cabinet = ?");
        $stmt->bind_param("i", $cabinetId);
        $stmt->execute();
        $result = $stmt->get_result();
        $cabinet = $result->fetch_assoc();
        
        sendResponse($cabinet, 201);
    } else {
        sendError('Failed to create cabinet');
    }
}

function updateCabinet($conn, $id) {
    $data = getRequestBody();
    
    $updates = [];
    $types = '';
    $params = [];
    
    if (isset($data['id_docteur'])) {
        // Verify doctor exists
        $stmt = $conn->prepare("SELECT id_docteur FROM doctors WHERE id_docteur = ?");
        $stmt->bind_param("i", $data['id_docteur']);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            sendError('Doctor not found', 404);
        }
        
        $updates[] = "id_docteur = ?";
        $types .= 'i';
        $params[] = $data['id_docteur'];
    }
    
    if (isset($data['nom_cabinet'])) {
        $updates[] = "nom_cabinet = ?";
        $types .= 's';
        $params[] = $data['nom_cabinet'];
    }
    
    if (isset($data['adresse'])) {
        $updates[] = "adresse = ?";
        $types .= 's';
        $params[] = $data['adresse'];
    }
    
    if (isset($data['telephone'])) {
        $updates[] = "telephone = ?";
        $types .= 's';
        $params[] = $data['telephone'];
    }
    
    if (isset($data['horaire_travail'])) {
        $updates[] = "horaire_travail = ?";
        $types .= 's';
        $params[] = $data['horaire_travail'];
    }
    
    if (isset($data['specialite'])) {
        $updates[] = "specialite = ?";
        $types .= 's';
        $params[] = $data['specialite'];
    }
    
    if (empty($updates)) {
        sendError('No fields to update');
    }
    
    $updates[] = "updated_at = NOW()";
    $params[] = $id;
    $types .= 'i';
    
    $sql = "UPDATE cabinets SET " . implode(', ', $updates) . " WHERE id_cabinet = ?";
    $stmt = $conn->prepare($sql);
    
    $stmt->bind_param($types, ...$params);
    
    if ($stmt->execute()) {
        // Get updated cabinet with doctor info
        $stmt = $conn->prepare("SELECT c.*, d.nom as doctor_name, d.specialite 
                                 FROM cabinets c 
                                 LEFT JOIN doctors d ON c.id_docteur = d.id_docteur 
                                 WHERE c.id_cabinet = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $cabinet = $result->fetch_assoc();
        
        sendResponse($cabinet);
    } else {
        sendError('Failed to update cabinet');
    }
}

function deleteCabinet($conn, $id) {
    // Check if cabinet exists
    $stmt = $conn->prepare("SELECT id_cabinet FROM cabinets WHERE id_cabinet = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        sendError('Cabinet not found', 404);
    }
    
    $stmt = $conn->prepare("DELETE FROM cabinets WHERE id_cabinet = ?");
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        sendResponse(['message' => 'Cabinet deleted successfully']);
    } else {
        sendError('Failed to delete cabinet');
    }
}
?>
