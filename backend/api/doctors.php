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
        // Get single docteur
        $id = intval($_GET['id']);
        $sql = "SELECT * FROM docteur WHERE id_docteur = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            sendResponse($result->fetch_assoc());
        } else {
            sendError('Docteur not found', 404);
        }
    } else {
        // Get all doctors
        $sql = "SELECT * FROM docteur ORDER BY nom";
        $result = $conn->query($sql);
        $docteurs = [];
        
        while ($row = $result->fetch_assoc()) {
            $docteurs[] = $row;
        }
        
        sendResponse($docteurs);
    }
}

function handlePost($conn) {
    $data = getRequestBody();
    
    if (!isset($data['nom']) || !isset($data['email']) || !isset($data['mot_de_passe']) || !isset($data['role']) || !isset($data['specialite'])) {
        sendError('Missing required fields: nom, email, mot_de_passe, role, specialite');
    }
    
    $sql = "INSERT INTO docteur (nom, email, mot_de_passe, role, specialite) VALUES (?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssss", $data['nom'], $data['email'], $data['mot_de_passe'], $data['role'], $data['specialite']);
    
    if ($stmt->execute()) {
        $data['id_docteur'] = $conn->insert_id;
        sendResponse($data, 201);
    } else {
        sendError('Failed to create docteur', 500);
    }
}

function handlePut($conn) {
    if (!isset($_GET['id'])) {
        sendError('Docteur ID is required');
    }
    
    $id = intval($_GET['id']);
    $data = getRequestBody();
    
    if (!isset($data['nom']) || !isset($data['email']) || !isset($data['mot_de_passe']) || !isset($data['role']) || !isset($data['specialite'])) {
        sendError('Missing required fields: nom, email, mot_de_passe, role, specialite');
    }
    
    $sql = "UPDATE docteur SET nom = ?, email = ?, mot_de_passe = ?, role = ?, specialite = ? WHERE id_docteur = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssssi", $data['nom'], $data['email'], $data['mot_de_passe'], $data['role'], $data['specialite'], $id);
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            $data['id_docteur'] = $id;
            sendResponse($data);
        } else {
            sendError('Docteur not found or no changes made', 404);
        }
    } else {
        sendError('Failed to update docteur', 500);
    }
}

function handleDelete($conn) {
    if (!isset($_GET['id'])) {
        sendError('docteur ID is required');
    }
    
    $id = intval($_GET['id']);
    $sql = "DELETE FROM docteur WHERE id_docteur = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            sendResponse(['message' => 'docteur deleted successfully']);
        } else {
            sendError('docteur not found', 404);
        }
    } else {
        sendError('Failed to delete docteur', 500);
    }
}

$conn->close();
?>
