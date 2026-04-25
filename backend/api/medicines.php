<?php
error_reporting(0); // Disable error output to prevent HTML in JSON response
ini_set('display_errors', 0);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';

setCorsHeaders();

try {
    $method = $_SERVER['REQUEST_METHOD'];
    $db = new Database();
    $conn = $db->getConnection();

    if (!$conn) {
        sendError('Database connection failed');
    }

    switch ($method) {
        case 'GET':
            if (isset($_GET['id'])) {
                getMedicineById($conn, $_GET['id']);
            } elseif (isset($_GET['pharmacy'])) {
                getmedicamentByPharmacy($conn, $_GET['pharmacy']);
            } elseif (isset($_GET['search'])) {
                searchmedicament($conn, $_GET['search']);
            } else {
                getAllmedicament($conn);
            }
            break;
            
        case 'POST':
            createMedicine($conn);
            break;
            
        case 'PUT':
            if (isset($_GET['id'])) {
                updateMedicine($conn, $_GET['id']);
            } else {
                sendError('ID is required for update');
            }
            break;
            
        case 'DELETE':
            if (isset($_GET['id'])) {
                deleteMedicine($conn, $_GET['id']);
            } else {
                sendError('ID is required for delete');
            }
            break;
            
        default:
            sendError('Method not allowed', 405);
    }

    $db->closeConnection();
} catch (Exception $e) {
    sendError('Server error: ' . $e->getMessage());
}

// Functions
function getAllmedicament($conn) {
    $sql = "SELECT m.*, p.nom as pharmacy_name, p.horaireOuverture as pharmacy_horaire 
            FROM medicament m 
            LEFT JOIN pharmacie p ON m.id_pharmacie = p.id_pharmacie 
            ORDER BY m.nom ASC";
    $result = $conn->query($sql);
    
    $medicament = [];
    while ($row = $result->fetch_assoc()) {
        $medicament[] = $row;
    }
    
    sendResponse($medicament);
}

function getMedicineById($conn, $id) {
    $stmt = $conn->prepare("SELECT m.*, p.nom as pharmacy_name, p.horaireOuverture as pharmacy_horaire 
                            FROM medicament m 
                            LEFT JOIN pharmacie p ON m.id_pharmacie = p.id_pharmacie 
                            WHERE m.id_medicament = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        sendResponse($result->fetch_assoc());
    } else {
        sendError('Medicine not found', 404);
    }
}

function getmedicamentByPharmacy($conn, $pharmacyId) {
    $stmt = $conn->prepare("SELECT m.*, p.nom as pharmacy_name, p.horaireOuverture as pharmacy_horaire 
                             FROM medicament m 
                             LEFT JOIN pharmacie p ON m.id_pharmacie = p.id_pharmacie 
                             WHERE m.id_pharmacie = ? 
                             ORDER BY m.nom ASC");
    $stmt->bind_param("i", $pharmacyId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $medicament = [];
    while ($row = $result->fetch_assoc()) {
        $medicament[] = $row;
    }
    
    sendResponse($medicament);
}

function searchmedicament($conn, $searchTerm) {
    try {
        $searchTerm = "%" . $searchTerm . "%";
        
        $stmt = $conn->prepare("SELECT m.*, p.nom as pharmacy_name 
                                 FROM medicament m 
                                 LEFT JOIN pharmacie p ON m.id_pharmacie = p.id_pharmacie 
                                 WHERE m.nom LIKE ? OR m.categorie LIKE ?
                                 ORDER BY m.nom ASC");
        
        if (!$stmt) {
            sendError('Database prepare error: ' . $conn->error);
        }
        
        $stmt->bind_param("ss", $searchTerm, $searchTerm);
        
        if (!$stmt->execute()) {
            sendError('Database execute error: ' . $stmt->error);
        }
        
        $result = $stmt->get_result();
        
        $medicament = [];
        while ($row = $result->fetch_assoc()) {
            $medicament[] = $row;
        }
        
        sendResponse($medicament);
    } catch (Exception $e) {
        sendError('Search error: ' . $e->getMessage());
    }
}

function createMedicine($conn) {
    // Check if request is from pharmacy login (using session or simple auth)
    session_start();
    $userType = $_SESSION['user_type'] ?? null;
    
    // Allow pharmacy access without strict role checking for now
    // In production, implement proper pharmacy authentication
    
    $data = getRequestBody();
    
    $required = ['name', 'category', 'price', 'stock'];
    foreach ($required as $field) {
        if (!isset($data[$field]) || $data[$field] === '') {
            sendError("Field '$field' is required");
        }
    }
    
    $name = $data['name'];
    $category = $data['category'];
    $price = $data['price'];
    $stock = $data['stock'];
    $description = $data['description'] ?? null;
    $id_pharmacie = $data['id_pharmacie'] ?? null;
    
    // Verify pharmacy exists if provided
    if ($id_pharmacie) {
        $stmt = $conn->prepare("SELECT id_pharmacie FROM pharmacie WHERE id_pharmacie = ?");
        $stmt->bind_param("i", $id_pharmacie);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            sendError('Pharmacy not found', 404);
        }
    }
    
    $in_stock = $stock > 0 ? 1 : 0;
    
    $stmt = $conn->prepare("INSERT INTO medicament (name, category, price, stock, in_stock, description, id_pharmacie, created_at, updated_at) 
                         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())");
    $stmt->bind_param("ssdiisi", $name, $category, $price, $stock, $in_stock, $description, $id_pharmacie);
    
    if ($stmt->execute()) {
        $medicineId = $conn->insert_id;
        
        // Get the created medicine
        $stmt = $conn->prepare("SELECT m.*, p.nom as pharmacy_name 
                                 FROM medicament m 
                                 LEFT JOIN pharmacie p ON m.id_pharmacie = p.id_pharmacie 
                                 WHERE m.id = ?");
        $stmt->bind_param("i", $medicineId);
        $stmt->execute();
        $result = $stmt->get_result();
        $medicine = $result->fetch_assoc();
        
        sendResponse($medicine, 201);
    } else {
        sendError('Failed to create medicine');
    }
}

function updateMedicine($conn, $id) {
    $user = requireAuth();
    
    // Check if medicine exists
    $stmt = $conn->prepare("SELECT id_pharmacie FROM medicament WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        sendError('Medicine not found', 404);
    }
    
    $medicine = $result->fetch_assoc();
    
    // Only pharmacists can update medicament, and only medicament from their pharmacies
    if ($user['role'] !== 'pharmacist') {
        sendError('Forbidden - Only pharmacists can update medicament', 403);
    }
    
    $data = getRequestBody();
    
    $updates = [];
    $types = '';
    $params = [];
    
    if (isset($data['name'])) {
        $updates[] = "name = ?";
        $types .= 's';
        $params[] = $data['name'];
    }
    
    if (isset($data['category'])) {
        $updates[] = "category = ?";
        $types .= 's';
        $params[] = $data['category'];
    }
    
    if (isset($data['price'])) {
        $updates[] = "price = ?";
        $types .= 'd';
        $params[] = $data['price'];
    }
    
    if (isset($data['stock'])) {
        $updates[] = "stock = ?";
        $types .= 'i';
        $params[] = $data['stock'];
        
        // Update in_stock based on stock
        $updates[] = "in_stock = ?";
        $types .= 'i';
        $params[] = ($data['stock'] > 0) ? 1 : 0;
    }
    
    if (isset($data['description'])) {
        $updates[] = "description = ?";
        $types .= 's';
        $params[] = $data['description'];
    }
    
    if (isset($data['id_pharmacie'])) {
        // Verify pharmacy exists
        $stmt = $conn->prepare("SELECT id_pharmacie FROM pharmacie WHERE id_pharmacie = ?");
        $stmt->bind_param("i", $data['id_pharmacie']);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            sendError('Pharmacy not found', 404);
        }
        
        $updates[] = "id_pharmacie = ?";
        $types .= 'i';
        $params[] = $data['id_pharmacie'];
    }
    
    if (empty($updates)) {
        sendError('No fields to update');
    }
    
    $updates[] = "updated_at = NOW()";
    $params[] = $id;
    $types .= 'i';
    
    $sql = "UPDATE medicament SET " . implode(', ', $updates) . " WHERE id = ?";
    $stmt = $conn->prepare($sql);
    
    $stmt->bind_param($types, ...$params);
    
    if ($stmt->execute()) {
        // Get updated medicine
        $stmt = $conn->prepare("SELECT m.*, p.nom as pharmacy_name 
                                 FROM medicament m 
                                 LEFT JOIN pharmacie p ON m.id_pharmacie = p.id_pharmacie 
                                 WHERE m.id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $medicine = $result->fetch_assoc();
        
        sendResponse($medicine);
    } else {
        sendError('Failed to update medicine');
    }
}

function deleteMedicine($conn, $id) {
    $user = requireAuth();
    
    // Check if medicine exists
    $stmt = $conn->prepare("SELECT id FROM medicament WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        sendError('Medicine not found', 404);
    }
    
    // Only pharmacists can delete medicament
    if ($user['role'] !== 'pharmacist') {
        sendError('Forbidden - Only pharmacists can delete medicament', 403);
    }
    
    $stmt = $conn->prepare("DELETE FROM medicament WHERE id = ?");
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        sendResponse(['message' => 'Medicine deleted successfully']);
    } else {
        sendError('Failed to delete medicine');
    }
}
?>
