// Card visual themes for AnoNga.
// Visual identity is separate from question content and session order.

export const THEME_LIST = [
  {
    id: 'romantic',
    label: 'Romantic',
    swatch: 'linear-gradient(135deg, #fffaf7 0%, #f3c9c5 55%, #c97777 100%)',
  },
  {
    id: 'funny',
    label: 'Funny',
    swatch: 'linear-gradient(135deg, #fff9de 0%, #ffd18a 55%, #ef8a3c 100%)',
  },
  {
    id: 'deep',
    label: 'Deep talk',
    swatch: 'linear-gradient(135deg, #2b3540 0%, #1b232b 60%, #c9a86a 100%)',
  },
  {
    id: 'friendly',
    label: 'Friendly',
    swatch: 'linear-gradient(135deg, #f2fbf8 0%, #bfe3d9 55%, #2f7d6d 100%)',
  },
  {
    id: 'minimal',
    label: 'Minimal',
    swatch: 'linear-gradient(135deg, #fdfbf6 0%, #e6dcc8 60%, #8b6f47 100%)',
  },
  {
    id: 'pastel',
    label: 'Pastel',
    swatch: 'linear-gradient(135deg, #fdf4fa 0%, #d9cdf4 55%, #a78bda 100%)',
  },
  {
    id: 'dark',
    label: 'Dark & elegant',
    swatch: 'linear-gradient(135deg, #23252e 0%, #15161c 60%, #d4a574 100%)',
  },
  // --- Six complementary themes ---
  {
    id: 'ocean',
    label: 'Praisel',
    swatch: 'linear-gradient(135deg, #f0f7fa 0%, #b8dce8 55%, #3a7ca5 100%)',
  },
  {
    id: 'sage',
    label: 'Sage',
    swatch: 'linear-gradient(135deg, #f5f8f2 0%, #c8dcc0 55%, #5a7a5c 100%)',
  },
  {
    id: 'sunset',
    label: 'Sunset',
    swatch: 'linear-gradient(135deg, #fdf3ee 0%, #f2c4a8 55%, #c75b3e 100%)',
  },
  {
    id: 'lavender',
    label: 'Lavender',
    swatch: 'linear-gradient(135deg, #f7f3fb 0%, #d9cdf4 55%, #8b6fa8 100%)',
  },
  {
    id: 'berry',
    label: 'Berry',
    swatch: 'linear-gradient(135deg, #faf2f5 0%, #e8c4d4 55%, #9b4d6e 100%)',
  },
  {
    id: 'citrus',
    label: 'Citrus',
    swatch: 'linear-gradient(135deg, #fdf8ee 0%, #f0dca0 55%, #b8860b 100%)',
  },
  // --- Four maroon-inspired themes ---
  {
    id: 'classic-maroon',
    label: 'Classic Maroon',
    swatch: 'linear-gradient(135deg, #faf2f0 0%, #d9b8b0 55%, #7b2d3f 100%)',
  },
  {
    id: 'wine-burgundy',
    label: 'Wine Burgundy',
    swatch: 'linear-gradient(135deg, #f8f0f2 0%, #d4a8b4 55%, #6b1f3a 100%)',
  },
  {
    id: 'dusty-rosewood',
    label: 'Dusty Rosewood',
    swatch: 'linear-gradient(135deg, #f7f1f0 0%, #d4b8b0 55%, #8b4a52 100%)',
  },
  {
    id: 'dark-cherry',
    label: 'Dark Cherry',
    swatch: 'linear-gradient(135deg, #2a1a1e 0%, #1a0f12 60%, #c75b6e 100%)',
  },
];

export const DEFAULT_THEME = 'friendly';

const COLLECTION_THEMES = {
  solo: 'friendly',
  together: 'romantic',
  friends: 'pastel',
};

const DECK_THEMES = {
  'getting-to-know': 'friendly',
  'in-relationship': 'romantic',
  friends: 'pastel',
  'faith-life': 'deep',
  'fun-games': 'funny',
};

const COLOR_THEMES = {
  '#c9846f': 'romantic',
  '#3d2f5c': 'dark',
  '#5a7a5c': 'friendly',
  '#8b6f47': 'minimal',
  '#c8957d': 'pastel',
  '#6b4c5a': 'dark',
  // The remaining palette swatches used to fall back to the collection theme,
  // so e.g. a blue collection played with a pink card. Map every swatch to the
  // existing theme built from that colour.
  '#7b2d3f': 'classic-maroon',
  '#6b1f3a': 'wine-burgundy',
  '#8b4a52': 'dusty-rosewood',
  '#c75b6e': 'dark-cherry',
  '#3a7ca5': 'ocean',
  '#c75b3e': 'sunset',
  '#8b6fa8': 'lavender',
  '#9b4d6e': 'berry',
  '#b8860b': 'citrus',
};

const STORAGE_KEY = 'anonga_deck_themes';

export function isValidTheme(themeId) {
  return THEME_LIST.some((theme) => theme.id === themeId);
}

export function themeForCollection(collection) {
  return COLLECTION_THEMES[collection] || DEFAULT_THEME;
}

function readThemeMap() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function getStoredDeckTheme(deckId) {
  if (!deckId) return null;
  return readThemeMap()[deckId] || null;
}

export function saveDeckTheme(deckId, themeId) {
  if (!deckId || !isValidTheme(themeId)) return false;
  const map = readThemeMap();
  map[deckId] = themeId;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    return true;
  } catch (error) {
    console.warn('Could not save deck theme:', error);
    return false;
  }
}

export function getDeckTheme(deck) {
  if (!deck) return DEFAULT_THEME;

  // An explicit choice saved by the theme picker always wins. The deck record's
  // creation-time `theme` must not override it (that made themes revert).
  const stored = getStoredDeckTheme(deck.id);
  if (stored && isValidTheme(stored)) return stored;

  const byColor = COLOR_THEMES[String(deck.color || '').toLowerCase()];

  // For user-created collections the colour chosen in the wizard is the card
  // identity. The legacy creation-time `theme` used to win here, so a blue
  // collection played with a pink card. Built-in decks keep their fixed themes.
  if (!deck.isDefault && !deck.isHandmade && byColor) return byColor;

  if (deck.theme && isValidTheme(deck.theme)) return deck.theme;

  if (DECK_THEMES[deck.id]) return DECK_THEMES[deck.id];

  if (byColor) return byColor;

  return themeForCollection(deck.collection);
}

export function getTheme(themeId) {
  return THEME_LIST.find((theme) => theme.id === themeId) || THEME_LIST.find((theme) => theme.id === DEFAULT_THEME);
}
