<?php
error_reporting(0);
ini_set('display_errors', 0);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';

setCorsHeaders();

// Load environment variables
function loadEnv($file) {
    if (!file_exists($file)) {
        return false;
    }
    
    $lines = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '#') === 0) {
            continue;
        }
        
        if (strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);
            $_ENV[$key] = $value;
        }
    }
    return true;
}

// Load .env file
loadEnv(__DIR__ . '/../.env');

try {
    $method = $_SERVER['REQUEST_METHOD'];
    
    if ($method !== 'POST') {
        sendError('Method not allowed', 405);
    }

    $data = getRequestBody();
    
    if (!isset($data['message']) || empty($data['message'])) {
        sendError('Message is required');
    }

    $userMessage = trim($data['message']);
    
    // Get OpenAI API key from environment
    $apiKey = $_ENV['OPENAI_API_KEY'] ?? null;
    
    if (!$apiKey) {
        sendError('OpenAI API key not configured', 500);
    }

    // Initialize database connection
    $db = new Database();
    $conn = $db->getConnection();

    // Get medicines data for context
    $medicinesData = getMedicinesForContext($conn);
    
    // Get doctors data for appointment context
    $doctorsData = getDoctorsForContext($conn);
    
    $db->closeConnection();

    // Generate AI response
    $response = generateChatbotResponse($userMessage, $medicinesData, $doctorsData, $apiKey);
    
    sendResponse([
        'message' => $response,
        'timestamp' => date('Y-m-d H:i:s')
    ]);

} catch (Exception $e) {
    sendError('Server error: ' . $e->getMessage());
}

function getMedicinesForContext($conn) {
    $sql = "SELECT m.nom as name, m.categorie as category, m.prix as price, 
                   m.disponibilite as in_stock, p.nom as pharmacy_name, p.horaireOuverture as pharmacy_hours
            FROM medicament m 
            LEFT JOIN pharmacie p ON m.id_pharmacie = p.id_pharmacie 
            WHERE m.disponibilite = 1 
            ORDER BY m.nom ASC 
            LIMIT 50";
    
    $result = $conn->query($sql);
    $medicines = [];
    
    while ($row = $result->fetch_assoc()) {
        $medicines[] = [
            'name' => $row['name'],
            'category' => $row['category'],
            'description' => 'Medication for ' . $row['category'], // Generate description
            'price' => $row['price'],
            'stock' => $row['in_stock'] ? 100 : 0, // Convert availability to stock number
            'pharmacy' => $row['pharmacy_name'],
            'pharmacy_hours' => $row['pharmacy_hours']
        ];
    }
    
    return $medicines;
}

function getDoctorsForContext($conn) {
    $sql = "SELECT d.nom as name, d.specialite as specialty, d.email as email
            FROM docteur d 
            ORDER BY d.nom ASC 
            LIMIT 20";
    
    $result = $conn->query($sql);
    $doctors = [];
    
    while ($row = $result->fetch_assoc()) {
        $doctors[] = [
            'name' => $row['name'],
            'specialty' => $row['specialty'],
            'phone' => $row['email'], // Use email as contact since phone doesn't exist
            'hours' => 'Available during clinic hours', // Default hours
            'cabinet' => 'Medical Center' // Default cabinet
        ];
    }
    
    return $doctors;
}

function generateChatbotResponse($userMessage, $medicines, $doctors, $apiKey) {
    try {
        $context = buildContext($medicines, $doctors);
        $systemPrompt = buildSystemPrompt();
        
        $messages = [
            [
                'role' => 'system',
                'content' => $systemPrompt . "\n\n" . $context
            ],
            [
                'role' => 'user',
                'content' => $userMessage
            ]
        ];

        $data = [
            'model' => 'inclusionai/ling-2.6-1t:free',
            'messages' => $messages,
            'max_tokens' => 500,
            'temperature' => 0.7
        ];

        $ch = curl_init('https://openrouter.ai/api/v1/chat/completions');
        
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $apiKey,
            'HTTP-Referer: https://heal-u.com',
            'X-Title: Heal-U Medical Chatbot'
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($response === false) {
            throw new Exception('Connection failed');
        }

        $result = json_decode($response, true);
        
        if ($httpCode !== 200 || !isset($result['choices'][0]['message']['content'])) {
            $errorMsg = $result['error']['message'] ?? 'Unknown error';
            throw new Exception($errorMsg);
        }

        return $result['choices'][0]['message']['content'];
        
    } catch (Exception $e) {
        // Fallback response when AI service fails
        return generateFallbackResponse($userMessage, $medicines, $doctors, $e->getMessage());
    }
}

function generateFallbackResponse($userMessage, $medicines, $doctors, $aiError) {
    $userMessage = strtolower($userMessage);
    
    // Check if user is asking about medicines
    if (strpos($userMessage, 'medicine') !== false || strpos($userMessage, 'medicament') !== false || 
        strpos($userMessage, 'drug') !== false || strpos($userMessage, 'pill') !== false) {
        
        $response = "I'm currently having trouble with my AI connection, but I can help you with medicine information:\n\n";
        
        if (!empty($medicines)) {
            $response .= "**Available Medicines:**\n";
            foreach (array_slice($medicines, 0, 5) as $medicine) {
                $response .= "• **{$medicine['name']}** ({$medicine['category']}) - {$medicine['price']} DA\n";
                if ($medicine['pharmacy']) {
                    $response .= "  Available at: {$medicine['pharmacy']}\n";
                }
            }
            $response .= "\n";
        }
        
        $response .= "**For specific medical advice about symptoms or dosage, please consult a healthcare professional.**\n\n";
        $response .= "*AI service temporarily unavailable: " . substr($aiError, 0, 50) . "...*";
        
        return $response;
    }
    
    // Check if user is asking about doctors
    if (strpos($userMessage, 'doctor') !== false || strpos($userMessage, 'appointment') !== false || 
        strpos($userMessage, 'consultation') !== false) {
        
        $response = "I'm currently having trouble with my AI connection, but I can help you find doctors:\n\n";
        
        if (!empty($doctors)) {
            $response .= "**Available Doctors:**\n";
            foreach (array_slice($doctors, 0, 3) as $doctor) {
                $response .= "• **Dr. {$doctor['name']}** - {$doctor['specialty']}\n";
                $response .= "  Contact: {$doctor['phone']}\n";
            }
            $response .= "\n";
        }
        
        $response .= "**To book an appointment, please contact the doctor directly or use the patient portal.**\n\n";
        $response .= "*AI service temporarily unavailable: " . substr($aiError, 0, 50) . "...*";
        
        return $response;
    }
    
    // Generic fallback response
    return "I'm currently experiencing technical difficulties with my AI service. Here's how I can still help:\n\n" .
           "**For Medicines:**\n" .
           "• Ask about specific medicines or symptoms\n" .
           "• I'll show available options from our database\n\n" .
           "**For Doctors:**\n" .
           "• Ask about doctors or appointments\n" .
           "• I'll show available specialists\n\n" .
           "**For urgent medical concerns, please contact a healthcare provider directly.**\n\n" .
           "*Technical issue: " . substr($aiError, 0, 50) . "...*";
}

function buildContext($medicines, $doctors) {
    $context = "MEDICINES DATABASE:\n";
    
    foreach ($medicines as $medicine) {
        $context .= "- {$medicine['name']} ({$medicine['category']})";
        if ($medicine['description']) {
            $context .= ": {$medicine['description']}";
        }
        $context .= ". Price: {$medicine['price']} DA. Stock: {$medicine['stock']}";
        if ($medicine['pharmacy']) {
            $context .= ". Available at: {$medicine['pharmacy']}";
            if ($medicine['pharmacy_hours']) {
                $context .= " ({$medicine['pharmacy_hours']})";
            }
        }
        $context .= "\n";
    }
    
    $context .= "\nAVAILABLE DOCTORS:\n";
    foreach ($doctors as $doctor) {
        $context .= "- Dr. {$doctor['name']}, {$doctor['specialty']}";
        if ($doctor['cabinet']) {
            $context .= ". Cabinet: {$doctor['cabinet']}";
        }
        if ($doctor['hours']) {
            $context .= ". Hours: {$doctor['hours']}";
        }
        if ($doctor['phone']) {
            $context .= ". Phone: {$doctor['phone']}";
        }
        $context .= "\n";
    }
    
    return $context;
}

function buildSystemPrompt() {
    return "You are a helpful medical assistant chatbot for Heal-U healthcare system in Algeria. 
    Your role is to help patients with:
    1. Information about available medicines in pharmacies
    2. General guidance on whether they might need to see a doctor
    3. Information about available doctors and their specialties
    4. Add tunisian herbs + receipts recommendation (In tunisian name)
    IMPORTANT GUIDELINES:
    - Always provide helpful, accurate information based on the available data
    - For medical advice, always recommend consulting a qualified doctor for serious conditions
    - Be friendly and professional in your responses
    - If you don't have information about a specific medicine, suggest asking at a local pharmacy
    - For appointment recommendations, suggest appropriate specialists based on symptoms
    - Include practical information like prices, stock availability, and pharmacy hours when relevant
    - Respond in a clear, easy-to-understand manner
    - If symptoms sound serious, strongly recommend immediate medical consultation
    
    You are NOT a replacement for professional medical advice. Always encourage users to seek proper medical care for serious health concerns.";
}
?>
