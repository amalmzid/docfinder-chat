const API_BASE_URL = 'http://localhost/heal-u/backend/api/cabinets';

export interface Cabinet {
  id_cabinet?: number;
  id_docteur: number;
  nom_cabinet: string;
  adresse: string;
  telephone?: string;
  horaire_travail: string;
  specialite: string;
  created_at?: string;
  updated_at?: string;
}

export const cabinetService = {
  // Get all cabinets
  async getAllCabinets(): Promise<Cabinet[]> {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch cabinets');
    }
    return response.json();
  },

  // Get cabinet by ID
  async getCabinetById(id: number): Promise<Cabinet> {
    const response = await fetch(`${API_BASE_URL}?id=${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch cabinet');
    }
    return response.json();
  },

  // Get cabinets by doctor ID
  async getCabinetsByDoctor(doctorId: number): Promise<Cabinet[]> {
    const response = await fetch(`${API_BASE_URL}?doctor=${doctorId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch doctor cabinets');
    }
    return response.json();
  },

  // Create new cabinet
  async createCabinet(cabinet: Omit<Cabinet, 'id_cabinet' | 'created_at' | 'updated_at'>): Promise<Cabinet> {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cabinet),
    });
    if (!response.ok) {
      throw new Error('Failed to create cabinet');
    }
    return response.json();
  },

  // Update cabinet
  async updateCabinet(id: number, cabinet: Omit<Cabinet, 'id_cabinet' | 'created_at' | 'updated_at'>): Promise<Cabinet> {
    const response = await fetch(`${API_BASE_URL}?id=${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cabinet),
    });
    if (!response.ok) {
      throw new Error('Failed to update cabinet');
    }
    return response.json();
  },

  // Delete cabinet
  async deleteCabinet(id: number): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}?id=${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete cabinet');
    }
    return response.json();
  },
};
