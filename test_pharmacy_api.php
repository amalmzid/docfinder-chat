<?php
// Test the pharmacy medicines API directly
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "Testing pharmacy medicines API...<br>";

try {
    require_once __DIR__ . '/backend/config/database.php';
    require_once __DIR__ . '/backend/helpers/response.php';
    
    $database = new Database();
    $conn = $database->getConnection();
    
    // Test with pharmacy ID 9
    $id_pharmacie = 9;
    echo "Testing with pharmacy ID: $id_pharmacie<br>";
    
    $sql = "SELECT * FROM medicament WHERE id_pharmacie = ? ORDER BY nom ASC";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id_pharmacie);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $medicines = [];
    while ($row = $result->fetch_assoc()) {
        $medicines[] = $row;
    }
    
    echo "Found " . count($medicines) . " medicines<br>";
    
    // Set proper headers like the API
    header('Content-Type: application/json');
    echo json_encode($medicines);
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "<br>";
}
?>
