"use client"
import { useState, useEffect } from 'react';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const access = params.get('access');
    const refresh = params.get('refresh');

    if (access && refresh) {
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      setIsAuthenticated(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      const token = localStorage.getItem('access_token');
      setIsAuthenticated(!!token);
    }
  }, []);

  return isAuthenticated;
}