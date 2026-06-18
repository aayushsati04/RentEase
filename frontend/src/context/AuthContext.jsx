import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../services/supabase';
import API from '../services/api';

const AuthContext = createContext(null);

const DEMO_MODE = true;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync Supabase user details with MongoDB backend
  const syncProfile = async (supabaseUser, customMeta = {}) => {
    try {
      const payload = {
        email: supabaseUser.email,
        name: customMeta.name || supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name || supabaseUser.email.split('@')[0],
        phone: customMeta.phone || supabaseUser.phone || supabaseUser.user_metadata?.phone || '0000000000',
        role: customMeta.role || supabaseUser.user_metadata?.role || 'tenant'
      };

      const { data } = await API.post('/api/auth/supabase-sync', payload);
      if (data && data.token) {
        localStorage.setItem('token', data.token);
        const userData = {
          id: data._id || data.data?._id,
          _id: data._id || data.data?._id,
          name: data.name || data.data?.name,
          email: data.email || data.data?.email,
          phone: data.phone || data.data?.phone,
          role: data.role || data.data?.role
        };
        setUser(userData);
        return userData;
      }
      return null;
    } catch (err) {
      console.error('Error syncing user with backend:', err);
      return null;
    }
  };

  // Fetch profile details from backend API using local JWT
  const fetchBackendProfile = async () => {
    try {
      const { data } = await API.get('/api/auth/profile');
      if (data && data.success) {
        const profile = data.data || data;
        const userData = {
          id: profile._id,
          _id: profile._id,
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          role: profile.role
        };
        setUser(userData);
        return userData;
      }
      return null;
    } catch (err) {
      console.error('Error fetching backend user profile:', err);
      return null;
    }
  };

  useEffect(() => {
    // Check active session on mount
    const checkSession = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token === 'demo-token') {
          const demoUser = JSON.parse(localStorage.getItem('demo_user'));
          if (demoUser) {
            setUser(demoUser);
            setLoading(false);
            return;
          }
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          let profile = null;
          if (token) {
            profile = await fetchBackendProfile();
          }
          if (!profile) {
            await syncProfile(session.user);
          }
        } else {
          setUser(null);
          localStorage.removeItem('token');
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
      const token = localStorage.getItem('token');
      if (token === 'demo-token') {
        const demoUser = JSON.parse(localStorage.getItem('demo_user'));
        if (demoUser) {
          setUser(demoUser);
          setLoading(false);
          return;
        }
      }

      setLoading(true);
      if (session?.user) {
        let profile = null;
        if (token) {
          profile = await fetchBackendProfile();
        }
        if (!profile) {
          await syncProfile(session.user);
        }
      } else {
        setUser(null);
        localStorage.removeItem('token');
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
      if (DEMO_MODE && (email === 'brahmanaayush@gmail.com' || email === 'rajesh.sharma@property.com') && password === 'demo123') {
        const isTenant = email === 'brahmanaayush@gmail.com';
        const mockUser = {
          id: isTenant ? 'demo-tenant-id' : 'demo-landlord-id',
          _id: isTenant ? 'demo-tenant-id' : 'demo-landlord-id',
          name: isTenant ? 'Aayush Sati' : 'Rajesh Sharma',
          email: email,
          phone: '9876543210',
          role: isTenant ? 'tenant' : 'landlord',
          isDemo: true
        };
        localStorage.setItem('token', 'demo-token');
        localStorage.setItem('demo_user', JSON.stringify(mockUser));
        setUser(mockUser);
        return { success: true };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const userData = await syncProfile(data.user);
      if (!userData) {
        throw new Error('Failed to synchronize user profile with MongoDB');
      }

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

      const userData = await syncProfile(data.user, { name, phone, role });
      if (!userData) {
        throw new Error('Failed to synchronize user profile with MongoDB');
      }

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

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Google login failed'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (token === 'demo-token') {
        localStorage.removeItem('token');
        localStorage.removeItem('demo_user');
        setUser(null);
        return;
      }
      await supabase.auth.signOut();
      localStorage.removeItem('token');
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

