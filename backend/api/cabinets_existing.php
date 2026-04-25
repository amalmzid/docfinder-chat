<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';

setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$db = new Database();
$conn = $db->getConnection();

// Since you don't have a cabinets table, I'll create a simplified version
// that works with your existing structure

switch ($method) {
    case 'GET':
        // Return empty list for now since cabinets table doesn't exist
        sendResponse([]);
        break;
        
    case 'POST':
        sendError('Cabinets table not found in current database structure', 501);
        break;
        
    case 'PUT':
        sendError('Cabinets table not found in current database structure', 501);
        break;
        
    case 'DELETE':
        sendError('Cabinets table not found in current database structure', 501);
        break;
        
    default:
        sendError('Method not allowed', 405);
}

$db->closeConnection();
?>
