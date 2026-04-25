<?php
// Debug version of pharmacy medicines API
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "Debug: Starting API<br>";

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';

echo "Debug: Files loaded<br>";

setCorsHeaders();

echo "Debug: CORS headers set<br>";

$database = new Database();
$conn = $database->getConnection();

echo "Debug: Database connected<br>";

$method = $_SERVER['REQUEST_METHOD'];
echo "Debug: Method: $method<br>";

echo "Debug: GET params: ";
print_r($_GET);
echo "<br>";

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            echo "Debug: Getting single medicine<br>";
            $id = intval($_GET['id']);
            $sql = "SELECT * FROM medicament WHERE id_medicament = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows > 0) {
                sendResponse($result->fetch_assoc());
            } else {
                sendError('Medicine not found', 404);
            }
        } elseif (isset($_GET['id_pharmacie'])) {
            echo "Debug: Getting medicines by pharmacy<br>";
            $id_pharmacie = intval($_GET['id_pharmacie']);
            echo "Debug: Pharmacy ID: $id_pharmacie<br>";
            
            $sql = "SELECT * FROM medicament WHERE id_pharmacie = ? ORDER BY nom ASC";
            echo "Debug: SQL: $sql<br>";
            
            $stmt = $conn->prepare($sql);
            echo "Debug: Statement prepared<br>";
            
            $stmt->bind_param("i", $id_pharmacie);
            echo "Debug: Parameters bound<br>";
            
            $stmt->execute();
            echo "Debug: Query executed<br>";
            
            $result = $stmt->get_result();
            echo "Debug: Result obtained<br>";
            
            $medicines = [];
            while ($row = $result->fetch_assoc()) {
                $medicines[] = $row;
            }
            
            echo "Debug: Medicines count: " . count($medicines) . "<br>";
            
            sendResponse($medicines);
        } else {
            echo "Debug: No pharmacy ID provided<br>";
            sendError('Pharmacy ID is required', 400);
        }
        break;
    default:
        sendError('Method not allowed', 405);
}

echo "Debug: End of script<br>";
?>
