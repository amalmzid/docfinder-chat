import React, { useState, useEffect } from 'react';
import { pharmacyService, Pharmacy } from '../services/pharmacyService';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Trash2, Edit, Plus } from 'lucide-react';

export const PharmacyList: React.FC = () => {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPharmacies();
  }, []);

  const fetchPharmacies = async () => {
    try {
      setLoading(true);
      const data = await pharmacyService.getAllPharmacies();
      setPharmacies(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch pharmacies');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this pharmacy?')) {
      try {
        await pharmacyService.deletePharmacy(id);
        setPharmacies(pharmacies.filter(p => p.id_pharmacie !== id));
      } catch (err) {
        setError('Failed to delete pharmacy');
        console.error('Error:', err);
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading pharmacies...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-8">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Pharmacies</h1>
        <Button className="flex items-center gap-2">
          <Plus size={16} />
          Add Pharmacy
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pharmacies.map((pharmacy) => (
          <Card key={pharmacy.id_pharmacie} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <span className="text-lg">{pharmacy.nom}</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit size={16} />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDelete(pharmacy.id_pharmacie!)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  <strong>Address:</strong> {pharmacy.adresse}
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Hours:</strong> {pharmacy.horaireOuverture}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {pharmacies.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No pharmacies found. Add your first pharmacy to get started.
        </div>
      )}
    </div>
  );
};
