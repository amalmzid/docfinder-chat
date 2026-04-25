<?php
function authenticateToken() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? null;
    
    if (!$authHeader || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        return null;
    }
    
    $token = $matches[1];
    return validateJWT($token);
}

function validateJWT($token) {
    $parts = explode('.', $token);
    
    if (count($parts) !== 3) {
        return null;
    }
    
    // Use URL-safe base64 decode
    $header = json_decode(base64_decode(strtr($parts[0], '-_', '+/')), true);
    $payload = json_decode(base64_decode(strtr($parts[1], '-_', '+/')), true);
    $signature = $parts[2];
    
    // Verify signature using URL-safe encoding
    $expectedSignature = base64_encode(strtr(hash_hmac('sha256', $parts[0] . "." . $parts[1], 'your-secret-key', true), '+/', '-_'));
    
    if (!hash_equals($signature, $expectedSignature)) {
        return null;
    }
    
    $payload = json_decode($payload, true);
    
    // Check expiration
    if (isset($payload['exp']) && $payload['exp'] < time()) {
        return null;
    }
    
    return $payload;
}

function requireAuth() {
    $user = authenticateToken();
    
    if (!$user) {
        sendError('Unauthorized - Invalid or missing token', 401);
    }
    
    return $user;
}

function sendError($message, $code = 400) {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => $message]);
    exit;
}

// Test the fixed authentication
echo "Testing fixed JWT authentication...\n";

$testToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxMiwicm9sZSI6ImRvY3RvciIsImV4cCI6MTc3NjYxNTQ1MX0=.MXtMqg8xwdTNZZs3AcTV2VF/sybT2pBz4nmuST/ZULE=";

$_SERVER['HTTP_AUTHORIZATION'] = 'Bearer ' . $testToken;

$user = authenticateToken();

if ($user) {
    echo "✅ Authentication SUCCESS with fixed helper!\n";
    echo "User ID: " . $user['user_id'] . "\n";
    echo "Role: " . $user['role'] . "\n";
} else {
    echo "❌ Authentication FAILED with fixed helper!\n";
}
?>
