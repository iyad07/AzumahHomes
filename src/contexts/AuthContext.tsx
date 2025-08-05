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
  const [lastProfileFetch, setLastProfileFetch] = useState<string | null>(null);

  const MAX_PROFILE_FETCH_ATTEMPTS = 5;
  const PROFILE_CACHE_DURATION = 5 * 60 * 1000;
  const PROFILE_FETCH_TIMEOUT = 20000;

  const retryFetch = async <T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> => {
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
  };

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
        }, PROFILE_FETCH_TIMEOUT);

        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
          if (mounted) setIsLoading(false);
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
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
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
      if (timeoutId) clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string, isInitialLoad: boolean = false) => {
    const now = Date.now();
    const lastFetchTime = lastProfileFetch ? new Date(lastProfileFetch).getTime() : 0;
    const timeSinceLastFetch = now - lastFetchTime;

    if (!isInitialLoad && profileFetchAttempts >= MAX_PROFILE_FETCH_ATTEMPTS) {
      console.warn('Max profile fetch attempts reached, skipping');
      setIsLoading(false);
      return;
    }

    if (!isInitialLoad && profile && timeSinceLastFetch < PROFILE_CACHE_DURATION) {
      console.log('Using cached profile data:', profile);
      setIsLoading(false);
      return;
    }

    try {
      setProfileFetchAttempts(prev => prev + 1);

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), PROFILE_FETCH_TIMEOUT);
      });

      const fetchPromise = retryFetch(() =>
        supabase.from('profiles').select('*').eq('id', userId).single()
      );

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

      if (error) {
        console.error('Error fetching user profile:', error);

        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating default profile');
          await createDefaultProfile(userId);
          return;
        }

        if (error.message === 'Profile fetch timeout' || error.code === 'PGRST301') {
          console.warn('Profile fetch failed, retrying may be needed');
        } else {
          setProfile(null);
        }
      } else {
        console.log('Profile fetched successfully:', data);
        setProfile(data);
        setLastProfileFetch(new Date().toISOString());
        setProfileFetchAttempts(0);
      }
    } catch (error) {
      console.error('Error fetching user profile (outer):', error);
      if (error instanceof Error && error.message !== 'Profile fetch timeout') {
        setProfile(null);
      }
    } finally {
      setIsLoading(false);
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
      setSession(null);
      setUser(null);
      setProfile(null);
      setProfileFetchAttempts(0);
      setLastProfileFetch(null);

      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) console.error('Error signing out:', error);
      toast.success('Signed out successfully');
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast.error(error.message || 'Failed to sign out');
    } finally {
      setIsLoading(false);
    }
  }

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

  const validateSession = async () => {
    if (!session) return false;
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = session.expires_at || 0;
    if (expiresAt - now < 300) {
      console.log('Session expiring soon, refreshing...');
      return await refreshSession();
    }
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
    if (!session || !user) return;
    const interval = setInterval(async () => {
      const isValid = await validateSession();
      if (!isValid) {
        console.warn('Session validation failed, signing out');
        await signOut();
      }
    }, 60000);
    return () => clearInterval(interval);
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
