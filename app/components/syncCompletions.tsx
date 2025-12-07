"use client"
import { useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const COOLDOWN_MS = 60 * 1000;

export default function SyncButton() {
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState('');
  const [lastSync, setLastSync] = useState<number | null>(null);

  const handleSync = async () => {
    const now = Date.now();
    if (lastSync && now - lastSync < COOLDOWN_MS) {
      setMessage('Please wait before syncing again.');
      return;
    }

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
        setLastSync(now);
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
        className="bg-zinc-600 text-white px-4 py-2 rounded hover:bg-zinc-400 ml-5 mr-5"
      >
        {message ? message : 'Sync Tower Completions'}
      </button>
    </div>
  );
}