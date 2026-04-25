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
            getRendezVousById($conn, $_GET['id']);
        } else {
            getAllRendezVous($conn);
        }
        break;
        
    case 'POST':
        createRendezVous($conn);
        break;
        
    case 'PUT':
        if (isset($_GET['id'])) {
            updateRendezVous($conn, $_GET['id']);
        } else {
            sendError('ID is required for update');
        }
        break;
        
    case 'DELETE':
        if (isset($_GET['id'])) {
            deleteRendezVous($conn, $_GET['id']);
        } else {
            sendError('ID is required for delete');
        }
        break;
        
    default:
        sendError('Method not allowed', 405);
}

$db->closeConnection();

// Functions
function getAllRendezVous($conn) {
    $sql = "SELECT rv.*, p.nom as patient_nom, d.nom as docteur_nom 
            FROM rendez_vous rv 
            LEFT JOIN patient p ON rv.id_patient = p.id_patient 
            LEFT JOIN docteur d ON rv.id_docteur = d.id_docteur 
            ORDER BY rv.date_rdv, rv.heure";
    
    $result = $conn->query($sql);
    $rendezVous = [];
    
    while ($row = $result->fetch_assoc()) {
        $rendezVous[] = $row;
    }
    
    sendResponse($rendezVous);
}

function getRendezVousById($conn, $id) {
    $stmt = $conn->prepare("SELECT rv.*, p.nom as patient_nom, d.nom as docteur_nom 
                           FROM rendez_vous rv 
                           LEFT JOIN patient p ON rv.id_patient = p.id_patient 
                           LEFT JOIN docteur d ON rv.id_docteur = d.id_docteur 
                           WHERE rv.id_rdv = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        sendResponse($result->fetch_assoc());
    } else {
        sendError('Rendez-vous not found', 404);
    }
}

function createRendezVous($conn) {
    $data = getRequestBody();
    
    if (!isset($data['date_rdv']) || !isset($data['heure']) || !isset($data['statut'])) {
        sendError('date_rdv, heure, and statut are required');
    }
    
    $sql = "INSERT INTO rendez_vous (date_rdv, heure, statut, id_patient, id_docteur) 
            VALUES (?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    $date_rdv = $data['date_rdv'];
    $heure = $data['heure'];
    $statut = $data['statut'];
    $id_patient = $data['id_patient'] ?? null;
    $id_docteur = $data['id_docteur'] ?? null;
    
    $stmt->bind_param("sssii", $date_rdv, $heure, $statut, $id_patient, $id_docteur);
    
    if ($stmt->execute()) {
        $data['id_rdv'] = $conn->insert_id;
        sendResponse($data, 201);
    } else {
        sendError('Failed to create rendez-vous');
    }
}

function updateRendezVous($conn, $id) {
    $data = getRequestBody();
    
    $sql = "UPDATE rendez_vous SET ";
    $updates = [];
    $types = "";
    $params = [];
    
    if (isset($data['date_rdv'])) {
        $updates[] = "date_rdv = ?";
        $types .= "s";
        $params[] = $data['date_rdv'];
    }
    
    if (isset($data['heure'])) {
        $updates[] = "heure = ?";
        $types .= "s";
        $params[] = $data['heure'];
    }
    
    if (isset($data['statut'])) {
        $updates[] = "statut = ?";
        $types .= "s";
        $params[] = $data['statut'];
    }
    
    if (isset($data['id_patient'])) {
        $updates[] = "id_patient = ?";
        $types .= "i";
        $params[] = $data['id_patient'];
    }
    
    if (isset($data['id_docteur'])) {
        $updates[] = "id_docteur = ?";
        $types .= "i";
        $params[] = $data['id_docteur'];
    }
    
    if (empty($updates)) {
        sendError('No valid fields to update');
    }
    
    $sql .= implode(", ", $updates) . " WHERE id_rdv = ?";
    $types .= "i";
    $params[] = $id;
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);
    
    if ($stmt->execute()) {
        sendResponse(['message' => 'Rendez-vous updated successfully']);
    } else {
        sendError('Failed to update rendez-vous');
    }
}

function deleteRendezVous($conn, $id) {
    $stmt = $conn->prepare("DELETE FROM rendez_vous WHERE id_rdv = ?");
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        sendResponse(['message' => 'Rendez-vous deleted successfully']);
    } else {
        sendError('Failed to delete rendez-vous');
    }
}

function getRequestBody() {
    $input = file_get_contents('php://input');
    return json_decode($input, true);
}
?>
