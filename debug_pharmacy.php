<?php
// Debug script to check pharmacy and medicines
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "Debugging Pharmacy API...<br>";

try {
    require_once __DIR__ . '/backend/config/database.php';
    $database = new Database();
    $conn = $database->getConnection();
    
    // Check if pharmacy 9 exists
    echo "Checking if pharmacy 9 exists...<br>";
    $stmt = $conn->prepare("SELECT id_pharmacie, nom FROM pharmacie WHERE id_pharmacie = ?");
    $stmt->bind_param("i", $id_pharmacie);
    $id_pharmacie = 9;
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $pharmacy = $result->fetch_assoc();
        echo "Pharmacy found: " . $pharmacy['nom'] . "<br>";
        
        // Check medicines for this pharmacy
        echo "Checking medicines for pharmacy 9...<br>";
        $stmt = $conn->prepare("SELECT COUNT(*) as count FROM medicament WHERE id_pharmacie = ?");
        $stmt->bind_param("i", $id_pharmacie);
        $stmt->execute();
        $result = $stmt->get_result();
        $count = $result->fetch_assoc();
        echo "Medicines count: " . $count['count'] . "<br>";
        
        // Get actual medicines
        $stmt = $conn->prepare("SELECT * FROM medicament WHERE id_pharmacie = ? ORDER BY nom ASC");
        $stmt->bind_param("i", $id_pharmacie);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $medicines = [];
        while ($row = $result->fetch_assoc()) {
            $medicines[] = $row;
        }
        
        echo "Medicines data:<br>";
        echo "<pre>";
        print_r($medicines);
        echo "</pre>";
        
    } else {
        echo "Pharmacy 9 not found!<br>";
        
        // Show available pharmacies
        echo "Available pharmacies:<br>";
        $result = $conn->query("SELECT id_pharmacie, nom FROM pharmacie ORDER BY id_pharmacie");
        while ($row = $result->fetch_assoc()) {
            echo "ID: " . $row['id_pharmacie'] . " - " . $row['nom'] . "<br>";
        }
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "<br>";
}
?>
