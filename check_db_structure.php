<?php
require_once __DIR__ . '/backend/config/database.php';

echo "<h1>🔍 Database Structure Check</h1>";

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    echo "<h2>📊 Medicament Table Structure</h2>";
    $result = $conn->query("DESCRIBE medicament");
    
    if ($result) {
        echo "<table border='1' style='border-collapse: collapse; padding: 5px;'>";
        echo "<tr><th>Field</th><th>Type</th><th>Null</th><th>Key</th><th>Default</th><th>Extra</th></tr>";
        
        while ($row = $result->fetch_assoc()) {
            echo "<tr>";
            echo "<td>" . $row['Field'] . "</td>";
            echo "<td>" . $row['Type'] . "</td>";
            echo "<td>" . $row['Null'] . "</td>";
            echo "<td>" . $row['Key'] . "</td>";
            echo "<td>" . $row['Default'] . "</td>";
            echo "<td>" . $row['Extra'] . "</td>";
            echo "</tr>";
        }
        echo "</table>";
    } else {
        echo "❌ Error describing medicament table: " . $conn->error;
    }
    
    echo "<h2>🏥 Pharmacy Table Structure</h2>";
    $result = $conn->query("DESCRIBE pharmacie");
    
    if ($result) {
        echo "<table border='1' style='border-collapse: collapse; padding: 5px;'>";
        echo "<tr><th>Field</th><th>Type</th><th>Null</th><th>Key</th><th>Default</th><th>Extra</th></tr>";
        
        while ($row = $result->fetch_assoc()) {
            echo "<tr>";
            echo "<td>" . $row['Field'] . "</td>";
            echo "<td>" . $row['Type'] . "</td>";
            echo "<td>" . $row['Null'] . "</td>";
            echo "<td>" . $row['Key'] . "</td>";
            echo "<td>" . $row['Default'] . "</td>";
            echo "<td>" . $row['Extra'] . "</td>";
            echo "</tr>";
        }
        echo "</table>";
    } else {
        echo "❌ Error describing pharmacie table: " . $conn->error;
    }
    
    echo "<h2>📝 Sample Medicament Data</h2>";
    $result = $conn->query("SELECT * FROM medicament LIMIT 3");
    
    if ($result && $result->num_rows > 0) {
        echo "<table border='1' style='border-collapse: collapse; padding: 5px;'>";
        $first_row = $result->fetch_assoc();
        echo "<tr>";
        foreach (array_keys($first_row) as $key) {
            echo "<th>$key</th>";
        }
        echo "</tr>";
        
        // Reset result pointer and show first row
        $result->data_seek(0);
        while ($row = $result->fetch_assoc()) {
            echo "<tr>";
            foreach ($row as $value) {
                echo "<td>" . htmlspecialchars($value ?? 'NULL') . "</td>";
            }
            echo "</tr>";
        }
        echo "</table>";
    } else {
        echo "❌ No data in medicament table or error: " . $conn->error;
    }
    
    $db->closeConnection();
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage();
}
?>
