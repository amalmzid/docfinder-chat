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
            getHistoriqueById($conn, $_GET['id']);
        } elseif (isset($_GET['patient'])) {
            getHistoriqueByPatient($conn, $_GET['patient']);
        } else {
            getAllHistorique($conn);
        }
        break;
        
    case 'POST':
        createHistorique($conn);
        break;
        
    case 'PUT':
        if (isset($_GET['id'])) {
            updateHistorique($conn, $_GET['id']);
        } else {
            sendError('ID is required for update');
        }
        break;
        
    case 'DELETE':
        if (isset($_GET['id'])) {
            deleteHistorique($conn, $_GET['id']);
        } else {
            sendError('ID is required for delete');
        }
        break;
        
    default:
        sendError('Method not allowed', 405);
}

$db->closeConnection();

// Functions
function getAllHistorique($conn) {
    $sql = "SELECT hm.*, p.nom as patient_nom 
            FROM historique_medical hm 
            LEFT JOIN patient p ON hm.id_patient = p.id_patient 
            ORDER BY hm.id_historique";
    
    $result = $conn->query($sql);
    $historique = [];
    
    while ($row = $result->fetch_assoc()) {
        $historique[] = $row;
    }
    
    sendResponse($historique);
}

function getHistoriqueById($conn, $id) {
    $stmt = $conn->prepare("SELECT hm.*, p.nom as patient_nom 
                           FROM historique_medical hm 
                           LEFT JOIN patient p ON hm.id_patient = p.id_patient 
                           WHERE hm.id_historique = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        sendResponse($result->fetch_assoc());
    } else {
        sendError('Historique not found', 404);
    }
}

function getHistoriqueByPatient($conn, $patientId) {
    $stmt = $conn->prepare("SELECT hm.*, p.nom as patient_nom 
                           FROM historique_medical hm 
                           LEFT JOIN patient p ON hm.id_patient = p.id_patient 
                           WHERE hm.id_patient = ?");
    $stmt->bind_param("i", $patientId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $historique = [];
    while ($row = $result->fetch_assoc()) {
        $historique[] = $row;
    }
    
    sendResponse($historique);
}

function createHistorique($conn) {
    $data = getRequestBody();
    
    if (!isset($data['antecedents']) || !isset($data['allergies']) || !isset($data['traitements'])) {
        sendError('antecedents, allergies, and traitements are required');
    }
    
    $sql = "INSERT INTO historique_medical (antecedents, allergies, traitements, id_patient) 
            VALUES (?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    $antecedents = $data['antecedents'];
    $allergies = $data['allergies'];
    $traitements = $data['traitements'];
    $id_patient = $data['id_patient'] ?? null;
    
    $stmt->bind_param("sssi", $antecedents, $allergies, $traitements, $id_patient);
    
    if ($stmt->execute()) {
        $data['id_historique'] = $conn->insert_id;
        sendResponse($data, 201);
    } else {
        sendError('Failed to create historique');
    }
}

function updateHistorique($conn, $id) {
    $data = getRequestBody();
    
    $sql = "UPDATE historique_medical SET ";
    $updates = [];
    $types = "";
    $params = [];
    
    if (isset($data['antecedents'])) {
        $updates[] = "antecedents = ?";
        $types .= "s";
        $params[] = $data['antecedents'];
    }
    
    if (isset($data['allergies'])) {
        $updates[] = "allergies = ?";
        $types .= "s";
        $params[] = $data['allergies'];
    }
    
    if (isset($data['traitements'])) {
        $updates[] = "traitements = ?";
        $types .= "s";
        $params[] = $data['traitements'];
    }
    
    if (isset($data['id_patient'])) {
        $updates[] = "id_patient = ?";
        $types .= "i";
        $params[] = $data['id_patient'];
    }
    
    if (empty($updates)) {
        sendError('No valid fields to update');
    }
    
    $sql .= implode(", ", $updates) . " WHERE id_historique = ?";
    $types .= "i";
    $params[] = $id;
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);
    
    if ($stmt->execute()) {
        sendResponse(['message' => 'Historique updated successfully']);
    } else {
        sendError('Failed to update historique');
    }
}

function deleteHistorique($conn, $id) {
    $stmt = $conn->prepare("DELETE FROM historique_medical WHERE id_historique = ?");
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        sendResponse(['message' => 'Historique deleted successfully']);
    } else {
        sendError('Failed to delete historique');
    }
}

function getRequestBody() {
    $input = file_get_contents('php://input');
    return json_decode($input, true);
}
?>
