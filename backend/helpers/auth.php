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
    
    // Use regular base64 decode to match login system
    $header = json_decode(base64_decode($parts[0]), true);
    $payload = json_decode(base64_decode($parts[1]), true);
    $signature = $parts[2];
    
    // Verify signature using regular encoding to match login system
    $expectedSignature = base64_encode(hash_hmac('sha256', $parts[0] . "." . $parts[1], 'your-secret-key', true));
    
    if (!hash_equals($signature, $expectedSignature)) {
        return null;
    }
    
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

function requireRole($requiredRole) {
    $user = requireAuth();
    
    if ($user['role'] !== $requiredRole) {
        sendError('Forbidden - Insufficient permissions', 403);
    }
    
    return $user;
}

function requireAnyRole($allowedRoles) {
    $user = requireAuth();
    
    if (!in_array($user['role'], $allowedRoles)) {
        sendError('Forbidden - Insufficient permissions', 403);
    }
    
    return $user;
}
?>
