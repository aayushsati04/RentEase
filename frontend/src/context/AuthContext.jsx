import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to fetch profile details from our public profiles table
  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error fetching user profile from database:', err);
      return null;
    }
  };

  useEffect(() => {
    // Check active session on mount
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          if (profile) {
            setUser({
              id: profile.id,
              _id: profile.id, // Compatibility fallback
              name: profile.name,
              email: profile.email,
              phone: profile.phone,
              role: profile.role
            });
          }
        }
      } catch (err) {
        console.error('Session check error:', err);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setLoading(true);
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        if (profile) {
          setUser({
            id: profile.id,
            _id: profile.id, // Compatibility fallback
            name: profile.name,
            email: profile.email,
            phone: profile.phone,
            role: profile.role
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const profile = await fetchProfile(data.user.id);
      if (!profile) {
        throw new Error('Profile not found for authenticated user');
      }

      const userData = {
        id: profile.id,
        _id: profile.id,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        role: profile.role
      };

      setUser(userData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Login failed'
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, phone, role) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone,
            role
          }
        }
      });

      if (error) throw error;

      // Supabase triggers profile creation on signUp. We fetch it here.
      // Wait a moment for trigger completion if necessary
      let profile = null;
      let retries = 5;
      while (!profile && retries > 0) {
        profile = await fetchProfile(data.user.id);
        if (!profile) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          retries--;
        }
      }

      if (!profile) {
        throw new Error('User profile creation trigger delayed. Please try logging in.');
      }

      const userData = {
        id: profile.id,
        _id: profile.id,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        role: profile.role
      };

      setUser(userData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Registration failed'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
