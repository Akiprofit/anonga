import { describe, it, expect, beforeEach } from 'vitest';
import {
  getDeckTheme,
  saveDeckTheme,
  isValidTheme,
  DEFAULT_THEME,
} from '../src/features/cardThemes.js';

describe('cardThemes', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to friendly', () => {
    expect(getDeckTheme(null)).toBe(DEFAULT_THEME);
    expect(getDeckTheme({})).toBe(DEFAULT_THEME);
  });

  it('maps every palette colour to an existing theme', () => {
    const colours = ['#c9846f', '#3a7ca5', '#9b4d6e', '#b8860b'];
    colours.forEach((color) => {
      const theme = getDeckTheme({ id: 'custom_x', isDefault: false, color });
      expect(isValidTheme(theme)).toBe(true);
    });
    expect(getDeckTheme({ id: 'custom_x', isDefault: false, color: '#3a7ca5' })).toBe('ocean');
  });

  it('a saved theme beats the creation-time theme', () => {
    saveDeckTheme('d1', 'berry');
    expect(getDeckTheme({ id: 'd1', theme: 'friendly', color: '#c9846f' })).toBe('berry');
  });

  it('built-in decks keep their fixed theme', () => {
    expect(getDeckTheme({ id: 'getting-to-know', isDefault: true, color: '#3a7ca5' })).toBe('friendly');
  });

  it('saveDeckTheme reports success/failure', () => {
    expect(saveDeckTheme('d2', 'ocean')).toBe(true);
    expect(saveDeckTheme('d2', 'nope')).toBe(false);
  });
});