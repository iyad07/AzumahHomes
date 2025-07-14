import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, RefreshCw } from 'lucide-react';

interface AuthDebugPanelProps {
  className?: string;
}

const AuthDebugPanel: React.FC<AuthDebugPanelProps> = ({ className = '' }) => {
  const { 
    user, 
    profile, 
    session, 
    isAdmin, 
    isLoading, 
    refetchProfile 
  } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshProfile = async () => {
    setIsRefreshing(true);
    try {
      await refetchProfile();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Only show in development or for admins
  const shouldShow = process.env.NODE_ENV === 'development' || isAdmin;
  
  if (!shouldShow) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
        title="Toggle Auth Debug Panel"
      >
        {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
      
      {isVisible && (
        <div className="absolute bottom-12 right-0 w-80 bg-white border border-gray-200 rounded-lg shadow-xl p-4 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Auth Debug Panel</h3>
            <button
              onClick={handleRefreshProfile}
              disabled={isRefreshing}
              className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
              title="Refresh Profile"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          <div className="space-y-3 text-xs">
            {/* Loading State */}
            <div className="bg-gray-50 p-2 rounded">
              <div className="font-medium text-gray-700 mb-1">Loading State</div>
              <div className={`px-2 py-1 rounded text-white text-center ${
                isLoading ? 'bg-yellow-500' : 'bg-green-500'
              }`}>
                {isLoading ? 'Loading...' : 'Loaded'}
              </div>
            </div>
            
            {/* User Info */}
            <div className="bg-gray-50 p-2 rounded">
              <div className="font-medium text-gray-700 mb-1">User</div>
              {user ? (
                <div className="space-y-1">
                  <div><strong>ID:</strong> {user.id.slice(0, 8)}...</div>
                  <div><strong>Email:</strong> {user.email}</div>
                  <div><strong>Verified:</strong> {user.email_confirmed_at ? '✅' : '❌'}</div>
                </div>
              ) : (
                <div className="text-red-600">No user</div>
              )}
            </div>
            
            {/* Profile Info */}
            <div className="bg-gray-50 p-2 rounded">
              <div className="font-medium text-gray-700 mb-1">Profile</div>
              {profile ? (
                <div className="space-y-1">
                  <div><strong>Role:</strong> 
                    <span className={`ml-1 px-2 py-0.5 rounded text-white ${
                      profile.role === 'admin' ? 'bg-green-600' : 'bg-blue-600'
                    }`}>
                      {profile.role}
                    </span>
                  </div>
                  <div><strong>Name:</strong> {profile.full_name || 'Not set'}</div>
                  <div><strong>Phone:</strong> {profile.phone || 'Not set'}</div>
                  <div><strong>Created:</strong> {new Date(profile.created_at).toLocaleDateString()}</div>
                </div>
              ) : (
                <div className="text-red-600">No profile</div>
              )}
            </div>
            
            {/* Admin Status */}
            <div className="bg-gray-50 p-2 rounded">
              <div className="font-medium text-gray-700 mb-1">Admin Status</div>
              <div className={`px-2 py-1 rounded text-white text-center ${
                isAdmin ? 'bg-green-500' : 'bg-gray-500'
              }`}>
                {isAdmin ? 'Admin ✅' : 'Regular User'}
              </div>
            </div>
            
            {/* Session Info */}
            <div className="bg-gray-50 p-2 rounded">
              <div className="font-medium text-gray-700 mb-1">Session</div>
              {session ? (
                <div className="space-y-1">
                  <div><strong>Expires:</strong> {new Date((session.expires_at || 0) * 1000).toLocaleString()}</div>
                  <div><strong>Provider:</strong> {session.user?.app_metadata?.provider || 'email'}</div>
                </div>
              ) : (
                <div className="text-red-600">No session</div>
              )}
            </div>
            
            {/* Raw Data Toggle */}
            <details className="bg-gray-50 p-2 rounded">
              <summary className="font-medium text-gray-700 cursor-pointer">Raw Data</summary>
              <div className="mt-2 space-y-2">
                <div>
                  <div className="font-medium">Profile:</div>
                  <pre className="text-xs bg-gray-100 p-1 rounded overflow-x-auto">
                    {JSON.stringify(profile, null, 2)}
                  </pre>
                </div>
                <div>
                  <div className="font-medium">User Metadata:</div>
                  <pre className="text-xs bg-gray-100 p-1 rounded overflow-x-auto">
                    {JSON.stringify(user?.user_metadata, null, 2)}
                  </pre>
                </div>
              </div>
            </details>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthDebugPanel;