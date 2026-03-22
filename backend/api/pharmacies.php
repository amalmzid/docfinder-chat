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
    case 'POST':
        handlePost($conn);
        break;
    case 'PUT':
        handlePut($conn);
        break;
    case 'DELETE':
        handleDelete($conn);
        break;
    default:
        sendError('Method not allowed', 405);
}

function handleGet($conn) {
    if (isset($_GET['id'])) {
        // Get single pharmacy
        $id = intval($_GET['id']);
        $sql = "SELECT * FROM pharmacie WHERE id_pharmacie = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            sendResponse($result->fetch_assoc());
        } else {
            sendError('Pharmacy not found', 404);
        }
    } else {
        // Get all pharmacies
        $sql = "SELECT * FROM pharmacie ORDER BY nom";
        $result = $conn->query($sql);
        $pharmacies = [];
        
        while ($row = $result->fetch_assoc()) {
            $pharmacies[] = $row;
        }
        
        sendResponse($pharmacies);
    }
}

function handlePost($conn) {
    $data = getRequestBody();
    
    if (!isset($data['nom']) || !isset($data['adresse']) || !isset($data['horaireOuverture'])) {
        sendError('Missing required fields: nom, adresse, horaireOuverture');
    }
    
    $sql = "INSERT INTO pharmacie (nom, adresse, horaireOuverture) VALUES (?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sss", $data['nom'], $data['adresse'], $data['horaireOuverture']);
    
    if ($stmt->execute()) {
        $data['id_pharmacie'] = $conn->insert_id;
        sendResponse($data, 201);
    } else {
        sendError('Failed to create pharmacy', 500);
    }
}

function handlePut($conn) {
    if (!isset($_GET['id'])) {
        sendError('Pharmacy ID is required');
    }
    
    $id = intval($_GET['id']);
    $data = getRequestBody();
    
    if (!isset($data['nom']) || !isset($data['adresse']) || !isset($data['horaireOuverture'])) {
        sendError('Missing required fields: nom, adresse, horaireOuverture');
    }
    
    $sql = "UPDATE pharmacie SET nom = ?, adresse = ?, horaireOuverture = ? WHERE id_pharmacie = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssi", $data['nom'], $data['adresse'], $data['horaireOuverture'], $id);
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            $data['id_pharmacie'] = $id;
            sendResponse($data);
        } else {
            sendError('Pharmacy not found or no changes made', 404);
        }
    } else {
        sendError('Failed to update pharmacy', 500);
    }
}

function handleDelete($conn) {
    if (!isset($_GET['id'])) {
        sendError('Pharmacy ID is required');
    }
    
    $id = intval($_GET['id']);
    $sql = "DELETE FROM pharmacie WHERE id_pharmacie = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            sendResponse(['message' => 'Pharmacy deleted successfully']);
        } else {
            sendError('Pharmacy not found', 404);
        }
    } else {
        sendError('Failed to delete pharmacy', 500);
    }
}

$conn->close();
?>
