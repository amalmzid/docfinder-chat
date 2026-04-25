<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';

setCorsHeaders();

$database = new Database();
$conn = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    handleLogin($conn);
} else {
    sendError('Method not allowed', 405);
}

function handleLogin($conn) {
    $data = getRequestBody();
    
    if (!isset($data['email']) || !isset($data['mot_de_passe'])) {
        sendError('Email and password are required');
    }
    
    $email = $data['email'];
    $mot_de_passe = $data['mot_de_passe'];
    
    // First check if email and password columns exist, if not add them
    $checkColumns = $conn->query("SHOW COLUMNS FROM pharmacie WHERE Field IN ('email', 'mot_de_passe')");
    if ($checkColumns->num_rows < 2) {
        // Add missing columns
        if ($checkColumns->num_rows === 0) {
            $conn->query("ALTER TABLE pharmacie ADD COLUMN email VARCHAR(255) UNIQUE AFTER horaireOuverture");
            $conn->query("ALTER TABLE pharmacie ADD COLUMN mot_de_passe VARCHAR(255) AFTER email");
        } else {
            $conn->query("ALTER TABLE pharmacie ADD COLUMN mot_de_passe VARCHAR(255) AFTER email");
        }
    }
    
    $sql = "SELECT id_pharmacie, nom, email, mot_de_passe FROM pharmacie WHERE email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        sendError('Invalid email or password', 401);
    }
    
    $pharmacy = $result->fetch_assoc();
    
    // For now, use simple password comparison (in production, use password_hash/password_verify)
    if ($pharmacy['mot_de_passe'] !== $mot_de_passe) {
        sendError('Invalid email or password', 401);
    }
    
    // Remove password from response
    unset($pharmacy['mot_de_passe']);
    
    // Create session data
    $sessionData = [
        'user' => $pharmacy,
        'type' => 'pharmacy',
        'login_time' => date('Y-m-d H:i:s')
    ];
    
    sendResponse([
        'message' => 'Login successful',
        'pharmacy' => $pharmacy,
        'type' => 'pharmacy'
    ]);
}

$conn->close();
?>
