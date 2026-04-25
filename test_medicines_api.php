<?php
// Test the medicines API endpoint directly
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

try {
    require_once __DIR__ . '/backend/config/database.php';
    require_once __DIR__ . '/backend/helpers/response.php';
    
    $database = new Database();
    $conn = $database->getConnection();
    
    // Test the exact query from the medicines API
    $sql = "SELECT m.*, p.nom as pharmacy_name, p.horaireOuverture as pharmacy_horaire 
            FROM medicament m 
            LEFT JOIN pharmacie p ON m.id_pharmacie = p.id_pharmacie 
            ORDER BY m.nom ASC";
    
    $result = $conn->query($sql);
    
    $medicines = [];
    while ($row = $result->fetch_assoc()) {
        $medicines[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'count' => count($medicines),
        'data' => $medicines
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
