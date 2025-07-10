import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, isAdmin, isLoading, validateSession } = useAuth();
  const location = useLocation();
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [sessionValidated, setSessionValidated] = useState(false);

  // Set a timeout for loading state to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoadingTimeout(true);
    }, 15000); // 15 seconds timeout

    return () => clearTimeout(timeout);
  }, []);

  // Validate session when component mounts
  useEffect(() => {
    if (user && !sessionValidated) {
      validateSession().then((isValid) => {
        setSessionValidated(true);
        if (!isValid) {
          console.warn('Session validation failed in ProtectedRoute');
        }
      }).catch((error) => {
        console.error('Session validation error:', error);
        setSessionValidated(true);
      });
    }
  }, [user, validateSession, sessionValidated]);

  // Show loading with timeout handling
  if (isLoading && !loadingTimeout) {
    return (
      <div className="pt-32 pb-20 min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  // If loading timed out, show error
  if (loadingTimeout && isLoading) {
    return (
      <div className="pt-32 pb-20 min-h-screen flex flex-col items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Timeout</h2>
          <p className="text-gray-600 mb-4">The page is taking longer than expected to load.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    // Redirect to home if not an admin
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;