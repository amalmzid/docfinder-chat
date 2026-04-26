<?php
// Test the doctors API response format
require_once 'backend/config/database.php';
require_once 'backend/helpers/response.php';

$database = new Database();
$conn = $database->getConnection();

// Test query
$sql = "SELECT * FROM docteur ORDER BY nom";
$result = $conn->query($sql);
$docteurs = [];

while ($row = $result->fetch_assoc()) {
    $docteurs[] = $row;
}

// Set headers and output
header("Content-Type: application/json; charset=UTF-8");
echo json_encode([
    'success' => true,
    'count' => count($docteurs),
    'data' => $docteurs
]);

$conn->close();
?>
