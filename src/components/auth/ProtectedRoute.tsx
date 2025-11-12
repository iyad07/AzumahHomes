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
          console.warn('Session validation failed in ProtectedRoute - user will be redirected');
          // Don't manually redirect here, let AuthContext handle it
        }
      }).catch((error) => {
        console.error('Session validation error in ProtectedRoute:', error);
        setSessionValidated(true);
        // Continue with normal flow even if validation fails
      });
    } else if (!user) {
      // Reset validation state when user logs out
      setSessionValidated(false);
    }
  }, [user, validateSession, sessionValidated]);

  // Show loading only for initial auth or profile loading for admin routes
  if ((isLoading && !loadingTimeout) || (requireAdmin && profileLoading && !profile)) {
    return (
      <div className="pt-32 pb-20 min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">
          {requireAdmin && profileLoading ? 'Loading user profile...' : 'Authenticating...'}
        </p>
        {(isLoading && !loadingTimeout) && (
          <p className="text-sm text-gray-500 mt-2">
            This should only take a moment
          </p>
        )}
      </div>
    );
  }

  // If loading timed out, show error with better recovery options
  if (loadingTimeout && (isLoading || (requireAdmin && profileLoading))) {
    return (
      <div className="pt-32 pb-20 min-h-screen flex flex-col items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Authentication Timeout</h2>
          <p className="text-gray-600 mb-4">
            The authentication process is taking longer than expected. This might be due to network issues.
          </p>
          <div className="space-y-2">
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
            >
              Refresh Page
            </button>
            <button 
              onClick={() => window.location.href = '/login'} 
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 w-full"
            >
              Go to Login
            </button>
          </div>
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