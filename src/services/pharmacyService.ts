const API_BASE_URL = 'http://localhost/heal-u/backend/api/pharmacies';

export interface Pharmacy {
  id_pharmacie?: number;
  nom: string;
  adresse: string;
  horaireOuverture: string;
  created_at?: string;
  updated_at?: string;
}

export const pharmacyService = {
  // Get all pharmacies
  async getAllPharmacies(): Promise<Pharmacy[]> {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch pharmacies');
    }
    return response.json();
  },

  // Get pharmacy by ID
  async getPharmacyById(id: number): Promise<Pharmacy> {
    const response = await fetch(`${API_BASE_URL}?id=${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch pharmacy');
    }
    return response.json();
  },

  // Create new pharmacy
  async createPharmacy(pharmacy: Omit<Pharmacy, 'id_pharmacie' | 'created_at' | 'updated_at'>): Promise<Pharmacy> {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pharmacy),
    });
    if (!response.ok) {
      throw new Error('Failed to create pharmacy');
    }
    return response.json();
  },

  // Update pharmacy
  async updatePharmacy(id: number, pharmacy: Omit<Pharmacy, 'id_pharmacie' | 'created_at' | 'updated_at'>): Promise<Pharmacy> {
    const response = await fetch(`${API_BASE_URL}?id=${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pharmacy),
    });
    if (!response.ok) {
      throw new Error('Failed to update pharmacy');
    }
    return response.json();
  },

  // Delete pharmacy
  async deletePharmacy(id: number): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}?id=${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete pharmacy');
    }
    return response.json();
  },
};
