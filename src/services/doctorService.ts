const API_BASE_URL = 'http://localhost/heal-u/backend/api/doctors';

export interface Doctor {
  id_docteur?: number;
  nom: string;
  email: string;
  mot_de_passe: string;
  role: string;
  specialite: string;
  created_at?: string;
  updated_at?: string;
}

export const doctorService = {
  // Get all doctors
  async getAllDoctors(): Promise<Doctor[]> {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch doctors');
    }
    return response.json();
  },

  // Get doctor by ID
  async getDoctorById(id: number): Promise<Doctor> {
    const response = await fetch(`${API_BASE_URL}?id=${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch doctor');
    }
    return response.json();
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
