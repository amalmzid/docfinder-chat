import React from 'react';

export default function TestMedicines() {
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#ff0000', 
      color: '#ffffff', 
      fontSize: '24px',
      minHeight: '100vh'
    }}>
      <h1>TEST MEDICINES PAGE</h1>
      <p>If you can see this, the routing is working.</p>
      <p>Current time: {new Date().toLocaleString()}</p>
      <p>Random number: {Math.random()}</p>
    </div>
  );
}
