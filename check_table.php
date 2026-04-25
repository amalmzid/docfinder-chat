<?php
// Check medicament table structure
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    require_once __DIR__ . '/backend/config/database.php';
    $database = new Database();
    $conn = $database->getConnection();
    
    echo "Checking medicament table structure...<br>";
    
    // Check if table exists
    $result = $conn->query("SHOW TABLES LIKE 'medicament'");
    if ($result->num_rows === 0) {
        echo "ERROR: medicament table does not exist!<br>";
        
        // Show all tables
        echo "Available tables:<br>";
        $result = $conn->query("SHOW TABLES");
        while ($row = $result->fetch_row()) {
            echo "- " . $row[0] . "<br>";
        }
    } else {
        echo "medicament table exists<br>";
        
        // Show table structure
        echo "Table structure:<br>";
        $result = $conn->query("DESCRIBE medicament");
        echo "<table border='1'>";
        echo "<tr><th>Field</th><th>Type</th><th>Null</th><th>Key</th></tr>";
        while ($row = $result->fetch_assoc()) {
            echo "<tr>";
            echo "<td>" . $row['Field'] . "</td>";
            echo "<td>" . $row['Type'] . "</td>";
            echo "<td>" . $row['Null'] . "</td>";
            echo "<td>" . $row['Key'] . "</td>";
            echo "</tr>";
        }
        echo "</table>";
        
        // Check if there's any data
        $result = $conn->query("SELECT COUNT(*) as count FROM medicament");
        $count = $result->fetch_assoc();
        echo "Total records: " . $count['count'] . "<br>";
        
        // Show some sample data
        if ($count['count'] > 0) {
            echo "Sample data:<br>";
            $result = $conn->query("SELECT * FROM medicament LIMIT 5");
            echo "<table border='1'>";
            echo "<tr>";
            $fields = $result->fetch_fields();
            foreach ($fields as $field) {
                echo "<th>" . $field->name . "</th>";
            }
            echo "</tr>";
            while ($row = $result->fetch_assoc()) {
                echo "<tr>";
                foreach ($row as $value) {
                    echo "<td>" . $value . "</td>";
                }
                echo "</tr>";
            }
            echo "</table>";
        }
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "<br>";
}
?>
