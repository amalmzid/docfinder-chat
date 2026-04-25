<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/database.php';

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['email']) || !isset($data['password'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Email and password are required'
    ]);
    exit;
}

$email = $data['email'];
$password = $data['password'];

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Check in administrators table first
    $query = "SELECT id_admin as id, nom, email, mot_de_passe, role, 'adminstrateur' as user_type FROM adminstrateur WHERE email = ?";
    $stmt = $db->prepare($query);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        
        // Verify password (plain text for existing data)
        if ($password === $user['mot_de_passe']) {
            echo json_encode([
                'success' => true,
                'message' => 'Login successful',
                'token' => 'admin-token-' . $user['id'], // Simple token for now
                'userType' => 'administrator',
                'userId' => $user['id'],
                'userData' => [
                    'id' => $user['id'],
                    'name' => $user['nom'],
                    'email' => $user['email'],
                    'role' => 'administrator'
                ]
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Invalid password'
            ]);
        }
    } else {
        // Check in doctors table
        $query = "SELECT id_docteur as id, nom, email, mot_de_passe, role, specialite, 'docteur' as user_type FROM docteur WHERE email = ?";
        $stmt = $db->prepare($query);
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $user = $result->fetch_assoc();
            
            // Verify password
            if ($password === $user['mot_de_passe']) {
                // Generate proper JWT token
                $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
                $payload = json_encode([
                    'user_id' => $user['id'],
                    'role' => 'doctor',
                    'exp' => time() + (24 * 60 * 60) // 24 hours
                ]);
                
                $headerEncoded = base64_encode($header);
                $payloadEncoded = base64_encode($payload);
                $signature = hash_hmac('sha256', $headerEncoded . "." . $payloadEncoded, 'your-secret-key', true);
                $signatureEncoded = base64_encode($signature);
                
                $jwt = $headerEncoded . "." . $payloadEncoded . "." . $signatureEncoded;
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Login successful',
                    'token' => $jwt,
                    'userType' => 'doctor',
                    'userId' => $user['id'],
                    'userData' => [
                        'id' => $user['id'],
                        'name' => $user['nom'],
                        'email' => $user['email'],
                        'specialty' => $user['specialite'],
                        'role' => 'doctor'
                    ]
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'Invalid password'
                ]);
            }
        } else {
            // Check in patients table
            $query = "SELECT id_patient as id, nom, email, mot_de_passe, role, 'patient' as user_type FROM patient WHERE email = ?";
            $stmt = $db->prepare($query);
            $stmt->bind_param("s", $email);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows > 0) {
                $user = $result->fetch_assoc();
                
                // Verify password
                if ($password === $user['mot_de_passe']) {
                    // Generate proper JWT token
                    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
                    $payload = json_encode([
                        'user_id' => $user['id'],
                        'role' => 'patient',
                        'exp' => time() + (24 * 60 * 60) // 24 hours
                    ]);
                    
                    $headerEncoded = base64_encode($header);
                    $payloadEncoded = base64_encode($payload);
                    $signature = hash_hmac('sha256', $headerEncoded . "." . $payloadEncoded, 'your-secret-key', true);
                    $signatureEncoded = base64_encode($signature);
                    
                    $jwt = $headerEncoded . "." . $payloadEncoded . "." . $signatureEncoded;
                    
                    echo json_encode([
                        'success' => true,
                        'message' => 'Login successful',
                        'token' => $jwt,
                        'userType' => 'patient',
                        'userId' => $user['id'],
                        'userData' => [
                            'id' => $user['id'],
                            'name' => $user['nom'],
                            'email' => $user['email'],
                            'role' => 'patient'
                        ]
                    ]);
                } else {
                    echo json_encode([
                        'success' => false,
                        'message' => 'Invalid password'
                    ]);
                }
            } else {
                // Check in pharmacies table
                $query = "SELECT id_pharmacie as id, nom, email, mot_de_passe, adresse, horaireOuverture, 'pharmacy' as user_type FROM pharmacie WHERE email = ?";
                $stmt = $db->prepare($query);
                $stmt->bind_param("s", $email);
                $stmt->execute();
                $result = $stmt->get_result();
                
                if ($result->num_rows > 0) {
                    $user = $result->fetch_assoc();
                    
                    // Verify password
                    if ($password === $user['mot_de_passe']) {
                        // Generate proper JWT token
                        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
                        $payload = json_encode([
                            'user_id' => $user['id'],
                            'role' => 'pharmacy',
                            'exp' => time() + (24 * 60 * 60) // 24 hours
                        ]);
                        
                        $headerEncoded = base64_encode($header);
                        $payloadEncoded = base64_encode($payload);
                        $signature = hash_hmac('sha256', $headerEncoded . "." . $payloadEncoded, 'your-secret-key', true);
                        $signatureEncoded = base64_encode($signature);
                        
                        $jwt = $headerEncoded . "." . $payloadEncoded . "." . $signatureEncoded;
                        
                        echo json_encode([
                            'success' => true,
                            'message' => 'Login successful',
                            'token' => $jwt,
                            'userType' => 'pharmacy',
                            'userId' => $user['id'],
                            'userData' => [
                                'id' => $user['id'],
                                'name' => $user['nom'],
                                'email' => $user['email'],
                                'address' => $user['adresse'],
                                'openingHours' => $user['horaireOuverture'],
                                'role' => 'pharmacy'
                            ]
                        ]);
                    } else {
                        echo json_encode([
                            'success' => false,
                            'message' => 'Invalid password'
                        ]);
                    }
                } else {
                    echo json_encode([
                        'success' => false,
                        'message' => 'User not found'
                    ]);
                }
            }
        }
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
?>
