import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, isAdmin, isLoading, validateSession, profile } = useAuth();
  const location = useLocation();
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [sessionValidated, setSessionValidated] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // Debug logging for role checking
  React.useEffect(() => {
    if (requireAdmin) {
      console.log('ProtectedRoute admin check:', {
        requireAdmin,
        user: !!user,
        profile,
        isAdmin,
        isLoading,
        currentPath: location.pathname
      });
    }
  }, [requireAdmin, user, profile, isAdmin, isLoading, location.pathname]);

  // Set a timeout for loading state to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoadingTimeout(true);
    }, 5000); // Reduced to 5 seconds timeout

    return () => clearTimeout(timeout);
  }, []);

  // Handle profile loading for admin routes
  useEffect(() => {
    if (requireAdmin && user && !profile) {
      setProfileLoading(true);
      const timeout = setTimeout(() => {
        setProfileLoading(false);
      }, 3000); // Wait max 3 seconds for profile
      return () => clearTimeout(timeout);
    } else {
      setProfileLoading(false);
    }
  }, [requireAdmin, user, profile]);

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

  // Show loading only for initial auth or profile loading for admin routes
  if ((isLoading && !loadingTimeout) || (requireAdmin && profileLoading && !profile)) {
    return (
      <div className="pt-32 pb-20 min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">
          {requireAdmin && profileLoading ? 'Loading user profile...' : 'Loading...'}
        </p>
      </div>
    );
  }

  // If loading timed out, show error
  if (loadingTimeout && (isLoading || (requireAdmin && profileLoading))) {
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
    // Show more informative message for non-admin users
    console.warn('Access denied: Admin role required', {
      user: !!user,
      profile,
      isAdmin,
      requireAdmin
    });
    
    return (
      <div className="pt-32 pb-20 min-h-screen flex flex-col items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You need administrator privileges to access this page.</p>
          <p className="text-sm text-gray-500 mb-4">
            Current role: {profile?.role || 'Unknown'}
          </p>
          <button 
            onClick={() => window.history.back()} 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-2"
          >
            Go Back
          </button>
          <button 
            onClick={() => window.location.href = '/'} 
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;