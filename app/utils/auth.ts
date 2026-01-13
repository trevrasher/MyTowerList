import { API_BASE_URL } from "@/next.config";

export async function refreshAccessToken() {
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
    throw new Error('Token refresh failed');
  }
  
  const data = await res.json();
  
  if (!data.access) {
    throw new Error('No access token in refresh response');
  }
  
  localStorage.setItem('access_token', data.access);
  return data.access;
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
      
      // Update the authorization header with the new token
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${newToken}`,
      };
      
      // Retry the original request
      res = await fetch(url, options);
      if (!res.ok) throw new Error('Failed to fetch after token refresh');
    } catch (error) {
      // Refresh failed - user needs to log in again
      throw new Error('Session expired. Please log in again.');
    }
  }

  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}