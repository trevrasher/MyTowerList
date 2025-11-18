"use client"
import { useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function SyncButton() {
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState('');

  const handleSync = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setMessage('Please login first');
      return;
    }

    setSyncing(true);
    setMessage('Syncing...');

    try {
      const response = await fetch(`${API_BASE_URL}/api/sync-completions/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage(`Synced ${data.newly_completed_count} new towers!`);
        window.location.reload();
      } else {
        setMessage(`Error: ${data.error || 'Failed to sync'}`);
      }
    } catch (error) {
      setMessage('Network error occurred');
      console.error('Sync error:', error);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div>
      <button 
        onClick={handleSync}
        disabled={syncing}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
      >
        {syncing ? 'Syncing...' : 'Sync Tower Completions'}
      </button>
      {message && <p className="mt-2 text-sm">{message}</p>}
    </div>
  );
}