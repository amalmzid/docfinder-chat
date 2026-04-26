const API_BASE_URL = 'http://localhost/heal-u/backend/api/doctors';

export interface Doctor {
  id_docteur?: number;
  nom: string;
  email: string;
  mot_de_passe?: string;
  role: string;
  specialite: string;
  created_at?: string;
  updated_at?: string;
}

export const doctorService = {
  // Get all doctors
  async getAllDoctors(): Promise<Doctor[]> {
    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Raw API response:', data);
      
      // Handle different response formats
      if (Array.isArray(data)) {
        return data.map(item => this.normalizeDoctor(item));
      } else if (data && Array.isArray(data.data)) {
        return data.data.map(item => this.normalizeDoctor(item));
      } else if (data && Array.isArray(data.doctors)) {
        return data.doctors.map(item => this.normalizeDoctor(item));
      } else {
        console.warn('Unexpected API response format:', data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      throw error;
    }
  },

  // Normalize doctor data to match interface
  normalizeDoctor(item: any): Doctor {
    return {
      id_docteur: item.id_docteur || item.id,
      nom: item.nom || '',
      email: item.email || '',
      mot_de_passe: item.mot_de_passe || item.password || '',
      role: item.role || 'doctor',
      specialite: item.specialite || item.specialty || '',
      created_at: item.created_at,
      updated_at: item.updated_at
    };
  },

  // Get doctor by ID
  async getDoctorById(id: number): Promise<Doctor> {
    const response = await fetch(`${API_BASE_URL}?id=${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch doctor');
    }
    const data = await response.json();
    return this.normalizeDoctor(data);
  },

  // Create new doctor
  async createDoctor(doctor: Omit<Doctor, 'id_docteur' | 'created_at' | 'updated_at'>): Promise<Doctor> {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(doctor),
    });
    if (!response.ok) {
      throw new Error('Failed to create doctor');
    }
    return response.json();
  },

  // Update doctor
  async updateDoctor(id: number, doctor: Omit<Doctor, 'id_docteur' | 'created_at' | 'updated_at'>): Promise<Doctor> {
    const response = await fetch(`${API_BASE_URL}?id=${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(doctor),
    });
    if (!response.ok) {
      throw new Error('Failed to update doctor');
    }
    return response.json();
  },

  // Delete doctor
  async deleteDoctor(id: number): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}?id=${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete doctor');
    }
    return response.json();
  },
};
