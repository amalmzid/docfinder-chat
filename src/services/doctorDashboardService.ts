const API_BASE_URL = 'http://localhost/heal-u/backend/api';

export interface DoctorAvailability {
  day_of_week: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  start_time: string;
  end_time: string;
  is_available: boolean;
  max_patients: number;
  notes?: string;
}

export interface DoctorProfile {
  id_docteur?: number;
  nom: string;
  email: string;
  specialite: string;
  telephone?: string;
  adresse?: string;
  ville?: string;
  code_postal?: string;
  pays?: string;
  date_naissance?: string;
  genre?: 'male' | 'female' | 'other';
  numero_license?: string;
  annees_experience?: number;
  universite?: string;
  biographie?: string;
  total_consultations?: number;
  completed_consultations?: number;
  scheduled_consultations?: number;
  total_cabinets?: number;
}

export interface Consultation {
  id?: number;
  id_patient: number;
  id_docteur: number;
  id_cabinet?: number;
  date_consultation: string;
  motif: string;
  diagnostic?: string;
  ordonnance?: string;
  notes?: string;
  statut: 'scheduled' | 'completed' | 'cancelled';
  patient_name?: string;
  patient_email?: string;
  nom_cabinet?: string;
  cabinet_address?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DoctorProfileResponse {
  profile: DoctorProfile;
  cabinets: any[];
  availability: DoctorAvailability[];
  recent_consultations: Consultation[];
}

export const doctorDashboardService = {
  // Availability Management
  async getAvailability(): Promise<DoctorAvailability[]> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/doctor_availability`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch availability');
    }
    return response.json();
  },

  async updateAvailability(availability: DoctorAvailability[]): Promise<DoctorAvailability[]> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/doctor_availability`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ availability }),
    });
    if (!response.ok) {
      throw new Error('Failed to update availability');
    }
    return response.json();
  },

  // Profile Management
  async getProfile(): Promise<DoctorProfileResponse> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/doctor_profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }
    return response.json();
  },

  async updateProfile(profile: Partial<DoctorProfile>): Promise<DoctorProfile> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/doctor_profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profile),
    });
    if (!response.ok) {
      throw new Error('Failed to update profile');
    }
    return response.json();
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/doctor_profile?action=change-password`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: newPassword,
      }),
    });
    if (!response.ok) {
      throw new Error('Failed to change password');
    }
    return response.json();
  },

  // Consultations Management
  async getConsultations(params?: {
    status?: 'all' | 'scheduled' | 'completed' | 'cancelled';
    date_from?: string;
    date_to?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    consultations: Consultation[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const token = localStorage.getItem('token');
    const queryParams = new URLSearchParams();
    
    if (params?.status && params.status !== 'all') {
      queryParams.append('status', params.status);
    }
    if (params?.date_from) {
      queryParams.append('date_from', params.date_from);
    }
    if (params?.date_to) {
      queryParams.append('date_to', params.date_to);
    }
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    if (params?.offset) {
      queryParams.append('offset', params.offset.toString());
    }
    
    const url = `${API_BASE_URL}/doctor_consultations${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch consultations');
    }
    return response.json();
  },

  async getConsultationById(id: number): Promise<Consultation> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/doctor_consultations?id=${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch consultation');
    }
    return response.json();
  },

  async createConsultation(consultation: Omit<Consultation, 'id' | 'created_at' | 'updated_at'>): Promise<Consultation> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/doctor_consultations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(consultation),
    });
    if (!response.ok) {
      throw new Error('Failed to create consultation');
    }
    return response.json();
  },

  async updateConsultation(id: number, consultation: Partial<Consultation>): Promise<Consultation> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/doctor_consultations?id=${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(consultation),
    });
    if (!response.ok) {
      throw new Error('Failed to update consultation');
    }
    return response.json();
  },
};
