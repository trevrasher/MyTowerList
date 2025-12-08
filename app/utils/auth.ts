import { API_BASE_URL } from "@/next.config";

export async function refreshAccessToken() {
  const refresh = localStorage.getItem('refresh_token');
  const res = await fetch(`${API_BASE_URL}/api/auth/refresh/`, {
    method: 'POST',
    body: JSON.stringify({ refresh }),
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await res.json();
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
    const newToken = await refreshAccessToken();
    if (!newToken) throw new Error('Unable to refresh token');
    localStorage.setItem('access_token', newToken);

    options.headers['Authorization'] = `Bearer ${newToken}`;
    res = await fetch(url, options);
    if (!res.ok) throw new Error('Failed to fetch after refresh');
  }

  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}