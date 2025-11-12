import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, UserProfile } from '@/lib/supabase';
import { toast } from 'sonner';
import { sessionMonitor, logSessionEvent } from '@/utils/sessionMonitor';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string, phone?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  validateSession: () => Promise<boolean>;
  updateUserRole: (userId: string, role: 'admin' | 'user') => Promise<boolean>;
  refetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileFetchAttempts, setProfileFetchAttempts] = useState(0);
  const [lastProfileFetch, setLastProfileFetch] = useState<string | null>(null);

  const MAX_PROFILE_FETCH_ATTEMPTS = 3;
  const PROFILE_CACHE_DURATION = 5 * 60 * 1000;
  const PROFILE_FETCH_TIMEOUT = 5000; // Reduced from 20s to 5s

  async function retryFetch<T>(fn: () => Promise<T>, retries = 2, delay = 500): Promise<T> {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (err) {
        console.warn(`Retry ${i + 1} failed:`, err);
        if (i === retries - 1) throw err;
        await new Promise(res => setTimeout(res, delay * (i + 1)));
      }
    }
    throw new Error("All retries failed");
  }

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const initializeAuth = async () => {
      try {
        timeoutId = setTimeout(() => {
          if (mounted) {
            console.warn('Auth initialization timeout');
            setIsLoading(false);
          }
        }, 3000); // Reduced timeout for initial auth

        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
          if (mounted) setIsLoading(false);
          return;
        }

        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          // Set loading to false immediately when session is available
          // This allows UI to render while profile loads in background
          setIsLoading(false);

          if (session?.user) {
            // Fetch profile in background without blocking UI
            fetchUserProfile(session.user.id, true).catch(console.error);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) setIsLoading(false);
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state change:', event, !!session);
        
        // Log session events for monitoring
        if (event === 'SIGNED_IN' && session) {
          logSessionEvent.sessionStart(session.access_token, session.user.id);
        } else if (event === 'SIGNED_OUT') {
          logSessionEvent.sessionEnd(
            session?.access_token || 'unknown',
            session?.user?.id || 'unknown',
            'auth_state_change'
          );
        } else if (event === 'TOKEN_REFRESHED' && session) {
          logSessionEvent.sessionRefresh(session.access_token, session.user.id, true);
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Always set loading to false for immediate UI response
        setIsLoading(false);

        if (session?.user) {
          setProfileFetchAttempts(0);
          // Fetch profile in background without blocking UI
          fetchUserProfile(session.user.id, false).catch(console.error);
        } else {
          setProfile(null);
          setProfileFetchAttempts(0);
          setLastProfileFetch(null);
        }
      }
    );

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string, isInitialLoad: boolean = false) => {
    const now = Date.now();
    const lastFetchTime = lastProfileFetch ? new Date(lastProfileFetch).getTime() : 0;
    const timeSinceLastFetch = now - lastFetchTime;

    if (!isInitialLoad && profileFetchAttempts >= MAX_PROFILE_FETCH_ATTEMPTS) {
      console.warn('Max profile fetch attempts reached, using default profile');
      // Create a safe default profile instead of skipping
      const defaultProfile = {
        id: userId,
        email: user?.email || '',
        role: 'user' as const,
        created_at: new Date().toISOString()
      };
      setProfile(defaultProfile);
      return;
    }

    if (!isInitialLoad && profile && timeSinceLastFetch < PROFILE_CACHE_DURATION) {
      console.log('Using cached profile data:', profile);
      return;
    }

    try {
      setProfileFetchAttempts(prev => prev + 1);

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), PROFILE_FETCH_TIMEOUT);
      });

      const fetchPromise = retryFetch(() =>
        Promise.resolve(supabase.from('profiles').select('*').eq('id', userId).single()), 3, 1000
      );

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

      if (error) {
        console.error('Error fetching user profile:', error);

        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating default profile');
          await createDefaultProfile(userId);
          return;
        }

        // Check if this is a network/timeout error vs auth error
        const isNetworkError = error.message === 'Profile fetch timeout' || 
                              error.code === 'PGRST301' ||
                              error.message?.includes('network') ||
                              error.message?.includes('fetch');

        if (isNetworkError) {
          console.warn('Network error during profile fetch, using default profile');
          
          // Use existing profile if available, otherwise create default
          if (!profile) {
            const defaultProfile = {
              id: userId,
              email: user?.email || '',
              role: 'user' as const,
              created_at: new Date().toISOString()
            };
            setProfile(defaultProfile);
          }
        } else {
          // For non-network errors, still provide a default profile
          const defaultProfile = {
            id: userId,
            email: user?.email || '',
            role: 'user' as const,
            created_at: new Date().toISOString()
          };
          setProfile(defaultProfile);
        }
      } else {
        console.log('Profile fetched successfully:', data);
        setProfile(data);
        setLastProfileFetch(new Date().toISOString());
        setProfileFetchAttempts(0);
      }
    } catch (error) {
      console.error('Error fetching user profile (outer):', error);
      
      // Always provide a fallback profile instead of setting null
      const defaultProfile = {
        id: userId,
        email: user?.email || '',
        role: 'user' as const,
        created_at: new Date().toISOString()
      };
      
      console.log('Using default profile due to fetch error');
      setProfile(defaultProfile);
    } finally {
      // Don't set loading state here since we want immediate UI response
      // Profile loading happens in background
    }
  };

  const createDefaultProfile = async (userId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert([{ 
          id: userId, 
          email: user.email || '', 
          role: 'user',
          full_name: user.user_metadata?.full_name || '',
          phone: user.user_metadata?.phone || '',
          created_at: new Date().toISOString()
        }], { onConflict: 'id' });

      if (profileError) {
        console.error('Error creating default profile:', profileError);
      } else {
        console.log('Default profile created successfully');
        await fetchUserProfile(userId, true);
      }
    } catch (error) {
      console.error('Exception creating default profile:', error);
    }
  };

  async function signIn(email: string, password: string) {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success('Signed in successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in');
      throw error;
    }
  }

  async function signUp(email: string, password: string, fullName?: string, phone?: string) {
    try {
      const { error, data } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: fullName || '',
            phone: phone || ''
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert([{ 
              id: data.user.id, 
              email, 
              role: 'user',
              full_name: fullName || '',
              phone: phone || '',
              created_at: new Date().toISOString()
            }], { onConflict: 'id' });

          if (profileError) {
            console.error('Error creating profile:', profileError);
            toast.error('Account created but profile setup failed. Please contact support.');
            return;
          }
        } catch (profileErr) {
          console.error('Exception creating profile:', profileErr);
          toast.error('Account created but profile setup failed. Please contact support.');
          return;
        }
      }

      toast.success('Account created successfully. Please check your email for verification.');
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Failed to create account');
      throw error;
    }
  }

  async function signOut() {
    try {
      setIsLoading(true);
      console.log('Initiating sign out process');
      
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) {
        console.error('Error signing out:', error);
        // Continue with cleanup even if signOut fails
      }
      
      // Clear all state immediately
      setSession(null);
      setUser(null);
      setProfile(null);
      setProfileFetchAttempts(0);
      setLastProfileFetch(null);
      
      // Clear any stored tokens and auth data
      try {
        localStorage.removeItem('supabase.auth.token');
        // Clear any other auth-related localStorage items
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('supabase.auth')) {
            localStorage.removeItem(key);
          }
        });
      } catch (storageError) {
        console.warn('Error clearing localStorage:', storageError);
      }
      
      console.log('Sign out completed successfully');
      toast.success('Signed out successfully');
      
    } catch (error: any) {
      console.error('Error during sign out:', error);
      // Force clear state even if there's an error
      setSession(null);
      setUser(null);
      setProfile(null);
      setProfileFetchAttempts(0);
      setLastProfileFetch(null);
    } finally {
      setIsLoading(false);
    }
  }

  const refreshSession = async () => {
    try {
      console.log('Attempting to refresh session...');
      
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Error refreshing session:', error);
        logSessionEvent.authError(error, 'refresh_session');
        
        // If refresh fails due to invalid refresh token, force logout
        if (error.message?.includes('refresh_token') || error.message?.includes('invalid')) {
          console.warn('Invalid refresh token, forcing logout');
          logSessionEvent.unexpectedLogout('invalid_refresh_token', session?.access_token, session?.user?.id);
          await signOut();
        }
        
        logSessionEvent.sessionRefresh(session?.access_token || 'unknown', session?.user?.id || 'unknown', false);
        return false;
      }
      
      if (session) {
        console.log('Session refreshed successfully', {
          expiresAt: session.expires_at,
          userId: session.user?.id
        });
        
        logSessionEvent.sessionRefresh(session.access_token, session.user.id, true);
        
        setSession(session);
        setUser(session.user);
        
        // Refetch profile after session refresh to ensure consistency
        if (session.user) {
          fetchUserProfile(session.user.id, false).catch(console.error);
        }
        
        return true;
      }
      
      console.warn('Session refresh returned no session');
      logSessionEvent.sessionRefresh('unknown', 'unknown', false);
      return false;
    } catch (error) {
      console.error('Exception during session refresh:', error);
      logSessionEvent.authError(error, 'refresh_session_exception');
      logSessionEvent.sessionRefresh('unknown', 'unknown', false);
      return false;
    }
  };

  const validateSession = async () => {
    if (!session) {
      console.log('No session found during validation');
      logSessionEvent.sessionValidation('unknown', 'unknown', false, { reason: 'no_session' });
      return false;
    }
    
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = session.expires_at || 0;
    
    // Check if session is already expired
    if (expiresAt <= now) {
      console.warn('Session has already expired, forcing logout');
      logSessionEvent.sessionValidation(session.access_token, session.user?.id || 'unknown', false, {
        reason: 'expired',
        expiresAt,
        now,
        expiredBy: now - expiresAt
      });
      logSessionEvent.unexpectedLogout('session_expired', session.access_token, session.user?.id);
      await signOut();
      return false;
    }
    
    // Refresh session if expiring within 5 minutes (300 seconds)
    if (expiresAt - now < 300) {
      console.log('Session expiring soon, refreshing...', {
        expiresAt,
        now,
        timeLeft: expiresAt - now
      });
      
      const refreshSuccess = await refreshSession();
      if (!refreshSuccess) {
        console.warn('Session refresh failed, forcing logout');
        logSessionEvent.sessionValidation(session.access_token, session.user?.id || 'unknown', false, {
          reason: 'refresh_failed',
          expiresAt,
          now,
          timeLeft: expiresAt - now
        });
        logSessionEvent.unexpectedLogout('refresh_failed', session.access_token, session.user?.id);
        await signOut();
        return false;
      }
      logSessionEvent.sessionValidation(session.access_token, session.user?.id || 'unknown', true, {
        reason: 'refreshed',
        timeLeft: expiresAt - now
      });
      return true;
    }
    
    logSessionEvent.sessionValidation(session.access_token, session.user?.id || 'unknown', true, {
      reason: 'valid',
      timeLeft: expiresAt - now
    });
    return true;
  };

  const isAdmin = React.useMemo(() => {
    const adminStatus = profile?.role === 'admin';
    console.log('Admin status check:', {
      profile: profile,
      role: profile?.role,
      isAdmin: adminStatus,
      userId: user?.id
    });
    return adminStatus;
  }, [profile?.role, user?.id]);

  useEffect(() => {
    let validationInterval: NodeJS.Timeout | null = null;
    let isValidating = false;

    if (session && user) {
      validationInterval = setInterval(async () => {
        // Prevent concurrent validation calls
        if (isValidating) {
          console.log('Session validation already in progress, skipping');
          return;
        }

        isValidating = true;
        try {
          const isValid = await validateSession();
          if (!isValid) {
            console.log('Session validation failed, user will be signed out');
            // Don't call signOut here as validateSession already handles it
          }
        } catch (error) {
          console.error('Error during session validation:', error);
        } finally {
          isValidating = false;
        }
      }, 60000); // Check every minute
    }

    return () => {
      if (validationInterval) {
        clearInterval(validationInterval);
      }
    };
  }, [session, user]);

  const updateUserRole = async (userId: string, role: 'admin' | 'user') => {
    try {
      if (!isAdmin) {
        console.error('Only admins can update user roles');
        toast.error('Unauthorized: Only admins can update user roles');
        return false;
      }
      const { error } = await supabase
        .from('profiles')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user role:', error);
        toast.error('Failed to update user role');
        return false;
      }
      console.log(`User role updated successfully: ${userId} -> ${role}`);
      toast.success(`User role updated to ${role}`);
      return true;
    } catch (error) {
      console.error('Exception updating user role:', error);
      toast.error('Failed to update user role');
      return false;
    }
  };

  const refetchProfile = async () => {
    if (user) {
      setProfileFetchAttempts(0);
      setLastProfileFetch(null);
      await fetchUserProfile(user.id, true);
    }
  };

  const value = {
    session,
    user,
    profile,
    isAdmin,
    isLoading,
    signIn,
    signUp,
    signOut,
    refreshSession,
    validateSession,
    updateUserRole,
    refetchProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
