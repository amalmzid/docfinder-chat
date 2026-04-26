<?php
require_once 'backend/config/database.php';

$database = new Database();
$conn = $database->getConnection();

// Get table structure
$result = $conn->query("DESCRIBE docteur");
$fields = [];

while ($row = $result->fetch_assoc()) {
    $fields[] = $row;
}

// Get sample data
$sample = $conn->query("SELECT * FROM docteur LIMIT 1");
$sampleData = $sample->fetch_assoc();

header("Content-Type: application/json; charset=UTF-8");
echo json_encode([
    'fields' => $fields,
    'sample' => $sampleData
]);

$conn->close();
?>
