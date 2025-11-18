"use client"
import { useState, useEffect } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function LoginButton() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  

   useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem('access_token');
      setIsLoggedIn(!!token);
    };

    checkToken(); 

    window.addEventListener('storage', checkToken);
    return () => window.removeEventListener('storage', checkToken);
  }, []);

  const handleLogin = () => {
    window.location.href = `${API_BASE_URL}/api/auth/roblox/`;
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsLoggedIn(false);
    window.location.reload();
  };

  if (isLoggedIn) {
    return (
      <button 
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 transition"
      >
        Logout
      </button>
    );
  }

  return (
    <button 
      onClick={handleLogin}
      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
    >
      Login with Roblox
    </button>
  );
}