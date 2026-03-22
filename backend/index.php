<?php
/**
 * Heal-U Backend API Entry Point
 * 
 * This file serves as the main entry point for the Heal-U backend API.
 * It handles routing, request processing, and response formatting.
 */

// Set response headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Include configuration and helpers
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/helpers/response.php';
// require_once __DIR__ . '/helpers/auth.php';

// Get the request method and path
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Remove the /heal-u/backend prefix if present
if (strpos($path, '/heal-u/backend') === 0) {
    $path = substr($path, strlen('/heal-u/backend'));
} elseif (strpos($path, '/heal-u') === 0) {
    $path = substr($path, strlen('/heal-u'));
}

// Basic routing
switch ($path) {
    case '/':
    case '/health':
        send_response(['status' => 'ok', 'message' => 'Heal-U API is running']);
        break;
/*        
    case '/api/auth/login':
        if ($method === 'POST') {
            require_once __DIR__ . '/api/auth.php';
            handleLogin();
        } else {
            send_error('Method not allowed', 405);
        }
        break;
        
    case '/api/auth/register':
        if ($method === 'POST') {
            require_once __DIR__ . '/api/auth.php';
            handleRegister();
        } else {
            send_error('Method not allowed', 405);
        }
        break;
        
    case '/api/appointments':
        if ($method === 'GET') {
            require_once __DIR__ . '/api/appointments.php';
            getAppointments();
        } elseif ($method === 'POST') {
            require_once __DIR__ . '/api/appointments.php';
            createAppointment();
        } else {
            send_error('Method not allowed', 405);
        }
        break;
        
    case '/api/consultations':
        if ($method === 'GET') {
            require_once __DIR__ . '/api/consultations.php';
            getConsultations();
        } elseif ($method === 'POST') {
            require_once __DIR__ . '/api/consultations.php';
            createConsultation();
        } else {
            send_error('Method not allowed', 405);
        }
        break;
        */
    case '/api/pharmacies':
        require_once __DIR__ . '/api/pharmacies.php';
        break;
        
    default:
        // Check if it's a pharmacy endpoint with ID (for GET, PUT, DELETE with ?id=)
        if (strpos($path, '/api/pharmacies') === 0) {
            require_once __DIR__ . '/api/pharmacies.php';
        } else {
            echo json_encode(['error' => 'Endpoint not found', 'request_uri' => $path]);
        }
        break;
}
?>
