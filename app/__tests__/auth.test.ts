import 'vitest-localstorage-mock';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { refreshAccessToken, fetchWithAuth } from '../utils/auth';

vi.mock("@/next.config", () => ({
  API_BASE_URL: "http://localhost:8000"
}));


describe('refreshAccessToken', () => {
  beforeEach(() => {
    vi.resetModules(); 
    vi.clearAllMocks();
    localStorage.clear();
    global.fetch = vi.fn();
  });

  it('should refresh access token successfully', async () => {
    const { refreshAccessToken } = await import('../utils/auth');
    localStorage.setItem('refresh_token', 'old_refresh_token');

    const mockResponse = {
      ok: true,
      json: async () => ({ access: 'new_access_token' })
    };
    global.fetch = vi.fn().mockResolvedValueOnce(mockResponse as Response);

    const result = await refreshAccessToken();

    expect(result).toBe('new_access_token');
    expect(localStorage.getItem('access_token')).toBe('new_access_token');
  });

  it('should throw error if no refresh token found', async () => {
    const { refreshAccessToken } = await import('../utils/auth');
    global.fetch = vi.fn();

    await expect(refreshAccessToken()).rejects.toThrow('No refresh token found');
  });

  it('should clear tokens on failed refresh response', async () => {
    const { refreshAccessToken } = await import('../utils/auth');
    global.fetch = vi.fn();

    await expect(refreshAccessToken()).rejects.toThrow('No refresh token found');
  });

  it('should clear tokens on failed refresh response', async () => {
    localStorage.setItem('refresh_token', 'old_refresh_token');
    localStorage.setItem('access_token', 'old_access_token');
    localStorage.setItem('avatar_url', 'http://example.com/avatar.jpg');
    localStorage.setItem('username', 'testuser');

    const mockResponse = {
      ok: false,
      json: async () => ({})
    };
    global.fetch = vi.fn().mockResolvedValueOnce(mockResponse as Response);

    await expect(refreshAccessToken()).rejects.toThrow('Token refresh failed');
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
    expect(localStorage.getItem('avatar_url')).toBeNull();
    expect(localStorage.getItem('username')).toBeNull();
  });

  it('should throw error if no access token in refresh response', async () => {
    const { refreshAccessToken } = await import('../utils/auth');
    localStorage.setItem('refresh_token', 'old_refresh_token');

    const mockResponse = {
      ok: true,
      json: async () => ({ access: null })
    };
    global.fetch = vi.fn().mockResolvedValueOnce(mockResponse as Response);

    await expect(refreshAccessToken()).rejects.toThrow('No access token in refresh response');
  });

  it('should queue multiple refresh requests', async () => {
    localStorage.setItem('refresh_token', 'old_refresh_token');

    const mockResponse = {
      ok: true,
      json: async () => ({ access: 'new_access_token' })
    };
    global.fetch = vi.fn().mockResolvedValue(mockResponse as Response);

    const promise1 = refreshAccessToken();
    const promise2 = refreshAccessToken();

    const result1 = await promise1;
    const result2 = await promise2;

    expect(result1).toBe('new_access_token');
    expect(result2).toBe('new_access_token');
    expect(global.fetch).toHaveBeenCalledTimes(1); // Only called once due to queueing
  });

  it('should reset refreshPromise after completion', async () => {
    localStorage.setItem('refresh_token', 'old_refresh_token');

    const mockResponse = {
      ok: true,
      json: async () => ({ access: 'new_access_token' })
    };
    global.fetch = vi.fn().mockResolvedValue(mockResponse as Response);

    await refreshAccessToken();
    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Call again - should make a new request
    global.fetch = vi.fn().mockResolvedValue(mockResponse as Response);
    await refreshAccessToken();
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});

describe('fetchWithAuth', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
    localStorage.setItem('access_token', 'test_access_token');
    vi.clearAllMocks();
  });

  it('should throw error if no access token found', async () => {
    const { fetchWithAuth } = await import('../utils/auth');
    localStorage.removeItem('access_token');

    await expect(fetchWithAuth('http://localhost:8000/api/test/')).rejects.toThrow(
      'No access token found'
    );
  });

  it('should add Authorization header with access token', async () => {
    const { fetchWithAuth } = await import('../utils/auth');
    const mockResponse = {
      ok: true,
      json: async () => ({ data: 'test' })
    };
    global.fetch = vi.fn().mockResolvedValueOnce(mockResponse as Response);

    await fetchWithAuth('http://localhost:8000/api/test/');

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/test/',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer test_access_token'
        })
      })
    );
  });

  it('should merge existing headers with Authorization header', async () => {
    const { fetchWithAuth } = await import('../utils/auth');
    const mockResponse = {
      ok: true,
      json: async () => ({ data: 'test' })
    };
    global.fetch = vi.fn().mockResolvedValueOnce(mockResponse as Response);

    const customHeaders = { 'Custom-Header': 'custom-value' };
    await fetchWithAuth('http://localhost:8000/api/test/', {
      headers: customHeaders
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/test/',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer test_access_token',
          'Custom-Header': 'custom-value'
        })
      })
    );
  });

    it('should handle Headers object in options', async () => {
    const { fetchWithAuth } = await import('../utils/auth');
    const mockResponse = {
        ok: true,
        json: async () => ({ data: 'test' })
    };
    global.fetch = vi.fn().mockResolvedValueOnce(mockResponse as Response);

    const headers = new Headers({ 'Custom-Header': 'custom-value' });
    await fetchWithAuth('http://localhost:8000/api/test/', {
        headers
    });

    expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/test/',
        expect.objectContaining({
        headers: expect.objectContaining({
            'Authorization': 'Bearer test_access_token',
            'custom-header': 'custom-value'  // Changed from 'Custom-Header'
        })
        })
    );
    });

  it('should retry on 401 with refreshed token', async () => {
    const { fetchWithAuth } = await import('../utils/auth');
    localStorage.setItem('refresh_token', 'old_refresh_token');

    const firstResponse = {
      status: 401,
      ok: false,
      json: async () => ({})
    };

    const refreshResponse = {
      ok: true,
      json: async () => ({ access: 'new_access_token' })
    };

    const secondResponse = {
      ok: true,
      json: async () => ({ data: 'success' })
    };

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(firstResponse as Response)
      .mockResolvedValueOnce(refreshResponse as Response)
      .mockResolvedValueOnce(secondResponse as Response);

    const result = await fetchWithAuth('http://localhost:8000/api/test/');

    expect(result).toEqual({ data: 'success' });
    expect(global.fetch).toHaveBeenCalledTimes(3);
    expect(localStorage.getItem('access_token')).toBe('new_access_token');
  });

  it('should throw "Session expired" error on 401 if refresh fails', async () => {
    const firstResponse = {
      status: 401,
      ok: false
    };

    global.fetch = vi.fn().mockResolvedValueOnce(firstResponse as Response);

    await expect(fetchWithAuth('http://localhost:8000/api/test/')).rejects.toThrow(
      'Session expired. Please log in again.'
    );
  });

  it('should throw error on failed response after refresh', async () => {
    localStorage.setItem('refresh_token', 'old_refresh_token');

    const firstResponse = {
      status: 401,
      ok: false
    };

    const refreshResponse = {
      ok: true,
      json: async () => ({ access: 'new_access_token' })
    };

    const secondResponse = {
      ok: false,
      status: 500
    };

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(firstResponse as Response)
      .mockResolvedValueOnce(refreshResponse as Response)
      .mockResolvedValueOnce(secondResponse as Response);

    await expect(fetchWithAuth('http://localhost:8000/api/test/')).rejects.toThrow(
      'Session expired. Please log in again.'
    );
  });

  it('should throw error on non-ok response', async () => {
    const mockResponse = {
      ok: false,
      status: 500
    };
    global.fetch = vi.fn().mockResolvedValueOnce(mockResponse as Response);

    await expect(fetchWithAuth('http://localhost:8000/api/test/')).rejects.toThrow(
      'Failed to fetch'
    );
  });

  it('should return parsed JSON on success', async () => {
    const mockData = { id: 1, name: 'Test' };
    const mockResponse = {
      ok: true,
      json: async () => mockData
    };
    global.fetch = vi.fn().mockResolvedValueOnce(mockResponse as Response);

    const result = await fetchWithAuth('http://localhost:8000/api/test/');

    expect(result).toEqual(mockData);
  });

  it('should pass through other request options', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({})
    };
    global.fetch = vi.fn().mockResolvedValueOnce(mockResponse as Response);

    await fetchWithAuth('http://localhost:8000/api/test/', {
      method: 'POST',
      body: JSON.stringify({ key: 'value' })
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/test/',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ key: 'value' })
      })
    );
  });
})