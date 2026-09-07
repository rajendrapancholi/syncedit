export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export interface LoginPayload {
  email: string;
  pass: string;
}

export interface LoginResponse {
  user: User;
}

export interface GetUserResponse {
  user: User;
}
