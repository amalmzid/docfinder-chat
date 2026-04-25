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
    try {
        if (isset($_GET['id'])) {
            // Get single medicine
            $id = intval($_GET['id']);
            $sql = "SELECT * FROM medicament WHERE id_medicament = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows > 0) {
                sendResponse($result->fetch_assoc());
            } else {
                sendError('Medicine not found', 404);
            }
        } elseif (isset($_GET['id_pharmacie'])) {
            // Get medicines by pharmacy
            $id_pharmacie = intval($_GET['id_pharmacie']);
            
            // Debug: Log the pharmacy ID
            error_log("Getting medicines for pharmacy ID: " . $id_pharmacie);
            
            $sql = "SELECT * FROM medicament WHERE id_pharmacie = ? ORDER BY nom ASC";
            $stmt = $conn->prepare($sql);
            
            if (!$stmt) {
                error_log("Prepare failed: " . $conn->error);
                sendError('Database query preparation failed', 500);
                return;
            }
            
            $stmt->bind_param("i", $id_pharmacie);
            
            if (!$stmt->execute()) {
                error_log("Execute failed: " . $stmt->error);
                sendError('Database query execution failed', 500);
                return;
            }
            
            $result = $stmt->get_result();
            
            $medicines = [];
            while ($row = $result->fetch_assoc()) {
                $medicines[] = $row;
            }
            
            error_log("Found " . count($medicines) . " medicines");
            sendResponse($medicines, 200);
        } else {
            sendError('Pharmacy ID is required', 400);
        }
    } catch (Exception $e) {
        error_log("Exception in handleGet: " . $e->getMessage());
        sendError('Internal server error', 500);
    }
}

function handlePost($conn) {
    $data = getRequestBody();
    
    $required = ['nom', 'categorie', 'prix', 'id_pharmacie'];
    foreach ($required as $field) {
        if (!isset($data[$field]) || $data[$field] === '') {
            sendError("Field '$field' is required");
        }
    }
    
    $sql = "INSERT INTO medicament (nom, categorie, prix, disponibilite, id_pharmacie) VALUES (?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    
    $nom = $data['nom'];
    $categorie = $data['categorie'];
    $prix = $data['prix'];
    $disponibilite = $data['disponibilite'] ?? 1;
    $id_pharmacie = $data['id_pharmacie'];
    
    $stmt->bind_param("ssdii", $nom, $categorie, $prix, $disponibilite, $id_pharmacie);
    
    if ($stmt->execute()) {
        $medicineId = $conn->insert_id;
        
        // Get the created medicine
        $sql = "SELECT * FROM medicament WHERE id_medicament = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $medicineId);
        $stmt->execute();
        $result = $stmt->get_result();
        $medicine = $result->fetch_assoc();
        
        sendResponse($medicine, 201);
    } else {
        sendError('Failed to create medicine', 500);
    }
}

function handlePut($conn) {
    if (!isset($_GET['id'])) {
        sendError('Medicine ID is required');
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
    
    if (isset($data['categorie'])) {
        $updates[] = "categorie = ?";
        $types .= 's';
        $params[] = $data['categorie'];
    }
    
    if (isset($data['prix'])) {
        $updates[] = "prix = ?";
        $types .= 'd';
        $params[] = $data['prix'];
    }
    
    if (isset($data['disponibilite'])) {
        $updates[] = "disponibilite = ?";
        $types .= 'i';
        $params[] = $data['disponibilite'];
    }
    
    if (empty($updates)) {
        sendError('No fields to update');
    }
    
    $params[] = $id;
    $types .= 'i';
    
    $sql = "UPDATE medicament SET " . implode(', ', $updates) . " WHERE id_medicament = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            // Get updated medicine
            $sql = "SELECT * FROM medicament WHERE id_medicament = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
            $medicine = $result->fetch_assoc();
            
            sendResponse($medicine);
        } else {
            sendError('Medicine not found or no changes made', 404);
        }
    } else {
        sendError('Failed to update medicine', 500);
    }
}

function handleDelete($conn) {
    if (!isset($_GET['id'])) {
        sendError('Medicine ID is required');
    }
    
    $id = intval($_GET['id']);
    $sql = "DELETE FROM medicament WHERE id_medicament = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            sendResponse(['message' => 'Medicine deleted successfully']);
        } else {
            sendError('Medicine not found', 404);
        }
    } else {
        sendError('Failed to delete medicine', 500);
    }
}

$conn->close();
?>
