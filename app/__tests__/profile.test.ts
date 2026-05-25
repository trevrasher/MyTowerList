import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Tower } from '../utils/towers';
import { fetchCurrentUser, fetchProfileDataForUser, isOwnProfile, getDiffCategoryCounts, getTowerAcronym, convertTimestamp, sortCompletedTowers } from '../utils/profile';
import * as authUtils from '../utils/auth';

vi.mock("@/next.config", () => ({
  API_BASE_URL: "http://localhost:8000"
}));

vi.mock("../utils/auth");

describe('fetchCurrentUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch and return current user data', async () => {
    const mockUser = { username: 'testuser' };
    vi.mocked(authUtils.fetchWithAuth).mockResolvedValueOnce(mockUser);

    const result = await fetchCurrentUser();

    expect(result).toEqual(mockUser);
    expect(authUtils.fetchWithAuth).toHaveBeenCalledWith('http://localhost:8000/api/profile/');
  });

  it('should throw error when fetch fails', async () => {
    const error = new Error('Network error');
    vi.mocked(authUtils.fetchWithAuth).mockRejectedValueOnce(error);

    await expect(fetchCurrentUser()).rejects.toThrow('Network error');
  });
});

describe('fetchProfileDataForUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch profile data for a user', async () => {
    const mockProfileData = {
      username: 'testuser',
      avatar_url: 'https://example.com/avatar.jpg',
      roblox_user_id: 123,
      completed: { count: 5, towers: [] },
      bookmarked: { count: 2, towers: [] },
      ignored: { count: 1, towers: [] },
      review_scores: {},
      tower_reviews: {},
      completed_dates: {}
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockProfileData
    } as Response);

    const result = await fetchProfileDataForUser('testuser');

    expect(result).toEqual(mockProfileData);
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:8000/api/profile/user/testuser/');
  });

  it('should throw error if response is not ok', async () => {
    const errorData = { error: 'User not found' };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => errorData
    } as Response);

    await expect(fetchProfileDataForUser('nonexistent')).rejects.toThrow('User not found');
  });

  it('should throw default error message if no error provided', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({})
    } as Response);

    await expect(fetchProfileDataForUser('nonexistent')).rejects.toThrow('Failed to load profile');
  });
});

describe('isOwnProfile', () => {
  it('should return true when usernames match (case-insensitive)', () => {
    expect(isOwnProfile('TestUser', 'testuser')).toBe(true);
    expect(isOwnProfile('john', 'JOHN')).toBe(true);
    expect(isOwnProfile('Alice123', 'alice123')).toBe(true);
  });

  it('should return false when usernames do not match', () => {
    expect(isOwnProfile('testuser', 'otheruser')).toBe(false);
    expect(isOwnProfile('alice', 'bob')).toBe(false);
  });

  it('should return false when currentUsername is undefined', () => {
    expect(isOwnProfile(undefined, 'testuser')).toBe(false);
  });
});

describe('getDiffCategoryCounts', () => {
  it('should calculate percentages for single difficulty category', () => {
    const towers: Tower[] = [
      { id: 1, diff_category: 'easy', difficulty: 1, name: 'Tower 1', area: 'Area', type: 'tower', score: 0, creators: [], floors: 5 },
      { id: 2, diff_category: 'easy', difficulty: 1, name: 'Tower 2', area: 'Area', type: 'tower', score: 0, creators: [], floors: 5 },
    ];

    const result = getDiffCategoryCounts(towers);

    expect(result).toEqual({ easy: 100 });
  });

  it('should calculate percentages for multiple difficulty categories', () => {
    const towers: Tower[] = [
      { id: 1, diff_category: 'easy', difficulty: 1, name: 'Tower 1', area: 'Area', type: 'tower', score: 0, creators: [], floors: 5 },
      { id: 2, diff_category: 'medium', difficulty: 2, name: 'Tower 2', area: 'Area', type: 'tower', score: 0, creators: [], floors: 5 },
      { id: 3, diff_category: 'hard', difficulty: 3, name: 'Tower 3', area: 'Area', type: 'tower', score: 0, creators: [], floors: 5 },
      { id: 4, diff_category: 'hard', difficulty: 4, name: 'Tower 4', area: 'Area', type: 'tower', score: 0, creators: [], floors: 5 },
    ];

    const result = getDiffCategoryCounts(towers);

    expect(result.easy).toBeCloseTo(25, 1);
    expect(result.medium).toBeCloseTo(25, 1);
    expect(result.hard).toBeCloseTo(50, 1);
  });

  it('should return empty object for empty tower array', () => {
    const result = getDiffCategoryCounts([]);

    expect(result).toEqual({});
  });
});

describe('getTowerAcronym', () => {
  it('should extract first letter of each word', () => {
    expect(getTowerAcronym('Tower of Scary Places')).toBe('ToSP');
  });

  it('should handle extra spaces', () => {
    expect(getTowerAcronym('Tower  Of  Power')).toBe('TOP');
  });
});

describe('convertTimestamp', () => {
  it('should convert ISO timestamp to readable date', () => {
    const result = convertTimestamp('2024-01-15T00:00:00Z');

    expect(result).toBe('Jan 15 2024');
  });

  it('should handle different months', () => {
    expect(convertTimestamp('2024-12-25T00:00:00Z')).toBe('Dec 25 2024');
    expect(convertTimestamp('2024-06-01T00:00:00Z')).toBe('Jun 1 2024');
  });

  it('should return empty string for null', () => {
    expect(convertTimestamp(null)).toBe('');
  });

  it('should return empty string for undefined', () => {
    expect(convertTimestamp(undefined)).toBe('');
  });

  it('should return empty string for invalid date', () => {
    expect(convertTimestamp('invalid-date')).toBe('');
  });

  it('should handle edge dates', () => {
    expect(convertTimestamp('2024-01-01T00:00:00Z')).toBe('Jan 1 2024');
    expect(convertTimestamp('2024-12-31T00:00:00Z')).toBe('Dec 31 2024');
  });
});

describe('sortCompletedTowers', () => {
    const mockTowers: Tower[] = [
        { id: 1, name: 'Tower A', difficulty: 5, diff_category: 'hard', area: 'Area', type: 'tower', score: 0, creators: [], floors: 10 },
        { id: 2, name: 'Tower B', difficulty: 2, diff_category: 'easy', area: 'Area', type: 'tower', score: 0, creators: [], floors: 5 },
        { id: 3, name: 'Tower C', difficulty: 3, diff_category: 'medium', area: 'Area', type: 'tower', score: 0, creators: [], floors: 8 },
    ];

  const reviewScores = { 1: 8, 2: 5, 3: 7 };
  const completedDates = { 1: '2024-01-15T00:00:00Z', 2: '2024-01-10T00:00:00Z', 3: '2024-01-20T00:00:00Z' };

  it('should sort by score descending', () => {
    const result = sortCompletedTowers(mockTowers, 'scoreDown', reviewScores, completedDates);

    expect(result[0].id).toBe(1); // score 8
    expect(result[1].id).toBe(3); // score 7
    expect(result[2].id).toBe(2); // score 5
  });

  it('should sort by score ascending', () => {
    const result = sortCompletedTowers(mockTowers, 'scoreUp', reviewScores, completedDates);

    expect(result[0].id).toBe(2); // score 5
    expect(result[1].id).toBe(3); // score 7
    expect(result[2].id).toBe(1); // score 8
  });

  it('should sort by difficulty descending', () => {
    const result = sortCompletedTowers(mockTowers, 'difficultyDown', reviewScores, completedDates);

    expect(result[0].id).toBe(1); // difficulty 5
    expect(result[1].id).toBe(3); // difficulty 3
    expect(result[2].id).toBe(2); // difficulty 2
  });

  it('should sort by difficulty ascending', () => {
    const result = sortCompletedTowers(mockTowers, 'difficultyUp', reviewScores, completedDates);

    expect(result[0].id).toBe(2); // difficulty 2
    expect(result[1].id).toBe(3); // difficulty 3
    expect(result[2].id).toBe(1); // difficulty 5
  });

  it('should sort by date descending (most recent first)', () => {
    const result = sortCompletedTowers(mockTowers, 'dateDown', reviewScores, completedDates);

    expect(result[0].id).toBe(3); // 2024-01-20
    expect(result[1].id).toBe(1); // 2024-01-15
    expect(result[2].id).toBe(2); // 2024-01-10
  });

  it('should sort by date ascending (oldest first)', () => {
    const result = sortCompletedTowers(mockTowers, 'dateUp', reviewScores, completedDates);

    expect(result[0].id).toBe(2); // 2024-01-10
    expect(result[1].id).toBe(1); // 2024-01-15
    expect(result[2].id).toBe(3); // 2024-01-20
  });

  it('should prioritize towers with scores when sorting by score', () => {
    const scoresWithMissing = { 1: 8, 3: 7 };
    const result = sortCompletedTowers(mockTowers, 'scoreDown', scoresWithMissing, completedDates);

    expect(result[0].id).toBe(1); // has score 8
    expect(result[1].id).toBe(3); // has score 7
    expect(result[2].id).toBe(2); // no score
  });

  it('should prioritize towers with dates when sorting by date', () => {
    const datesWithMissing = { 1: '2024-01-15T00:00:00Z', 3: '2024-01-20T00:00:00Z' };
    const result = sortCompletedTowers(mockTowers, 'dateDown', reviewScores, datesWithMissing);

    expect(result[0].id).toBe(3); // has date 2024-01-20
    expect(result[1].id).toBe(1); // has date 2024-01-15
    expect(result[2].id).toBe(2); // no date
  });

  it('should not mutate original towers array', () => {
    const originalTowers = [...mockTowers];
    sortCompletedTowers(mockTowers, 'scoreDown', reviewScores, completedDates);

    expect(mockTowers).toEqual(originalTowers);
  });
});