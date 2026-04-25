import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserType?: 'doctor' | 'patient' | 'pharmacy';
}

export default function ProtectedRoute({ children, requiredUserType }: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<'doctor' | 'patient' | 'pharmacy' | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const storedUserType = localStorage.getItem('userType');

      if (token && storedUserType) {
        setIsAuthenticated(true);
        setUserType(storedUserType as 'doctor' | 'patient' | 'pharmacy');

        // Check if required user type matches
        if (requiredUserType && storedUserType !== requiredUserType) {
          // Redirect to appropriate dashboard based on user type
          if (storedUserType === 'doctor') {
            navigate('/doctor-dashboard');
          } else if (storedUserType === 'patient') {
            navigate('/patient-portal');
          } else if (storedUserType === 'pharmacy') {
            navigate('/pharmacy-dashboard');
          } else {
            navigate('/');
          }
          return;
        }
      } else {
        setIsAuthenticated(false);
        navigate('/login');
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [navigate, requiredUserType]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Checking authentication...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  if (requiredUserType && userType !== requiredUserType) {
    return null; // Will redirect to appropriate dashboard
  }

  return <>{children}</>;
}
