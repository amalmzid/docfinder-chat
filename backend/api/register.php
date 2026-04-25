<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';

setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $required = ['nom', 'email', 'mot_de_passe', 'role'];
    foreach ($required as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            sendError("Field '$field' is required");
        }
    }
    
    $nom = $data['nom'];
    $email = $data['email'];
    $password = $data['mot_de_passe'];
    $role = $data['role'];
    
    try {
        $database = new Database();
        $db = $database->getConnection();
        
        // Check if email already exists
        $stmt = $db->prepare("SELECT id_patient FROM patient WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        
        if ($stmt->get_result()->num_rows > 0) {
            sendError('Email already exists');
        }
        
        // Insert patient
        $stmt = $db->prepare("INSERT INTO patient (nom, email, mot_de_passe, role) VALUES (?, ?, ?, 'patient')");
        $stmt->bind_param("sss", $nom, $email, $password);
        
        if ($stmt->execute()) {
            $userId = $db->insert_id;
            
            // Get created user
            $stmt = $db->prepare("SELECT id_patient as id, nom, email, role, 'patient' as user_type FROM patient WHERE id_patient = ?");
            $stmt->bind_param("i", $userId);
            $stmt->execute();
            $result = $stmt->get_result();
            $user = $result->fetch_assoc();
            $user['role'] = 'patient';
            
            // Simple token
            $token = 'patient-token-' . $userId;
            
            sendResponse([
                'success' => true,
                'message' => 'Registration successful',
                'user' => $user,
                'token' => $token
            ], 201);
        } else {
            sendError('Registration failed');
        }
    } catch (Exception $e) {
        sendError('Server error: ' . $e->getMessage());
    }
} else {
    sendError('Method not allowed', 405);
}
?>
