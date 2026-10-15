// Autenticación de huéspedes contra Payload (colección `guests`).
// El token vive en una cookie HTTP-only que setea Payload; en localStorage solo se guarda
// el nombre y email para mostrarlos en la UI.

export interface LoginCredentials {
  identifier: string; // email
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface GuestUser {
  id: number;
  username: string;
  email: string;
}

async function request(path: string, body?: unknown) {
  const response = await fetch(`/api/guests${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.errors?.[0]?.message || response.statusText);
  }
  return data;
}

function storeUser(user: { id: number; email: string; name?: string | null }): GuestUser {
  const guest = { id: user.id, email: user.email, username: user.name || user.email };
  localStorage.setItem('user', JSON.stringify(guest));
  return guest;
}

export async function loginUser({ identifier, password }: LoginCredentials): Promise<GuestUser> {
  try {
    const data = await request('/login', { email: identifier.trim().toLowerCase(), password });
    return storeUser(data.user);
  } catch {
    throw new Error('Email o contraseña incorrectos');
  }
}

export async function registerUser({ username, email, password }: RegisterData): Promise<GuestUser> {
  try {
    await request('', { name: username.trim(), email: email.trim().toLowerCase(), password });
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    throw new Error(/email/i.test(message) ? 'Ya existe una cuenta con ese email' : 'No se pudo crear la cuenta');
  }
  return loginUser({ identifier: email, password });
}

export function logoutUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('user');
  request('/logout').catch(() => {});
}

export function getCurrentUser(): GuestUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
}

/** Indicador para la UI; la sesión real la valida el servidor con la cookie */
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}
