import React, { createContext, useContext, useEffect, useState } from 'react';
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

  // Maximum retry attempts
  const MAX_PROFILE_FETCH_ATTEMPTS = 3;

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
        }, 10000); // 10 seconds timeout

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
    console.log('Fetching user profile:', {
      userId,
      isInitialLoad,
      profileFetchAttempts,
      hasProfile: !!profile
    });
    
    // Skip if we've exceeded max attempts and it's not an initial load or forced refresh
    if (!isInitialLoad && profileFetchAttempts >= MAX_PROFILE_FETCH_ATTEMPTS) {
      console.warn('Max profile fetch attempts reached, skipping');
      setIsLoading(false);
      return;
    }

    try {
      setProfileFetchAttempts(prev => prev + 1);
      
      // Fetch profile directly
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        
        // If profile doesn't exist, create a default one
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating default profile');
          await createDefaultProfile(userId);
          return;
        }
        
        // Only clear profile on initial load or if we don't have one
        if (isInitialLoad || !profile) {
          console.warn('Profile fetch failed, clearing profile state');
          setProfile(null);
        } else {
          console.warn('Profile fetch failed, keeping existing profile to prevent role switching');
        }
      } else {
        console.log('Profile fetched successfully:', data);
        setProfile(data);
        setProfileFetchAttempts(0); // Reset on success
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Only clear profile on initial load to prevent role switching on refresh
      if (isInitialLoad || !profile) {
        setProfile(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to create default profile if it doesn't exist
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
        // Fetch the newly created profile
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
      // Clear local state immediately to prevent UI flickering
      setSession(null);
      setUser(null);
      setProfile(null);
      setProfileFetchAttempts(0);
      
      // Sign out from Supabase with local scope for faster logout
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) {
        console.error('Error signing out:', error);
        // Don't throw here, as local state is already cleared
      }
      
      toast.success('Signed out successfully');
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast.error(error.message || 'Failed to sign out');
    } //finally {
      //setIsLoading(false);
   // }
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

  // Enhanced admin check with better debugging
  const isAdmin = React.useMemo(() => {
    // Don't determine admin status if still loading or no profile
    if (isLoading || !profile) {
      return false;
    }
    const adminStatus = profile?.role === 'admin';
    console.log('Admin status check:', {
      profile: profile,
      role: profile?.role,
      isAdmin: adminStatus,
      userId: user?.id,
      isLoading
    });
    return adminStatus;
  }, [profile?.role, user?.id, isLoading]);

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

  // Function to update user role (admin only)
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

  // Function to manually refetch profile
  const refetchProfile = async () => {
    if (user) {
      console.log('Manually refetching profile for user:', user.id);
      setIsLoading(true);
      setProfileFetchAttempts(0);
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