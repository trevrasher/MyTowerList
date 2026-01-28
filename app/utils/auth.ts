import { API_BASE_URL } from "@/next.config";

let refreshPromise: Promise<string> | null = null;

export async function refreshAccessToken() {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      
      if (!refresh) {
        throw new Error('No refresh token found');
      }
      
      const res = await fetch(`${API_BASE_URL}/api/auth/refresh/`, {
        method: 'POST',
        body: JSON.stringify({ refresh }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!res.ok) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('avatar_url');
        localStorage.removeItem('username');
        throw new Error('Token refresh failed');
      }
      
      const data = await res.json();
      
      if (!data.access) {
        throw new Error('No access token in refresh response');
      }
      
      localStorage.setItem('access_token', data.access);
      return data.access;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  let token = localStorage.getItem('access_token');
  if (!token) throw new Error('No access token found');

  const headers: Record<string, string> = {
    ...(options.headers instanceof Headers
      ? Object.fromEntries(options.headers.entries())
      : (options.headers as Record<string, string> || {})
    ),
    'Authorization': `Bearer ${token}`,
  };

  options.headers = headers;

  let res = await fetch(url, options);

  if (res.status === 401) {
    try {
      const newToken = await refreshAccessToken();
      
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${newToken}`,
      };
      
      res = await fetch(url, options);
      if (!res.ok) throw new Error('Failed to fetch after token refresh');
    } catch (error) {
      throw new Error('Session expired. Please log in again.');
    }
  }

  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}