const API_BASE_URL = 'http://localhost/heal-u/backend/api/historique';

export interface HistoriqueMedical {
  id_historique?: number;
  antecedents: string;
  allergies: string;
  traitements: string;
  id_patient?: number;
  patient_nom?: string;
}

export const historiqueService = {
  async getAllHistorique(): Promise<HistoriqueMedical[]> {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch historique');
    }
    return response.json();
  },

  async getHistoriqueById(id: number): Promise<HistoriqueMedical> {
    const response = await fetch(`${API_BASE_URL}?id=${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch historique');
    }
    return response.json();
  },

  async getHistoriqueByPatient(patientId: number): Promise<HistoriqueMedical[]> {
    const response = await fetch(`${API_BASE_URL}?patient=${patientId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch historique for patient');
    }
    return response.json();
  },

  async createHistorique(historique: Omit<HistoriqueMedical, 'id_historique'>): Promise<HistoriqueMedical> {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(historique),
    });
    if (!response.ok) {
      throw new Error('Failed to create historique');
    }
    return response.json();
  },

  async updateHistorique(id: number, historique: Partial<HistoriqueMedical>): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}?id=${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(historique),
    });
    if (!response.ok) {
      throw new Error('Failed to update historique');
    }
    return response.json();
  },

  async deleteHistorique(id: number): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}?id=${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete historique');
    }
    return response.json();
  },
};
