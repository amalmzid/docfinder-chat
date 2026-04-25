import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Pharmacy {
  id_pharmacie: number;
  nom: string;
  email: string;
  adresse: string;
  horaireOuverture: string;
}

interface PharmacyAuthResponse {
  message: string;
  pharmacy: Pharmacy;
  type: 'pharmacy';
}

interface PharmacyAuthContextType {
  pharmacy: Pharmacy | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const PharmacyAuthContext = createContext<PharmacyAuthContextType | undefined>(undefined);

export const usePharmacyAuth = () => {
  const context = useContext(PharmacyAuthContext);
  if (context === undefined) {
    throw Error('usePharmacyAuth must be used within a PharmacyAuthProvider');
  }
  return context;
};

interface PharmacyAuthProviderProps {
  children: ReactNode;
}

export const PharmacyAuthProvider: React.FC<PharmacyAuthProviderProps> = ({ children }) => {
  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedPharmacy = localStorage.getItem('pharmacy');
    const savedType = localStorage.getItem('userType');
    
    if (savedPharmacy && savedType === 'pharmacy') {
      setPharmacy(JSON.parse(savedPharmacy));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('http://localhost/heal-u/backend/api/pharmacy_login.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, mot_de_passe: password }),
      });

      const data: PharmacyAuthResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      setPharmacy(data.pharmacy);
      localStorage.setItem('pharmacy', JSON.stringify(data.pharmacy));
      localStorage.setItem('userType', 'pharmacy');
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setPharmacy(null);
    localStorage.removeItem('pharmacy');
    localStorage.removeItem('userType');
  };

  const isAuthenticated = !!pharmacy;

  return (
    <PharmacyAuthContext.Provider value={{ pharmacy, login, logout, isLoading, isAuthenticated }}>
      {children}
    </PharmacyAuthContext.Provider>
  );
};
