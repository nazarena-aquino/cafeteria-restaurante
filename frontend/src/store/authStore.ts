import { create } from 'zustand';
import { AdminUser } from '../types';
import { authApi } from '../api';

interface AuthStore {
  admin: AdminUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  admin: null,
  token: localStorage.getItem('admin_token'),
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await authApi.login(email, password);
      const { token, admin } = res.data.data;
      localStorage.setItem('admin_token', token);
      set({ admin, token, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('admin_token');
    set({ admin: null, token: null });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      set({ admin: null, token: null });
      return;
    }
    try {
      const res = await authApi.verify();
      set({ admin: res.data.data.admin, token });
    } catch {
      localStorage.removeItem('admin_token');
      set({ admin: null, token: null });
    }
  },
}));
