<?php
// Test script to debug pharmacy medicines API
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "Testing API...<br>";

try {
    require_once __DIR__ . '/backend/config/database.php';
    echo "Database config loaded<br>";
    
    $database = new Database();
    $conn = $database->getConnection();
    echo "Database connection established<br>";
    
    // Test the query
    $id_pharmacie = 9;
    $sql = "SELECT * FROM medicament WHERE id_pharmacie = ? ORDER BY nom ASC";
    echo "SQL: $sql<br>";
    
    $stmt = $conn->prepare($sql);
    echo "Statement prepared<br>";
    
    $stmt->bind_param("i", $id_pharmacie);
    echo "Parameters bound<br>";
    
    $stmt->execute();
    echo "Query executed<br>";
    
    $result = $stmt->get_result();
    echo "Result obtained<br>";
    
    $medicines = [];
    while ($row = $result->fetch_assoc()) {
        $medicines[] = $row;
    }
    
    echo "Medicines found: " . count($medicines) . "<br>";
    echo "<pre>";
    print_r($medicines);
    echo "</pre>";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "<br>";
    echo "Stack trace: " . $e->getTraceAsString() . "<br>";
}
?>
