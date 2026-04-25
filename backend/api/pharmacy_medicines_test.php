<?php
// Minimal test version of pharmacy medicines API
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';

setCorsHeaders();

$database = new Database();
$conn = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (isset($_GET['id_pharmacie'])) {
        $id_pharmacie = intval($_GET['id_pharmacie']);
        
        // Simple query
        $sql = "SELECT * FROM medicament WHERE id_pharmacie = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id_pharmacie);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $medicines = [];
        while ($row = $result->fetch_assoc()) {
            $medicines[] = $row;
        }
        
        // Send response manually
        header('Content-Type: application/json');
        http_response_code(200);
        echo json_encode($medicines);
        exit;
    } else {
        header('Content-Type: application/json');
        http_response_code(400);
        echo json_encode(['error' => 'Pharmacy ID is required']);
        exit;
    }
} else {
    header('Content-Type: application/json');
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}
?>
