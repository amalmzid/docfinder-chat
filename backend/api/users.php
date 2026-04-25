<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';

setCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Extract endpoint from path
$endpoint = '';
if (preg_match('/\/api\/users\.php\/?(.*)?$/', $path, $matches)) {
    $endpoint = $matches[1] ?? '';
} elseif (preg_match('/\/api\/users\/?(.*)?$/', $path, $matches)) {
    $endpoint = $matches[1] ?? '';
}

// Debug logging
error_log("Method: $method, Path: $path, Endpoint: '$endpoint'");

$db = new Database();
$conn = $db->getConnection();

switch ($method) {
    case 'GET':
        if ($endpoint === '') {
            // Get all users (admin only)
            getUsers($conn);
        } elseif (preg_match('/(\d+)\/role/', $endpoint, $matches)) {
            // Update user role
            $userId = $matches[1];
            updateUserRole($conn, $userId);
        } elseif (is_numeric($endpoint)) {
            // Get user by ID
            $userId = $endpoint;
            getUserById($conn, $userId);
        } else {
            sendError('Invalid endpoint', 404);
        }
        break;
        
    case 'POST':
        if ($endpoint === 'login') {
            handleLogin($conn);
        } elseif ($endpoint === 'register' || $endpoint === '') {
            handleRegister($conn);
        } else {
            sendError('Invalid endpoint', 404);
        }
        break;
        
    case 'PUT':
        if (is_numeric($endpoint)) {
            $userId = $endpoint;
            updateUser($conn, $userId);
        } else {
            sendError('Invalid endpoint', 404);
        }
        break;
        
    case 'DELETE':
        if (is_numeric($endpoint)) {
            $userId = $endpoint;
            deleteUser($conn, $userId);
        } else {
            sendError('Invalid endpoint', 404);
        }
        break;
        
    default:
        sendError('Method not allowed', 405);
}

$db->closeConnection();

// Functions
function getUsers($conn) {
    // Get all users from different tables
    $users = [];
    
    // Get administrators
    $result = $conn->query("SELECT id_admin as id, nom, email, role, 'adminstrateur' as user_type FROM adminstrateur");
    while ($row = $result->fetch_assoc()) {
        $row['role'] = 'adminstrateur';
        $users[] = $row;
    }
    
    // Get doctors
    $result = $conn->query("SELECT id_docteur as id, nom, email, role, specialite, 'docteur' as user_type FROM docteur");
    while ($row = $result->fetch_assoc()) {
        $row['role'] = 'medecin';
        $users[] = $row;
    }
    
    // Get patients
    $result = $conn->query("SELECT id_patient as id, nom, email, role, 'patient' as user_type FROM patient");
    while ($row = $result->fetch_assoc()) {
        $row['role'] = 'patient';
        $users[] = $row;
    }
    
    sendResponse($users);
}

function getUserById($conn, $id) {
    // Search in all user tables
    $user = null;
    
    // Check administrators
    $stmt = $conn->prepare("SELECT id_admin as id, nom, email, role, 'adminstrateur' as user_type FROM adminstrateur WHERE id_admin = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        $user['role'] = 'adminstrateur';
    }
    
    // Check doctors
    if (!$user) {
        $stmt = $conn->prepare("SELECT id_docteur as id, nom, email, role, specialite, 'docteur' as user_type FROM docteur WHERE id_docteur = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result->num_rows > 0) {
            $user = $result->fetch_assoc();
            $user['role'] = 'medecin';
        }
    }
    
    // Check patients
    if (!$user) {
        $stmt = $conn->prepare("SELECT id_patient as id, nom, email, role, 'patient' as user_type FROM patient WHERE id_patient = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result->num_rows > 0) {
            $user = $result->fetch_assoc();
            $user['role'] = 'patient';
        }
    }
    
    if (!$user) {
        sendError('User not found', 404);
    }
    
    sendResponse($user);
}

function handleLogin($conn) {
    $data = getRequestBody();
    
    if (!isset($data['email']) || !isset($data['password'])) {
        sendError('Email and password are required');
    }
    
    $email = $data['email'];
    $password = $data['password'];
    
    // Check in administrators table
    $stmt = $conn->prepare("SELECT id_admin as id, nom, email, mot_de_passe, role, 'adminstrateur' as user_type FROM adminstrateur WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        // Check in doctors table
        $stmt = $conn->prepare("SELECT id_docteur as id, nom, email, mot_de_passe, role, specialite, 'docteur' as user_type FROM docteur WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            // Check in patients table
            $stmt = $conn->prepare("SELECT id_patient as id, nom, email, mot_de_passe, role, 'patient' as user_type FROM patient WHERE email = ?");
            $stmt->bind_param("s", $email);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows === 0) {
                sendError('Invalid credentials', 401);
            }
        }
    }
    
    $user = $result->fetch_assoc();
    
    // For existing data with plain text passwords, check directly
    // In production, you should hash all passwords
    if ($password !== $user['mot_de_passe']) {
        sendError('Invalid credentials', 401);
    }
    
    // Normalize role
    if ($user['user_type'] === 'adminstrateur') {
        $user['role'] = 'administrator';
    } elseif ($user['user_type'] === 'docteur') {
        $user['role'] = 'doctor';
    } else {
        $user['role'] = 'patient';
    }
    
    // Generate JWT token (simplified version)
    $token = generateJWT($user['id'], $user['email'], $user['role']);
    
    unset($user['mot_de_passe']);
    
    sendResponse([
        'user' => $user,
        'token' => $token
    ]);
}

function handleRegister($conn) {
    $data = getRequestBody();
    
    $required = ['nom', 'email', 'mot_de_passe', 'role'];
    foreach ($required as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            sendError("Field '$field' is required");
        }
    }
    
    $nom = $data['nom'];
    $email = $data['email'];
    $password = $data['mot_de_passe']; // Plain text for now, should be hashed in production
    $role = $data['role'];
    
    // Check if email already exists in any table
    $emailExists = false;
    
    $stmt = $conn->prepare("SELECT id_admin FROM adminstrateur WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    if ($stmt->get_result()->num_rows > 0) $emailExists = true;
    
    if (!$emailExists) {
        $stmt = $conn->prepare("SELECT id_docteur FROM docteur WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        if ($stmt->get_result()->num_rows > 0) $emailExists = true;
    }
    
    if (!$emailExists) {
        $stmt = $conn->prepare("SELECT id_patient FROM patient WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        if ($stmt->get_result()->num_rows > 0) $emailExists = true;
    }
    
    if ($emailExists) {
        sendError('Email already exists');
    }
    
    // Insert into appropriate table based on role
    if ($role === 'administrator') {
        $stmt = $conn->prepare("INSERT INTO adminstrateur (nom, email, mot_de_passe, role) VALUES (?, ?, ?, 'adminstrateur')");
        $stmt->bind_param("sss", $nom, $email, $password);
        $userId = $conn->insert_id;
    } elseif ($role === 'doctor') {
        $specialite = $data['specialite'] ?? 'General Medicine';
        $stmt = $conn->prepare("INSERT INTO docteur (nom, email, mot_de_passe, role, specialite) VALUES (?, ?, ?, 'medecin', ?)");
        $stmt->bind_param("ssss", $nom, $email, $password, $specialite);
        $userId = $conn->insert_id;
    } else {
        $stmt = $conn->prepare("INSERT INTO patient (nom, email, mot_de_passe, role) VALUES (?, ?, ?, 'patient')");
        $stmt->bind_param("sss", $nom, $email, $password);
        $userId = $conn->insert_id;
    }
    
    if ($stmt->execute()) {
        // Get the created user
        $user = getUserByIdFromTables($conn, $userId, $role);
        
        // Generate token
        $token = generateJWT($user['id'], $user['email'], $user['role']);
        
        sendResponse([
            'user' => $user,
            'token' => $token
        ], 201);
    } else {
        sendError('Registration failed');
    }
}

function getUserByIdFromTables($conn, $id, $role) {
    if ($role === 'administrator') {
        $stmt = $conn->prepare("SELECT id_admin as id, nom, email, role, 'adminstrateur' as user_type FROM adminstrateur WHERE id_admin = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $user = $result->fetch_assoc();
        $user['role'] = 'administrator';
    } elseif ($role === 'doctor') {
        $stmt = $conn->prepare("SELECT id_docteur as id, nom, email, role, specialite, 'docteur' as user_type FROM docteur WHERE id_docteur = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $user = $result->fetch_assoc();
        $user['role'] = 'doctor';
    } else {
        $stmt = $conn->prepare("SELECT id_patient as id, nom, email, role, 'patient' as user_type FROM patient WHERE id_patient = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $user = $result->fetch_assoc();
        $user['role'] = 'patient';
    }
    
    return $user;
}

function updateUserRole($conn, $id) {
    $data = getRequestBody();
    
    if (!isset($data['role'])) {
        sendError('Role is required');
    }
    
    $role = $data['role'];
    $validRoles = ['administrator', 'doctor', 'patient'];
    
    if (!in_array($role, $validRoles)) {
        sendError('Invalid role');
    }
    
    // This is complex with separate tables - for now, just return success
    // In a real implementation, you'd need to move users between tables
    sendResponse(['message' => 'User role update not implemented with current table structure']);
}

function updateUser($conn, $id) {
    $data = getRequestBody();
    
    // This would need to determine which table the user is in first
    // For now, return not implemented
    sendError('User update not implemented with current table structure');
}

function deleteUser($conn, $id) {
    // This would need to determine which table the user is in first
    // For now, return not implemented
    sendError('User delete not implemented with current table structure');
}

function generateJWT($userId, $email, $role) {
    // Simplified JWT generation - in production, use a proper JWT library
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload = json_encode([
        'user_id' => $userId,
        'email' => $email,
        'role' => $role,
        'exp' => time() + (60 * 60 * 24) // 24 hours
    ]);
    
    $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, 'your-secret-key', true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}
?>
