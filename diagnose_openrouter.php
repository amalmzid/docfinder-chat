<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>🔍 OpenRouter API Diagnostic Tool</h1>";

// Load environment variables
function loadEnv($file) {
    if (!file_exists($file)) {
        echo "❌ .env file not found<br>";
        return false;
    }
    
    $lines = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    $hasApiKey = false;
    
    foreach ($lines as $line) {
        if (strpos($line, '#') === 0) continue;
        if (strpos($line, '=') === false) continue;
        
        list($key, $value) = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value);
        $_ENV[$key] = $value;
        
        if ($key === 'OPENAI_API_KEY') {
            $hasApiKey = true;
            echo "✅ OPENAI_API_KEY found<br>";
            echo "🔑 Key length: " . strlen($value) . " characters<br>";
            echo "🔑 Key format: " . substr($value, 0, 15) . "...<br>";
            
            if (strpos($value, 'sk-or-v1-') === 0) {
                echo "✅ Valid OpenRouter key format<br>";
            } else {
                echo "❌ Invalid OpenRouter key format. Should start with 'sk-or-v1-'<br>";
            }
        }
    }
    
    if (!$hasApiKey) {
        echo "❌ OPENAI_API_KEY not found in .env<br>";
    }
    
    return $hasApiKey;
}

// Load environment
$hasApiKey = loadEnv(__DIR__ . '/backend/.env');
$apiKey = $_ENV['OPENAI_API_KEY'] ?? null;

if (!$hasApiKey || !$apiKey) {
    echo "<h2>🚨 API Key Issues</h2>";
    echo "<p>Please add a valid OpenRouter API key to backend/.env:</p>";
    echo "<code>OPENAI_API_KEY=sk-or-v1-your-key-here</code><br>";
    echo "<p>Get your free key from: <a href='https://openrouter.ai' target='_blank'>OpenRouter.ai</a></p>";
    exit;
}

echo "<hr>";
echo "<h2>🧪 Testing OpenRouter API Connection</h2>";

// Test 1: Basic connectivity
echo "<h3>Test 1: Basic API Connectivity</h3>";

$ch = curl_init('https://openrouter.ai/api/v1/models');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $apiKey,
    'HTTP-Referer: https://heal-u.com',
    'X-Title: Heal-U Medical Chatbot'
]);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

echo "📡 Models API Status: $httpCode<br>";

if ($curlError) {
    echo "❌ Connection Error: $curlError<br>";
    echo "<h4>🔧 Possible issues:</h4>";
    echo "<ul>";
    echo "<li>Internet connection problem</li>";
    echo "<li>Firewall blocking HTTPS requests</li>";
    echo "<li>DNS resolution issues</li>";
    echo "</ul>";
} elseif ($httpCode === 200) {
    echo "✅ API connectivity successful<br>";
    $models = json_decode($response, true);
    if ($models && isset($models['data'])) {
        echo "📊 Available models: " . count($models['data']) . "<br>";
        
        // Check if our target model is available
        $targetModel = 'meta-llama/llama-3.2-3b-instruct:free';
        $modelFound = false;
        foreach ($models['data'] as $model) {
            if ($model['id'] === $targetModel) {
                $modelFound = true;
                break;
            }
        }
        
        if ($modelFound) {
            echo "✅ Target model '$targetModel' is available<br>";
        } else {
            echo "❌ Target model '$targetModel' not found<br>";
            echo "<p>Available free models:</p><ul>";
            foreach ($models['data'] as $model) {
                if (strpos($model['id'], ':free') !== false) {
                    echo "<li>" . $model['id'] . "</li>";
                }
            }
            echo "</ul>";
        }
    }
} elseif ($httpCode === 401) {
    echo "❌ Authentication failed (401)<br>";
    echo "<p>Your API key is invalid or expired.</p>";
    echo "<p>Please get a new key from <a href='https://openrouter.ai' target='_blank'>OpenRouter.ai</a></p>";
} else {
    echo "❌ API returned error: $httpCode<br>";
    echo "📄 Response: " . htmlspecialchars($response) . "<br>";
}

echo "<hr>";
echo "<h3>Test 2: Chat Completion Test</h3>";

// Test 2: Actual chat completion
$testData = [
    'model' => 'meta-llama/llama-3.2-3b-instruct:free',
    'messages' => [
        [
            'role' => 'user',
            'content' => 'Hello, can you help me with a simple question?'
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

echo "📡 Chat API Status: $httpCode<br>";

if ($curlError) {
    echo "❌ Chat API Error: $curlError<br>";
} elseif ($httpCode === 200) {
    echo "✅ Chat API successful<br>";
    $result = json_decode($response, true);
    if ($result && isset($result['choices'][0]['message']['content'])) {
        echo "🤖 Test response: " . htmlspecialchars($result['choices'][0]['message']['content']) . "<br>";
        echo "<hr>";
        echo "<h2>🎉 OpenRouter API is working!</h2>";
        echo "<p>Your chatbot should now work correctly.</p>";
        echo "<p><a href='test_final_chatbot.php'>🧪 Test the chatbot</a></p>";
    } else {
        echo "❌ Invalid response format<br>";
        echo "📄 Response: " . htmlspecialchars($response) . "<br>";
    }
} else {
    echo "❌ Chat API Error: $httpCode<br>";
    echo "📄 Response: " . htmlspecialchars($response) . "<br>";
    
    if ($httpCode === 429) {
        echo "<h4>⏱️ Rate Limit Error (429)</h4>";
        echo "<p>You've hit the rate limit. Please wait and try again.</p>";
    } elseif ($httpCode === 402) {
        echo "<h4>💳 Payment Required (402)</h4>";
        echo "<p>The free model may have usage limits or requires credits.</p>";
    } elseif ($httpCode === 400) {
        echo "<h4>📝 Bad Request (400)</h4>";
        echo "<p>Invalid request format or parameters.</p>";
    }
}

echo "<hr>";
echo "<h2>🔧 Quick Fix Checklist</h2>";
echo "<ol>";
echo "<li>✅ API key format is correct (sk-or-v1-...)</li>";
echo "<li>✅ Internet connection is working</li>";
echo "<li>✅ OpenRouter.ai is accessible</li>";
echo "<li>✅ Target model is available</li>";
echo "<li>✅ Chat API is functional</li>";
echo "</ol>";

echo "<p><strong>If all tests pass ✅, your chatbot should work!</strong></p>";
echo "<p><strong>If tests fail ❌, follow the specific error messages above.</strong></p>";
?>
