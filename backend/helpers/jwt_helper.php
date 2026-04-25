<?php
function generateJWT($userId, $userType) {
    $secretKey = 'your-secret-key-change-this-in-production';
    $issuer = 'heal-u';
    $issuedAt = time();
    $expirationTime = $issuedAt + 3600; // 1 hour
    
    $payload = [
        'iss' => $issuer,
        'iat' => $issuedAt,
        'exp' => $expirationTime,
        'userId' => $userId,
        'userType' => $userType
    ];
    
    // Create token header
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    
    // Create token payload
    $payload = json_encode($payload);
    
    // Encode Header
    $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    
    // Encode Payload
    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    
    // Create Signature
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $secretKey, true);
    
    // Encode Signature
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    // Create JWT
    $jwt = $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    
    return $jwt;
}

function verifyJWT($token) {
    $secretKey = 'your-secret-key-change-this-in-production';
    
    // Split token
    $tokenParts = explode('.', $token);
    if (count($tokenParts) != 3) {
        return false;
    }
    
    $header = base64_decode(str_replace(['-', '_'], ['+', '/'], $tokenParts[0]));
    $payload = base64_decode(str_replace(['-', '_'], ['+', '/'], $tokenParts[1]));
    $signature = $tokenParts[2];
    
    // Check expiration
    $payloadData = json_decode($payload, true);
    if (isset($payloadData['exp']) && $payloadData['exp'] < time()) {
        return false;
    }
    
    // Verify signature
    $base64UrlHeader = $tokenParts[0];
    $base64UrlPayload = $tokenParts[1];
    
    $expectedSignature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $secretKey, true);
    $base64UrlExpectedSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($expectedSignature));
    
    return hash_equals($base64UrlExpectedSignature, $signature);
}

function getCurrentUser() {
    $headers = getallheaders();
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
    
    if (preg_match('/Bearer\s+(.*)$/', $authHeader, $matches)) {
        $token = $matches[1];
        
        if (verifyJWT($token)) {
            $tokenParts = explode('.', $token);
            $payload = base64_decode(str_replace(['-', '_'], ['+', '/'], $tokenParts[1]));
            $payloadData = json_decode($payload, true);
            
            return [
                'userId' => $payloadData['userId'],
                'userType' => $payloadData['userType']
            ];
        }
    }
    
    return false;
}
?>
