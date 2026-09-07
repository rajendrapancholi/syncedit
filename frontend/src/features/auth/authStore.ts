import { create } from "zustand";
import { User, AuthState } from "./authType";

interface AuthStoreActions extends AuthState {
  setCredentials: (user: User | null) => void;
  clearCredentials: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthStoreActions>()((set) => ({
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  
  setCredentials: (user: User | null) => 
    set({ user, isAuthenticated: !!user, loading: false, error: null }),
    
  clearCredentials: () => 
    set({ user: null, isAuthenticated: false, loading: false, error: null }),

  setLoading: (loading: boolean) => 
    set({ loading }),

  setError: (error: string | null) => 
    set({ error, loading: false }),
}));
