import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Store, Pill, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

console.log('MedicinesList component loaded');

interface Medicine {
  id_medicament: number;
  id_pharmacie: number;
  nom: string;
  categorie: string;
  prix: number;
  disponibilite: number;
  pharmacy_name?: string;
  pharmacy_horaire?: string;
}

export default function MedicinesList() {
  console.log('MedicinesList component rendering');
  
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    console.log('MedicinesList useEffect triggered');
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      console.log('Fetching medicines from API...');
      
      const response = await fetch('http://localhost/heal-u/backend/api/medicines.php');
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API Response data:', data);
      console.log('Data type:', typeof data);
      console.log('Data length:', Array.isArray(data) ? data.length : 'Not an array');
      
      setMedicines(Array.isArray(data) ? data : []);
      
    } catch (error) {
      console.error('Error fetching medicines:', error);
      setMedicines([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredMedicines = React.useMemo(() => 
    medicines.filter((med) => 
      med.nom.toLowerCase().includes(search.toLowerCase()) ||
      med.categorie.toLowerCase().includes(search.toLowerCase()) ||
      med.pharmacy_name?.toLowerCase().includes(search.toLowerCase())
    ), [medicines, search]
  );

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center p-8">
          <div className="text-center">
            <Pill className="h-8 w-8 mx-auto mb-4 text-primary" />
            <h2 className="text-xl font-semibold mb-2">Loading medicines...</h2>
            <p className="text-muted-foreground">Please wait while we fetch available medicines</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '16px', color: '#333' }}>
          Available Medicines
        </h1>
        <p style={{ color: '#666', marginBottom: '24px' }}>
          Browse medicines from all pharmacies with their operating hours
        </p>
        
        <div style={{ position: 'relative', maxWidth: '400px', marginBottom: '24px' }}>
          <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>
            🔍
          </div>
          <input
            type="text"
            placeholder="Search medicines, categories, or pharmacies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: '12px 12px 12px 40px',
              width: '100%',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
        </div>
      </div>

      <div>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
          Found {filteredMedicines.length} medicines
        </h2>
        
        {filteredMedicines.map((med) => (
          <div 
            key={med.id_medicament} 
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '16px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span style={{ fontSize: '24px' }}>💊</span>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>{med.nom}</h3>
              <span style={{
                backgroundColor: med.disponibilite === 1 ? '#10b981' : '#6b7280',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px'
              }}>
                {med.disponibilite === 1 ? "Available" : "Unavailable"}
              </span>
            </div>
            
            <div style={{ display: 'grid', gap: '8px', fontSize: '14px' }}>
              <div><strong>Category:</strong> {med.categorie}</div>
              <div><strong>Price:</strong> <span style={{ color: '#059669', fontWeight: 'bold' }}>${med.prix.toFixed(2)}</span></div>
              
              {med.pharmacy_name && (
                <div>
                  <span style={{ fontSize: '16px' }}>🏪</span> <strong>Pharmacy:</strong> {med.pharmacy_name}
                </div>
              )}
              
              {med.pharmacy_horaire && (
                <div>
                  <span style={{ fontSize: '16px' }}>🕐</span> <strong>Hours:</strong> 
                  <span style={{ color: '#059669', fontWeight: 'bold' }}> {med.pharmacy_horaire}</span>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {filteredMedicines.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 20px', backgroundColor: 'white', borderRadius: '8px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💊</div>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>No medicines found</h3>
            <p style={{ color: '#6b7280' }}>
              Try adjusting your search terms or check back later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
