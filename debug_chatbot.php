<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>🔍 Chatbot Debug Tool</h1>";

// Load environment variables
function loadEnv($file) {
    if (!file_exists($file)) {
        echo "❌ .env file not found at: $file<br>";
        return false;
    }
    
    echo "✅ .env file found<br>";
    $lines = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    $hasApiKey = false;
    
    foreach ($lines as $line) {
        if (strpos($line, '#') === 0) {
            continue;
        }
        
        if (strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);
            $_ENV[$key] = $value;
            
            if ($key === 'OPENAI_API_KEY') {
                $hasApiKey = true;
                if (!empty($value)) {
                    echo "✅ OPENAI_API_KEY is set<br>";
                    echo "🔑 API Key length: " . strlen($value) . " characters<br>";
                    echo "🔑 API Key format: " . substr($value, 0, 10) . "...<br>";
                } else {
                    echo "❌ OPENAI_API_KEY is empty<br>";
                }
            }
        }
    }
    
    if (!$hasApiKey) {
        echo "❌ OPENAI_API_KEY not found in .env file<br>";
    }
    
    return true;
}

// Load and check .env
loadEnv(__DIR__ . '/backend/.env');

echo "<hr>";

// Check if API key is available
$apiKey = $_ENV['OPENAI_API_KEY'] ?? null;
if (!$apiKey) {
    echo "❌ No API key available. Please add OPENAI_API_KEY to your .env file<br>";
    echo "<h3>📝 How to fix:</h3>";
    echo "<ol>";
    echo "<li>Open backend/.env file</li>";
    echo "<li>Add: OPENAI_API_KEY=your_openrouter_api_key_here</li>";
    echo "<li>Get your free API key from <a href='https://openrouter.ai'>OpenRouter.ai</a></li>";
    echo "</ol>";
    exit;
}

echo "<hr>";
echo "<h2>🧪 Testing OpenRouter API Connection</h2>";

// Test OpenRouter API
$testData = [
    'model' => 'meta-llama/llama-3.2-3b-instruct:free',
    'messages' => [
        [
            'role' => 'user',
            'content' => 'Hello, can you help me?'
        ]
    ],
    'max_tokens' => 50,
    'temperature' => 0.7
];

$ch = curl_init('https://openrouter.ai/api/v1/chat/completions');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($testData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $apiKey,
    'HTTP-Referer: https://heal-u.com',
    'X-Title: Heal-U Medical Chatbot Test'
]);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

echo "📡 HTTP Status: $httpCode<br>";

if ($curlError) {
    echo "❌ cURL Error: $curlError<br>";
    echo "<h3>🔧 Possible solutions:</h3>";
    echo "<ul>";
    echo "<li>Check your internet connection</li>";
    echo "<li>Verify the API key is correct</li>";
    echo "<li>Make sure OpenRouter.ai is accessible</li>";
    echo "</ul>";
} else {
    echo "✅ API request sent successfully<br>";
    
    if ($httpCode === 200) {
        echo "✅ API returned 200 OK<br>";
        
        $result = json_decode($response, true);
        if ($result && isset($result['choices'][0]['message']['content'])) {
            echo "✅ Valid response received<br>";
            echo "🤖 Test response: " . htmlspecialchars($result['choices'][0]['message']['content']) . "<br>";
            echo "<hr>";
            echo "<h2>🎉 Chatbot should work correctly!</h2>";
            echo "<p>Your OpenRouter API is properly configured.</p>";
        } else {
            echo "❌ Invalid response format<br>";
            echo "📄 Response: " . htmlspecialchars($response) . "<br>";
        }
    } else {
        echo "❌ API returned error: $httpCode<br>";
        echo "📄 Response: " . htmlspecialchars($response) . "<br>";
        
        if ($httpCode === 401) {
            echo "<h3>🔑 Authentication Error (401)</h3>";
            echo "<p>Your API key is invalid or expired.</p>";
            echo "<p>Please get a new API key from <a href='https://openrouter.ai'>OpenRouter.ai</a></p>";
        } elseif ($httpCode === 429) {
            echo "<h3>⏱️ Rate Limit Error (429)</h3>";
            echo "<p>You've hit the rate limit. Please wait and try again.</p>";
        } else {
            echo "<h3>❓ Other Error</h3>";
            echo "<p>Check the response above for details.</p>";
        }
    }
}

echo "<hr>";
echo "<h2>🔧 Next Steps</h2>";
echo "<ol>";
echo "<li>If the test above passed ✅, your chatbot should work</li>";
echo "<li>If it failed ❌, fix the issue and refresh this page</li>";
echo "<li>Once working, test the chatbot: <a href='test_chatbot.html'>Interactive Test</a></li>";
echo "<li>Or use it in the Patient Portal</li>";
echo "</ol>";
?>
