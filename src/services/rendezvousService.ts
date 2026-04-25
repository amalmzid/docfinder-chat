const API_BASE_URL = 'http://localhost/heal-u/backend/api/rendezvous';

export interface RendezVous {
  id_rdv?: number;
  date_rdv: string;
  heure: string;
  statut: string;
  id_patient?: number;
  id_docteur?: number;
  patient_nom?: string;
  docteur_nom?: string;
}

export const rendezvousService = {
  async getAllRendezVous(): Promise<RendezVous[]> {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch rendez-vous');
    }
    return response.json();
  },

  async getRendezVousById(id: number): Promise<RendezVous> {
    const response = await fetch(`${API_BASE_URL}?id=${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch rendez-vous');
    }
    return response.json();
  },

  async createRendezVous(rendezVous: Omit<RendezVous, 'id_rdv'>): Promise<RendezVous> {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rendezVous),
    });
    if (!response.ok) {
      throw new Error('Failed to create rendez-vous');
    }
    return response.json();
  },

  async updateRendezVous(id: number, rendezVous: Partial<RendezVous>): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}?id=${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rendezVous),
    });
    if (!response.ok) {
      throw new Error('Failed to update rendez-vous');
    }
    return response.json();
  },

  async deleteRendezVous(id: number): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}?id=${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete rendez-vous');
    }
    return response.json();
  },
};
