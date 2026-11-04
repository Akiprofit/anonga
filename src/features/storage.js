// Storage abstraction for AnoNga

const STORAGE_KEYS = {
  LANGUAGE: 'anonga_language',
  FAVORITES: 'anonga_favorites',
  CUSTOM_QUESTIONS: 'anonga_custom_questions',
  IMPORTED_DECKS: 'anonga_imported_decks',
};

function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error(`Could not write ${key}:`, error);
    return false;
  }
}

export function initStorage() {
  // Initialize storage on app start. Existing values are never overwritten.
  if (!localStorage.getItem(STORAGE_KEYS.LANGUAGE)) {
    safeSetItem(STORAGE_KEYS.LANGUAGE, 'en');
  }
  if (!localStorage.getItem(STORAGE_KEYS.FAVORITES)) {
    safeSetItem(STORAGE_KEYS.FAVORITES, '[]');
  }
  if (!localStorage.getItem(STORAGE_KEYS.CUSTOM_QUESTIONS)) {
    safeSetItem(STORAGE_KEYS.CUSTOM_QUESTIONS, '[]');
  }
}

export function getLanguage() {
  return localStorage.getItem(STORAGE_KEYS.LANGUAGE) || 'en';
}

export function setLanguage(lang) {
  return safeSetItem(STORAGE_KEYS.LANGUAGE, lang);
}

export function getFavorites() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES) || '[]');
    return Array.isArray(parsed) ? parsed.filter((fav) => fav && typeof fav === 'object') : [];
  } catch {
    return [];
  }
}

export function addFavorite(question) {
  if (!question || !question.id) return false;
  const favorites = getFavorites();
  if (!favorites.some((fav) => fav.id === question.id)) {
    favorites.push(question);
    return safeSetItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
  }
  return true;
}

export function removeFavorite(questionId) {
  const favorites = getFavorites();
  const filtered = favorites.filter((fav) => fav.id !== questionId);
  return safeSetItem(STORAGE_KEYS.FAVORITES, JSON.stringify(filtered));
}
