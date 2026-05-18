/**
 * User model interface
 */
export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role?: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * User role enum
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  VIEWER = 'VIEWER'
}

/**
 * Login request interface
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Login response interface
 */
export interface LoginResponse {
  token: string;
  refreshToken?: string;
  user: User;
  expiresIn?: number;
}

/**
 * Register request interface
 */
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Register response interface
 */
export interface RegisterResponse {
  message: string;
  user?: User;
}

/**
 * Auth state interface
 */
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}
