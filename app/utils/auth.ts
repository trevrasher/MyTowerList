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
}