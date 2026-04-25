<?php
// Direct test of the pharmacy medicines API
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "Testing pharmacy medicines API directly...<br>";

// Simulate the API call
$_GET['id_pharmacie'] = 9;

require_once __DIR__ . '/backend/config/database.php';
require_once __DIR__ . '/backend/helpers/response.php';

try {
    $database = new Database();
    $conn = $database->getConnection();
    
    echo "Database connected successfully<br>";
    
    $id_pharmacie = intval($_GET['id_pharmacie']);
    echo "Looking for medicines for pharmacy ID: $id_pharmacie<br>";
    
    // First check if pharmacy exists
    $stmt = $conn->prepare("SELECT id_pharmacie, nom FROM pharmacie WHERE id_pharmacie = ?");
    $stmt->bind_param("i", $id_pharmacie);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo "ERROR: Pharmacy $id_pharmacie not found<br>";
        exit;
    }
    
    $pharmacy = $result->fetch_assoc();
    echo "Found pharmacy: " . $pharmacy['nom'] . "<br>";
    
    // Now get medicines
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
    
    if (count($medicines) > 0) {
        echo "<h3>Medicines:</h3>";
        echo "<table border='1'>";
        echo "<tr><th>ID</th><th>Name</th><th>Category</th><th>Price</th><th>Available</th></tr>";
        foreach ($medicines as $med) {
            echo "<tr>";
            echo "<td>" . $med['id_medicament'] . "</td>";
            echo "<td>" . $med['nom'] . "</td>";
            echo "<td>" . $med['categorie'] . "</td>";
            echo "<td>$" . $med['prix'] . "</td>";
            echo "<td>" . ($med['disponibilite'] ? 'Yes' : 'No') . "</td>";
            echo "</tr>";
        }
        echo "</table>";
        
        // Show JSON response format
        echo "<h3>JSON Response (what the API should return):</h3>";
        echo "<pre>";
        echo json_encode($medicines, JSON_PRETTY_PRINT);
        echo "</pre>";
    } else {
        echo "No medicines found for this pharmacy<br>";
        
        // Check if there are any medicines at all
        $result = $conn->query("SELECT COUNT(*) as count FROM medicament");
        $count = $result->fetch_assoc();
        echo "Total medicines in database: " . $count['count'] . "<br>";
        
        if ($count['count'] > 0) {
            echo "Sample medicines from other pharmacies:<br>";
            $result = $conn->query("SELECT * FROM medicament LIMIT 3");
            while ($row = $result->fetch_assoc()) {
                echo "ID: " . $row['id_medicament'] . ", Name: " . $row['nom'] . ", Pharmacy: " . $row['id_pharmacie'] . "<br>";
            }
        }
    }
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "<br>";
    echo "Stack trace: " . $e->getTraceAsString() . "<br>";
}
?>
