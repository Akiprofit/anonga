import { describe, it, expect, beforeEach } from 'vitest';
import {
  initStorage,
  getLanguage,
  setLanguage,
  getFavorites,
  addFavorite,
  removeFavorite,
} from '../src/features/storage.js';

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initStorage seeds language and favorites', () => {
    initStorage();
    expect(getLanguage()).toBe('en');
    expect(getFavorites()).toEqual([]);
  });

  it('setLanguage persists and returns success', () => {
    expect(setLanguage('tl')).toBe(true);
    expect(getLanguage()).toBe('tl');
  });

  it('addFavorite stores and removeFavorite clears', () => {
    const q = { id: 'q1', en: 'Hi', tl: 'Kumusta' };
    expect(addFavorite(q)).toBe(true);
    expect(getFavorites()).toHaveLength(1);
    expect(removeFavorite('q1')).toBe(true);
    expect(getFavorites()).toHaveLength(0);
  });

  it('getFavorites ignores non-array / invalid stored data', () => {
    localStorage.setItem('anonga_favorites', '{bad');
    expect(getFavorites()).toEqual([]);
    localStorage.setItem('anonga_favorites', JSON.stringify({ a: 1 }));
    expect(getFavorites()).toEqual([]);
  });

  it('addFavorite rejects entries without an id', () => {
    expect(addFavorite({ en: 'x' })).toBe(false);
    expect(getFavorites()).toHaveLength(0);
  });
});