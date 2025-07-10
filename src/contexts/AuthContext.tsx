import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, UserProfile } from '@/lib/supabase';
import { toast } from 'sonner';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileFetchAttempts, setProfileFetchAttempts] = useState(0);
  const [lastProfileFetch, setLastProfileFetch] = useState<string | null>(null);

  // Maximum retry attempts and cache duration
  const MAX_PROFILE_FETCH_ATTEMPTS = 3;
  const PROFILE_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  const PROFILE_FETCH_TIMEOUT = 10000; // 10 seconds

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const initializeAuth = async () => {
      try {
        // Set a timeout for the entire initialization
        timeoutId = setTimeout(() => {
          if (mounted) {
            console.warn('Auth initialization timeout');
            setIsLoading(false);
          }
        }, PROFILE_FETCH_TIMEOUT);

        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setIsLoading(false);
          }
          return;
        }

        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await fetchUserProfile(session.user.id, true);
          } else {
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setIsLoading(false);
        }
      } finally {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state change:', event, !!session);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Reset attempts on new session
          setProfileFetchAttempts(0);
          await fetchUserProfile(session.user.id, false);
        } else {
          setProfile(null);
          setProfileFetchAttempts(0);
          setLastProfileFetch(null);
          setIsLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string, isInitialLoad: boolean = false) => {
    // Check if we should skip fetching due to recent cache or max attempts
    const now = Date.now();
    const lastFetchTime = lastProfileFetch ? new Date(lastProfileFetch).getTime() : 0;
    const timeSinceLastFetch = now - lastFetchTime;
    
    // Skip if we've exceeded max attempts and it's not an initial load
    if (!isInitialLoad && profileFetchAttempts >= MAX_PROFILE_FETCH_ATTEMPTS) {
      console.warn('Max profile fetch attempts reached, skipping');
      setIsLoading(false);
      return;
    }
    
    // Skip if we have a recent successful fetch (cache)
    if (!isInitialLoad && profile && timeSinceLastFetch < PROFILE_CACHE_DURATION) {
      console.log('Using cached profile data');
      setIsLoading(false);
      return;
    }

    try {
      setProfileFetchAttempts(prev => prev + 1);
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), PROFILE_FETCH_TIMEOUT);
      });
      
      // Create the fetch promise
      const fetchPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      // Race between fetch and timeout
      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

      if (error) {
        console.error('Error fetching user profile:', error);
        
        // If it's a timeout or network error, don't reset profile immediately
        if (error.message === 'Profile fetch timeout' || error.code === 'PGRST301') {
          console.warn('Profile fetch failed, retrying may be needed');
        } else {
          setProfile(null);
        }
      } else {
        setProfile(data);
        setLastProfileFetch(new Date().toISOString());
        setProfileFetchAttempts(0); // Reset on success
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      
      // Only clear profile on non-timeout errors
      if (error instanceof Error && error.message !== 'Profile fetch timeout') {
        setProfile(null);
      }
    } finally {
      setIsLoading(false);
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
      // First, sign up the user with Supabase Auth
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
      
      // If we have a user, create their profile
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
            // We don't throw here because the auth was successful
            toast.error('Account created but profile setup failed. Please contact support.');
            return;
          }
        } catch (profileErr) {
          console.error('Exception creating profile:', profileErr);
          // We don't throw here because the auth was successful
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
      
      // Clear local state immediately to prevent UI flickering
      setSession(null);
      setUser(null);
      setProfile(null);
      setProfileFetchAttempts(0);
      setLastProfileFetch(null);
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) {
        console.error('Error signing out:', error);
        // Don't throw here, as local state is already cleared
      }
      
      toast.success('Signed out successfully');
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast.error(error.message || 'Failed to sign out');
    } finally {
      setIsLoading(false);
    }
  }
  
  // Add session refresh function
  const refreshSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Error refreshing session:', error);
        return false;
      }
      
      if (session) {
        setSession(session);
        setUser(session.user);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error refreshing session:', error);
      return false;
    }
  };
  
  // Add session validation
  const validateSession = async () => {
    if (!session) return false;
    
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = session.expires_at || 0;
    
    // If session expires in less than 5 minutes, refresh it
    if (expiresAt - now < 300) {
      console.log('Session expiring soon, refreshing...');
      return await refreshSession();
    }
    
    return true;
  };

  const isAdmin = profile?.role === 'admin';

  // Add periodic session validation
  useEffect(() => {
    if (!session || !user) return;
    
    const interval = setInterval(async () => {
      const isValid = await validateSession();
      if (!isValid) {
        console.warn('Session validation failed, signing out');
        await signOut();
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [session, user]);

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