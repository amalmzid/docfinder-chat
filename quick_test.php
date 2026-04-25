<?php
// Quick test to verify API works
header('Content-Type: application/json');

require_once __DIR__ . '/backend/config/database.php';
require_once __DIR__ . '/backend/helpers/response.php';

try {
    $database = new Database();
    $conn = $database->getConnection();
    
    // Test with pharmacy ID 9
    $id_pharmacie = 9;
    $sql = "SELECT * FROM medicament WHERE id_pharmacie = ? ORDER BY nom ASC";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id_pharmacie);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $medicines = [];
    while ($row = $result->fetch_assoc()) {
        $medicines[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'pharmacy_id' => $id_pharmacie,
        'count' => count($medicines),
        'medicines' => $medicines
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
