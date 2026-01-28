"use client"
import { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/app/utils/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const COOLDOWN_MS = 60 * 1000;
const LAST_SYNC_KEY = "last_sync_time";

export default function SyncButton() {
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState('');
  const [lastSync, setLastSync] = useState<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(LAST_SYNC_KEY);
    if (stored) setLastSync(Number(stored));
  }, []);

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
      const data = await fetchWithAuth(`${API_BASE_URL}/api/sync-completions/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      setMessage(`Synced ${data.newly_completed_count} new towers!`);
      setLastSync(now);
      localStorage.setItem(LAST_SYNC_KEY, String(now));
      window.location.reload();
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
        className="bg-zinc-700 text-white px-4 py-2 rounded hover:bg-zinc-500 mx-1 md:mx-5"
      >
        <span className="sm:hidden">{message ? message : 'Sync'}</span>
        <span className="hidden sm:inline">{message ? message : 'Sync Tower Completions'}</span>
      </button>
    </div>
  );
}