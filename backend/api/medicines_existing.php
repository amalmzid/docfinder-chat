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
            getMedicineById($conn, $_GET['id']);
        } elseif (isset($_GET['search'])) {
            searchMedicines($conn, $_GET['search']);
        } else {
            getAllMedicines($conn);
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

// Functions
function getAllMedicines($conn) {
    $sql = "SELECT m.*, p.nom as pharmacy_name 
            FROM medicament m 
            LEFT JOIN pharmacie p ON m.id_pharmacie = p.id_pharmacie 
            ORDER BY m.nom ASC";
    $result = $conn->query($sql);
    
    $medicines = [];
    while ($row = $result->fetch_assoc()) {
        // Map field names to match frontend expectations
        $medicine = [
            'id' => $row['id_medicament'],
            'name' => $row['nom'],
            'category' => $row['categorie'],
            'price' => $row['prix'],
            'in_stock' => $row['disponibilite'],
            'stock' => $row['disponibilite'] ? 100 : 0, // Default stock based on availability
            'description' => 'Medication for ' . $row['categorie'],
            'id_pharmacie' => $row['id_pharmacie'] ?? null,
            'pharmacy_name' => $row['pharmacy_name']
        ];
        $medicines[] = $medicine;
    }
    
    sendResponse($medicines);
}

function getMedicineById($conn, $id) {
    $stmt = $conn->prepare("SELECT m.*, p.nom as pharmacy_name 
                             FROM medicament m 
                             LEFT JOIN pharmacie p ON m.id_pharmacie = p.id_pharmacie 
                             WHERE m.id_medicament = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        sendError('Medicine not found', 404);
    }
    
    $row = $result->fetch_assoc();
    
    // Map field names to match frontend expectations
    $medicine = [
        'id' => $row['id_medicament'],
        'name' => $row['nom'],
        'category' => $row['categorie'],
        'price' => $row['prix'],
        'in_stock' => $row['disponibilite'],
        'stock' => $row['disponibilite'] ? 100 : 0,
        'description' => 'Medication for ' . $row['categorie'],
        'id_pharmacie' => $row['id_pharmacie'] ?? null,
        'pharmacy_name' => $row['pharmacy_name']
    ];
    
    sendResponse($medicine);
}

function searchMedicines($conn, $searchTerm) {
    $searchTerm = "%" . $searchTerm . "%";
    
    $stmt = $conn->prepare("SELECT m.*, p.nom as pharmacy_name 
                             FROM medicament m 
                             LEFT JOIN pharmacie p ON m.id_pharmacie = p.id_pharmacie 
                             WHERE m.nom LIKE ? OR m.categorie LIKE ?
                             ORDER BY m.nom ASC");
    $stmt->bind_param("ss", $searchTerm, $searchTerm);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $medicines = [];
    while ($row = $result->fetch_assoc()) {
        $medicine = [
            'id' => $row['id_medicament'],
            'name' => $row['nom'],
            'category' => $row['categorie'],
            'price' => $row['prix'],
            'in_stock' => $row['disponibilite'],
            'stock' => $row['disponibilite'] ? 100 : 0,
            'description' => 'Medication for ' . $row['categorie'],
            'id_pharmacie' => $row['id_pharmacie'] ?? null,
            'pharmacy_name' => $row['pharmacy_name']
        ];
        $medicines[] = $medicine;
    }
    
    sendResponse($medicines);
}

function createMedicine($conn) {
    $user = requireAuth();
    
    // Only pharmacists can create medicines
    if ($user['role'] !== 'pharmacist') {
        sendError('Forbidden - Only pharmacists can create medicines', 403);
    }
    
    $data = getRequestBody();
    
    $required = ['name', 'category', 'price'];
    foreach ($required as $field) {
        if (!isset($data[$field]) || $data[$field'] === '') {
            sendError("Field '$field' is required");
        }
    }
    
    $name = $data['name'];
    $category = $data['category'];
    $price = $data['price'];
    $disponibilite = $data['in_stock'] ?? 1;
    
    $stmt = $conn->prepare("INSERT INTO medicament (nom, categorie, prix, disponibilite) 
                         VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssdi", $name, $category, $price, $disponibilite);
    
    if ($stmt->execute()) {
        $medicineId = $conn->insert_id;
        
        // Get the created medicine
        $stmt = $conn->prepare("SELECT * FROM medicament WHERE id_medicament = ?");
        $stmt->bind_param("i", $medicineId);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        
        // Map field names
        $medicine = [
            'id' => $row['id_medicament'],
            'name' => $row['nom'],
            'category' => $row['categorie'],
            'price' => $row['prix'],
            'in_stock' => $row['disponibilite'],
            'stock' => $row['disponibilite'] ? 100 : 0,
            'description' => 'Medication for ' . $row['categorie']
        ];
        
        sendResponse($medicine, 201);
    } else {
        sendError('Failed to create medicine');
    }
}

function updateMedicine($conn, $id) {
    $user = requireAuth();
    
    // Check if medicine exists
    $stmt = $conn->prepare("SELECT id_medicament FROM medicament WHERE id_medicament = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        sendError('Medicine not found', 404);
    }
    
    // Only pharmacists can update medicines
    if ($user['role'] !== 'pharmacist') {
        sendError('Forbidden - Only pharmacists can update medicines', 403);
    }
    
    $data = getRequestBody();
    
    $updates = [];
    $types = '';
    $params = [];
    
    if (isset($data['name'])) {
        $updates[] = "nom = ?";
        $types .= 's';
        $params[] = $data['name'];
    }
    
    if (isset($data['category'])) {
        $updates[] = "categorie = ?";
        $types .= 's';
        $params[] = $data['category'];
    }
    
    if (isset($data['price'])) {
        $updates[] = "prix = ?";
        $types .= 'd';
        $params[] = $data['price'];
    }
    
    if (isset($data['in_stock'])) {
        $updates[] = "disponibilite = ?";
        $types .= 'i';
        $params[] = $data['in_stock'];
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
        // Get updated medicine
        $stmt = $conn->prepare("SELECT * FROM medicament WHERE id_medicament = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        
        // Map field names
        $medicine = [
            'id' => $row['id_medicament'],
            'name' => $row['nom'],
            'category' => $row['categorie'],
            'price' => $row['prix'],
            'in_stock' => $row['disponibilite'],
            'stock' => $row['disponibilite'] ? 100 : 0,
            'description' => 'Medication for ' . $row['categorie']
        ];
        
        sendResponse($medicine);
    } else {
        sendError('Failed to update medicine');
    }
}

function deleteMedicine($conn, $id) {
    $user = requireAuth();
    
    // Check if medicine exists
    $stmt = $conn->prepare("SELECT id_medicament FROM medicament WHERE id_medicament = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        sendError('Medicine not found', 404);
    }
    
    // Only pharmacists can delete medicines
    if ($user['role'] !== 'pharmacist') {
        sendError('Forbidden - Only pharmacists can delete medicines', 403);
    }
    
    $stmt = $conn->prepare("DELETE FROM medicament WHERE id_medicament = ?");
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        sendResponse(['message' => 'Medicine deleted successfully']);
    } else {
        sendError('Failed to delete medicine');
    }
}
?>
