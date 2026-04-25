<?php
// Simple test to check if API works
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "Starting API test...<br>";

try {
    require_once __DIR__ . '/backend/config/database.php';
    require_once __DIR__ . '/backend/helpers/response.php';
    
    echo "Files loaded successfully<br>";
    
    $database = new Database();
    $conn = $database->getConnection();
    
    echo "Database connected<br>";
    
    // Test the exact query from API
    $id_pharmacie = 9;
    $sql = "SELECT * FROM medicament WHERE id_pharmacie = ? ORDER BY nom ASC";
    echo "SQL: $sql<br>";
    
    $stmt = $conn->prepare($sql);
    if ($stmt === false) {
        echo "Prepare failed: " . $conn->error . "<br>";
        exit;
    }
    echo "Statement prepared<br>";
    
    $stmt->bind_param("i", $id_pharmacie);
    echo "Parameter bound<br>";
    
    $result = $stmt->execute();
    if ($result === false) {
        echo "Execute failed: " . $stmt->error . "<br>";
        exit;
    }
    echo "Query executed<br>";
    
    $result = $stmt->get_result();
    echo "Result obtained<br>";
    
    $medicines = [];
    while ($row = $result->fetch_assoc()) {
        $medicines[] = $row;
    }
    
    echo "Found " . count($medicines) . " medicines<br>";
    
    // Try to send JSON response like the API
    header('Content-Type: application/json');
    echo json_encode($medicines);
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "<br>";
    echo "File: " . $e->getFile() . "<br>";
    echo "Line: " . $e->getLine() . "<br>";
}
?>
