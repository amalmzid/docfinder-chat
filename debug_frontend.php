<!DOCTYPE html>
<html>
<head>
    <title>Debug Pharmacy Data</title>
</head>
<body>
    <h1>Pharmacy Data Debug</h1>
    
    <h2>localStorage userData:</h2>
    <div id="userData"></div>
    
    <h2>Parsed Pharmacy Data:</h2>
    <div id="pharmacyData"></div>
    
    <h2>Test API Call:</h2>
    <button onclick="testAPI()">Test API Call</button>
    <div id="apiResult"></div>
    
    <script>
        // Show localStorage data
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        document.getElementById('userData').innerHTML = '<pre>' + JSON.stringify(userData, null, 2) + '</pre>';
        
        const pharmacy = userData.role === 'pharmacy' ? userData : null;
        document.getElementById('pharmacyData').innerHTML = '<pre>' + JSON.stringify(pharmacy, null, 2) + '</pre>';
        
        // Test API call
        async function testAPI() {
            const resultDiv = document.getElementById('apiResult');
            resultDiv.innerHTML = 'Testing...';
            
            try {
                console.log('Testing API with pharmacy:', pharmacy);
                
                const response = await fetch(`http://localhost/heal-u/backend/api/pharmacy_medicines.php?id_pharmacie=${pharmacy?.id}`);
                console.log('Response status:', response.status);
                console.log('Response ok:', response.ok);
                
                const data = await response.json();
                console.log('Response data:', data);
                
                resultDiv.innerHTML = '<h3>API Response:</h3><pre>' + JSON.stringify(data, null, 2) + '</pre>';
                
            } catch (error) {
                console.error('Error:', error);
                resultDiv.innerHTML = '<h3>Error:</h3><pre>' + error.message + '</pre>';
            }
        }
    </script>
</body>
</html>
