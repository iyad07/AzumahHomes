import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, UserProfile, UserRole } from '@/lib/supabase';
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
  updateProfile: (updates: Partial<Pick<UserProfile, 'full_name' | 'phone' | 'address' | 'bio'>>) => Promise<boolean>;
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
        
        // Handle logout events explicitly
        if (event === 'SIGNED_OUT' || !session) {
          console.log('User signed out, clearing state');
          setSession(null);
          setUser(null);
          setProfile(null);
          setProfileFetchAttempts(0);
          setIsLoading(false);
          return;
        }
        
        // Handle login events
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in, setting up session');
          setSession(session);
          setUser(session.user);
          
          // Reset attempts on new session
          setProfileFetchAttempts(0);
          
          // Ensure user profile exists before fetching
          await ensureUserProfile(session.user);
          await fetchUserProfile(session.user.id, false);
        } else if (session?.user) {
          // Handle other auth events (token refresh, etc.)
          setSession(session);
          setUser(session.user);
          
          if (!profile) {
            // Only fetch profile if we don't have one
            await fetchUserProfile(session.user.id, false);
          }
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

  // Function to fetch user profile with retry logic
  const fetchUserProfile = async (userId: string, isInitialLoad: boolean = false, retryCount = 0): Promise<UserProfile | null> => {
    const maxRetries = 3;
    const retryDelay = Math.pow(2, retryCount) * 1000; // Exponential backoff
    
    console.log('Fetching user profile:', {
      userId,
      isInitialLoad,
      profileFetchAttempts,
      hasProfile: !!profile,
      retryCount
    });
    
    // Skip if we've exceeded max attempts and it's not an initial load or forced refresh
    if (!isInitialLoad && profileFetchAttempts >= MAX_PROFILE_FETCH_ATTEMPTS) {
      console.warn('Max profile fetch attempts reached, skipping');
      setIsLoading(false);
      return null;
    }

    try {
      if (retryCount === 0) {
        setProfileFetchAttempts(prev => prev + 1);
      }
      
      console.log(`Fetching profile for user ${userId} (attempt ${retryCount + 1})`);
      
      // Fetch profile directly
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile not found
          console.log('Profile not found, creating default profile');
          await createDefaultProfile(userId);
          return null;
        }
        
        console.error('Error fetching user profile:', error);
        
        // Retry on network or temporary errors
        if (retryCount < maxRetries && (
          error.message?.includes('network') ||
          error.message?.includes('timeout') ||
          error.code === 'PGRST301' // Connection error
        )) {
          console.log(`Retrying profile fetch in ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          return fetchUserProfile(userId, isInitialLoad, retryCount + 1);
        }
        
        // Only clear profile on initial load or if we don't have one
        if (isInitialLoad || !profile) {
          console.warn('Profile fetch failed, clearing profile state');
          setProfile(null);
        } else {
          console.warn('Profile fetch failed, keeping existing profile to prevent role switching');
        }
        return null;
      }

      if (!data) {
        console.log('No profile data returned');
        return null;
      }
      
      // Ensure all required fields are present with proper null handling
      const normalizedProfile: UserProfile = {
        id: data.id,
        email: data.email,
        role: data.role,
        full_name: data.full_name || null,
        phone: data.phone || null,
        address: data.address || null,
        bio: data.bio || null,
        created_at: data.created_at,
        updated_at: data.updated_at || null
      };
      
      console.log('Profile fetched successfully:', normalizedProfile);
      setProfile(normalizedProfile);
      setProfileFetchAttempts(0); // Reset on success
      return normalizedProfile;
    } catch (error) {
      console.error('Exception fetching profile:', error);
      
      // Retry on exceptions
      if (retryCount < maxRetries) {
        console.log(`Retrying profile fetch in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return fetchUserProfile(userId, isInitialLoad, retryCount + 1);
      }
      
      // Only clear profile on initial load to prevent role switching on refresh
      if (isInitialLoad || !profile) {
        setProfile(null);
      }
      return null;
    } finally {
      if (retryCount === 0) {
        setIsLoading(false);
      }
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
          role: 'user' as UserRole,
          full_name: user.user_metadata?.full_name || null,
          phone: user.user_metadata?.phone || null,
          address: null,
          bio: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
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
      console.log('Starting login process for:', email);
      
      // Add timeout protection for login
      const loginPromise = supabase.auth.signInWithPassword({ email, password });
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Login timeout - please try again')), 15000)
      );
      
      const { error, data } = await Promise.race([loginPromise, timeoutPromise]) as any;
      
      if (error) throw error;
      
      // Don't wait for profile check - let it happen in background
      if (data.user) {
        console.log('Login successful, checking profile in background for:', data.user.email);
        // Run profile check asynchronously without blocking login
        ensureUserProfile(data.user).catch(error => {
          console.error('Background profile check failed:', error);
        });
      }
      
      toast.success('Signed in successfully');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to sign in');
      throw error;
    }
  }

  // Helper function to ensure user profile exists (optimized for speed)
  async function ensureUserProfile(user: any) {
    try {
      console.log('Checking profile for user:', user.email);
      
      // Determine role based on email
      const adminEmails = [
        'iodeenoxide@gmail.com',
        'oideenz4@gmail.com', 
        'azumahhomes@gmail.com',
      ];
      
      const isAdminUser = adminEmails.includes(user.email?.toLowerCase() || '');
      const expectedRole = isAdminUser ? 'admin' : 'user';
      
      // First, check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error checking existing profile:', fetchError);
        return null;
      }
      
      if (existingProfile) {
        // Profile exists, only update if role or email needs correction
        const needsUpdate = 
          existingProfile.role !== expectedRole || 
          existingProfile.email !== user.email;
        
        if (needsUpdate) {
          console.log('Updating existing profile role/email');
          const { data: updatedProfile, error: updateError } = await supabase
            .from('profiles')
            .update({
              role: expectedRole as UserRole,
              email: user.email,
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id)
            .select()
            .single();
          
          if (updateError) {
            console.error('Error updating profile:', updateError);
            return existingProfile; // Return existing profile if update fails
          }
          
          console.log('Profile updated:', updatedProfile);
          return updatedProfile;
        } else {
          console.log('Profile exists and is up to date');
          return existingProfile;
        }
      } else {
        // Profile doesn't exist, create new one
        console.log('Creating new profile');
        const profileData = {
          id: user.id,
          email: user.email,
          role: expectedRole as UserRole,
          full_name: user.user_metadata?.full_name || null,
          phone: user.user_metadata?.phone || null,
          address: null,
          bio: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert(profileData)
          .select()
          .single();
        
        if (insertError) {
          console.error('Error creating profile:', insertError);
          return null;
        }
        
        console.log('Profile created:', newProfile);
        return newProfile;
      }
    } catch (error) {
      console.error('Exception in ensureUserProfile:', error);
      return null;
    }
  }

  async function signUp(email: string, password: string, fullName?: string, phone?: string) {
    try {
      console.log('Starting signup process for:', email);
      setIsLoading(true);
      
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
      
      if (error) {
        console.error('Auth signup error:', error);
        setIsLoading(false);
        throw error;
      }
      
      console.log('Auth signup successful, user ID:', data.user?.id);
      
      // Profile will be created automatically when user first logs in
      if (data.user) {
        console.log('User created successfully, profile will be created on first login');
        toast.success('Account created successfully! Please check your email for verification.');
        setIsLoading(false);
        return;
      }
      
      toast.success('Account created successfully! Please check your email for verification.');
      setIsLoading(false);
    } catch (error: any) {
      console.error('Signup error:', error);
      setIsLoading(false);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to create account';
      if (error.message?.includes('already registered')) {
        errorMessage = 'An account with this email already exists. Please try logging in instead.';
      } else if (error.message?.includes('Password')) {
        errorMessage = 'Password must be at least 6 characters long.';
      } else if (error.message?.includes('email')) {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      throw error;
    }
  }

  async function signOut() {
    try {
      console.log('Starting logout process');
      
      // Clear local state immediately to prevent UI flickering
      setSession(null);
      setUser(null);
      setProfile(null);
      setProfileFetchAttempts(0);
      setIsLoading(false); // Explicitly reset loading state
      
      // Sign out from Supabase with global scope to ensure complete logout
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) {
        console.error('Error signing out:', error);
        // Don't throw here, as local state is already cleared
      }
      
      console.log('Logout completed successfully');
      toast.success('Signed out successfully');
    } catch (error: any) {
      console.error('Error signing out:', error);
      // Ensure loading state is reset even on error
      setIsLoading(false);
      toast.error(error.message || 'Failed to sign out');
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

  // Enhanced admin check
  const isAdmin = React.useMemo(() => {
    // Don't determine admin status if still loading or no profile
    if (isLoading || !profile) {
      return false;
    }
    return profile?.role === 'admin';
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

  // Function to update user profile
  const updateProfile = async (updates: Partial<Pick<UserProfile, 'full_name' | 'phone' | 'address' | 'bio'>>) => {
    try {
      if (!user || !profile) {
        console.error('No user or profile found');
        toast.error('Please log in to update your profile');
        return false;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ 
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        toast.error('Failed to update profile');
        return false;
      }

      // Update local profile state
      setProfile(prev => prev ? { ...prev, ...updates, updated_at: new Date().toISOString() } : null);
      
      console.log('Profile updated successfully');
      toast.success('Profile updated successfully');
      return true;
    } catch (error) {
      console.error('Exception updating profile:', error);
      toast.error('Failed to update profile');
      return false;
    }
  };

  // Function to manually refetch profile
  const refetchProfile = async () => {
    if (!user) {
      console.warn('No user found, cannot refetch profile');
      return null;
    }
    
    console.log('Manually refetching profile for user:', user.id);
    setIsLoading(true);
    
    try {
      setProfileFetchAttempts(0);
      const profile = await fetchUserProfile(user.id, true);
      return profile;
    } catch (error) {
      console.error('Error refetching profile:', error);
      return null;
    } finally {
      setIsLoading(false);
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
    updateProfile,
    refetchProfile,
  };

  // Cast refetchProfile return type to void before providing context
  const contextValue: AuthContextType = {
    ...value,
    refetchProfile: async () => {
      await value.refetchProfile();
    }
  };
  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}