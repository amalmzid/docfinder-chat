<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';

setCorsHeaders();

$database = new Database();
$conn = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        handleGet($conn);
        break;
    case 'PUT':
        handlePut($conn);
        break;
    default:
        sendError('Method not allowed', 405);
}

function handleGet($conn) {
    if (!isset($_GET['id'])) {
        sendError('Pharmacy ID is required');
    }
    
    $id = intval($_GET['id']);
    $sql = "SELECT id_pharmacie, nom, email, adresse, horaireOuverture FROM pharmacie WHERE id_pharmacie = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $pharmacy = $result->fetch_assoc();
        sendResponse($pharmacy);
    } else {
        sendError('Pharmacy not found', 404);
    }
}

function handlePut($conn) {
    if (!isset($_GET['id'])) {
        sendError('Pharmacy ID is required');
    }
    
    $id = intval($_GET['id']);
    $data = getRequestBody();
    
    $updates = [];
    $types = '';
    $params = [];
    
    if (isset($data['nom'])) {
        $updates[] = "nom = ?";
        $types .= 's';
        $params[] = $data['nom'];
    }
    
    if (isset($data['email'])) {
        // Check if email is already taken by another pharmacy
        $checkEmail = $conn->prepare("SELECT id_pharmacie FROM pharmacie WHERE email = ? AND id_pharmacie != ?");
        $checkEmail->bind_param("si", $data['email'], $id);
        $checkEmail->execute();
        $emailResult = $checkEmail->get_result();
        
        if ($emailResult->num_rows > 0) {
            sendError('Email is already taken by another pharmacy');
        }
        
        $updates[] = "email = ?";
        $types .= 's';
        $params[] = $data['email'];
    }
    
    if (isset($data['adresse'])) {
        $updates[] = "adresse = ?";
        $types .= 's';
        $params[] = $data['adresse'];
    }
    
    if (isset($data['horaireOuverture'])) {
        $updates[] = "horaireOuverture = ?";
        $types .= 's';
        $params[] = $data['horaireOuverture'];
    }
    
    if (empty($updates)) {
        sendError('No fields to update');
    }
    
    $params[] = $id;
    $types .= 'i';
    
    $sql = "UPDATE pharmacie SET " . implode(', ', $updates) . " WHERE id_pharmacie = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            // Get updated pharmacy data
            $sql = "SELECT id_pharmacie, nom, email, adresse, horaireOuverture FROM pharmacie WHERE id_pharmacie = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
            $pharmacy = $result->fetch_assoc();
            
            sendResponse($pharmacy);
        } else {
            sendError('Pharmacy not found or no changes made', 404);
        }
    } else {
        sendError('Failed to update pharmacy', 500);
    }
}

$conn->close();
?>
