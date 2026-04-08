// Authentication utilities for Strapi JWT tokens

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

/**
 * User login credentials
 */
export interface LoginCredentials {
  identifier: string; // email or username
  password: string;
}

/**
 * Login response from Strapi
 */
export interface LoginResponse {
  jwt: string;
  user: {
    id: number;
    username: string;
    email: string;
    role?: { id: number; name: string; type: string };
    [key: string]: any;
  };
}

/**
 * Register user data
 */
export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

/**
 * Login user and get JWT token
 */
export async function loginUser(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await fetch(`${STRAPI_URL}/api/auth/local?populate=role`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
    throw new Error(error.error?.message || 'Login failed');
  }

  const data: LoginResponse = await response.json();
  
  // Store JWT in localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('jwt', data.jwt);
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  
  return data;
}

/**
 * Register a new user
 */
export async function registerUser(userData: RegisterData): Promise<LoginResponse> {
  const response = await fetch(`${STRAPI_URL}/api/auth/local/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
    throw new Error(error.error?.message || 'Registration failed');
  }

  const data: LoginResponse = await response.json();
  
  // Store JWT in localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('jwt', data.jwt);
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  
  return data;
}

/**
 * Logout user (remove JWT from localStorage)
 */
export function logoutUser(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
  }
}

/**
 * Get current JWT token
 */
export function getJWT(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('jwt');
  } catch {
    return null;
  }
}

/**
 * Get current user data
 */
export function getCurrentUser(): LoginResponse['user'] | null {
  if (typeof window === 'undefined') return null;
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getJWT() !== null;
}

/**
 * Check if current user has admin role
 */
export function isAdmin(): boolean {
  const user = getCurrentUser();
  return user?.role?.type === 'admin';
}

/**
 * Verify JWT token is still valid
 */
export async function verifyToken(): Promise<boolean> {
  const jwt = getJWT();
  if (!jwt) return false;

  try {
    const response = await fetch(`${STRAPI_URL}/api/users/me`, {
      headers: {
        'Authorization': `Bearer ${jwt}`,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}
