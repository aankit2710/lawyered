import { create } from 'zustand';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  register: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  clearError: () => void;
  hydrateSession: () => Promise<User | null>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  isLoading: false,
  error: null,

  register: async (email, password, firstName, lastName) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        email,
        password,
        firstName,
        lastName,
      });

      const { access_token, user } = response.data;
      localStorage.setItem('token', access_token);
      
      set({
        token: access_token,
        user,
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      const { access_token, user } = response.data;
      localStorage.setItem('token', access_token);
      
      set({
        token: access_token,
        user,
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({
      user: null,
      token: null,
      error: null,
    });
  },

  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  clearError: () => set({ error: null }),
  hydrateSession: async () => {
    const storedToken =
      get().token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

    if (!storedToken) {
      return null;
    }

    try {
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      });

      const user = response.data;
      set({
        token: storedToken,
        user,
        error: null,
      });

      return user;
    } catch {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }

      set({
        token: null,
        user: null,
        error: null,
      });

      return null;
    }
  },
}));
