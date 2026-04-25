<!DOCTYPE html>
<html>
<head>
    <title>Debug Loading Issue</title>
</head>
<body>
    <h1>Debug Pharmacy Medicines Loading</h1>
    
    <h2>Test API Direct:</h2>
    <button onclick="testDirectAPI()">Test Direct API Call</button>
    <div id="directResult"></div>
    
    <h2>Test Frontend Logic:</h2>
    <button onclick="testFrontendLogic()">Test Frontend Logic</button>
    <div id="frontendResult"></div>
    
    <h2>localStorage Data:</h2>
    <button onclick="showLocalStorage()">Show localStorage</button>
    <div id="localStorageData"></div>
    
    <script>
        // Test direct API call
        async function testDirectAPI() {
            const resultDiv = document.getElementById('directResult');
            resultDiv.innerHTML = 'Testing...';
            
            try {
                const response = await fetch('http://localhost/heal-u/backend/api/pharmacy_medicines.php?id_pharmacie=9');
                console.log('Direct API Response status:', response.status);
                console.log('Direct API Response ok:', response.ok);
                
                const data = await response.json();
                console.log('Direct API Response data:', data);
                
                resultDiv.innerHTML = `
                    <h3>Direct API Response:</h3>
                    <p>Status: ${response.status}</p>
                    <p>OK: ${response.ok}</p>
                    <pre>${JSON.stringify(data, null, 2)}</pre>
                `;
                
            } catch (error) {
                console.error('Direct API Error:', error);
                resultDiv.innerHTML = `<h3>Error:</h3><pre>${error.message}</pre>`;
            }
        }
        
        // Test frontend logic simulation
        function testFrontendLogic() {
            const resultDiv = document.getElementById('frontendResult');
            
            // Simulate localStorage data
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            const pharmacy = userData.role === 'pharmacy' ? userData : null;
            const isAuthenticated = !!pharmacy;
            
            resultDiv.innerHTML = `
                <h3>Frontend Logic Simulation:</h3>
                <p>Is Authenticated: ${isAuthenticated}</p>
                <p>Pharmacy Data: <pre>${JSON.stringify(pharmacy, null, 2)}</pre></p>
                <p>Pharmacy ID: ${pharmacy?.id}</p>
                <p>Would call API: http://localhost/heal-u/backend/api/pharmacy_medicines.php?id_pharmacie=${pharmacy?.id}</p>
            `;
        }
        
        // Show localStorage
        function showLocalStorage() {
            const dataDiv = document.getElementById('localStorageData');
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            const token = localStorage.getItem('token');
            const userType = localStorage.getItem('userType');
            
            dataDiv.innerHTML = `
                <h3>localStorage Contents:</h3>
                <p><strong>Token:</strong> ${token ? 'exists' : 'missing'}</p>
                <p><strong>User Type:</strong> ${userType || 'not set'}</p>
                <p><strong>User Data:</strong></p>
                <pre>${JSON.stringify(userData, null, 2)}</pre>
            `;
        }
    </script>
</body>
</html>
