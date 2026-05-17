import { cookies } from 'next/headers';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

export interface ApiOptions extends RequestInit {
  auth?: boolean;
}

function getCookieName(): string {
  return process.env.NODE_ENV === 'production'
    ? '__Secure-authjs.session-token'
    : 'authjs.session-token';
}

async function getAuthToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(getCookieName())?.value;
}

export async function apiFetch(path: string, options: ApiOptions = {}): Promise<Response> {
  const { auth = true, ...fetchOptions } = options;
  const headers = new Headers(fetchOptions.headers);

  if (!headers.has('Content-Type') && fetchOptions.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (auth) {
    const token = await getAuthToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  return fetch(`${BACKEND_URL}${path}`, { ...fetchOptions, headers });
}
