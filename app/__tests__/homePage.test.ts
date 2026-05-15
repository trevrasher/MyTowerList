import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildQueryParams, sortToOrdering } from "../utils/queryBuilder";

vi.mock("@/next.config", () => ({
  API_BASE_URL: "http://localhost:8000"
}));

describe('sortToOrdering()', () => {
  it('maps scoreUp to "score"', () => {
    expect(sortToOrdering('scoreUp')).toBe('score');
  });

  it('maps scoreDown to "-score"', () => {
    expect(sortToOrdering('scoreDown')).toBe('-score');
  });

  it('maps difficultyUp to "difficulty"', () => {
    expect(sortToOrdering('difficultyUp')).toBe('difficulty');
  });

  it('maps difficultyDown to "-difficulty"', () => {
    expect(sortToOrdering('difficultyDown')).toBe('-difficulty');
  });

  it('maps dateUp to "date"', () => {
    expect(sortToOrdering('dateUp')).toBe('date');
  });

  it('maps dateDown to "-date"', () => {
    expect(sortToOrdering('dateDown')).toBe('-date');
  });
});

describe('buildQueryParams()', () => {
  const mockAreas = ['Forest', 'Castle', 'Sky', 'Mountain', 'Ocean'];

  it('always includes difficulty_min and difficulty_max', () => {
    const url = buildQueryParams([], mockAreas, [1, 5], false, new Map(), 'scoreDown');
    expect(url).toContain('difficulty_min=1');
    expect(url).toContain('difficulty_max=5');
  });

  it('includes area params when selectedAreas is a subset', () => {
    const url = buildQueryParams(['Forest', 'Castle'], mockAreas, [1, 5], false, new Map(), 'scoreDown');
    expect(url).toContain('area=Forest');
    expect(url).toContain('area=Castle');
    expect(url).not.toContain('area=Sky');
  });

  it('does not include area params when selectedAreas equals all areas', () => {
    const url = buildQueryParams(mockAreas, mockAreas, [1, 5], false, new Map(), 'scoreDown');
    expect(url).not.toContain('area=');
  });

  it('does not include area params when selectedAreas is empty', () => {
    const url = buildQueryParams([], mockAreas, [1, 5], false, new Map(), 'scoreDown');
    expect(url).not.toContain('area=');
  });

  it('includes completed_ids when completedToggle is true and towerStatuses exist', () => {
    const statuses = new Map([
      [1, 'completed'],
      [2, 'completed'],
      [3, 'bookmarked']
    ]);
    const url = buildQueryParams([], mockAreas, [1, 5], true, statuses, 'scoreDown');
    expect(url).toContain('exclude_completed=true');
    expect(url).toContain('completed_ids=1');
    expect(url).toContain('completed_ids=2');
    expect(url).not.toContain('completed_ids=3');
  });

  it('includes ignored_ids for all ignored statuses', () => {
    const statuses = new Map([
      [1, 'completed'],
      [2, 'ignored'],
      [3, 'ignored']
    ]);
    const url = buildQueryParams([], mockAreas, [1, 5], false, statuses, 'scoreDown');
    expect(url).toContain('ignored_ids=2');
    expect(url).toContain('ignored_ids=3');
  });

  it('includes ordering param based on sortMode', () => {
    const url = buildQueryParams([], mockAreas, [1, 5], false, new Map(), 'difficultyDown');
    expect(url).toContain('ordering=-difficulty');
  });

  it('includes all params together', () => {
    const statuses = new Map([
      [1, 'completed'],
      [2, 'ignored']
    ]);
    const url = buildQueryParams(['Forest'], mockAreas, [3, 8], true, statuses, 'scoreUp');
    
    expect(url).toContain('area=Forest');
    expect(url).toContain('difficulty_min=3');
    expect(url).toContain('difficulty_max=8');
    expect(url).toContain('exclude_completed=true');
    expect(url).toContain('completed_ids=1');
    expect(url).toContain('ignored_ids=2');
    expect(url).toContain('ordering=score');
  });

  it('starts with the correct API base URL', () => {
    const url = buildQueryParams([], mockAreas, [1, 5], false, new Map(), 'scoreDown');
    expect(url).toMatch(/^http:\/\/localhost:8000\/api\/towers\/\?/);
  });

  it('handles edge case: empty difficulty range', () => {
    const url = buildQueryParams([], mockAreas, [5, 5], false, new Map(), 'scoreDown');
    expect(url).toContain('difficulty_min=5');
    expect(url).toContain('difficulty_max=5');
  });

  it('handles empty towerStatuses map', () => {
    const url = buildQueryParams([], mockAreas, [1, 5], true, new Map(), 'scoreDown');
    expect(url).not.toContain('exclude_completed');
    expect(url).not.toContain('completed_ids');
    expect(url).not.toContain('ignored_ids');
  });
});