// Storage abstraction for AnoNga

const STORAGE_KEYS = {
  LANGUAGE: 'anonga_language',
  FAVORITES: 'anonga_favorites',
  CUSTOM_QUESTIONS: 'anonga_custom_questions',
  IMPORTED_DECKS: 'anonga_imported_decks',
};

export function initStorage() {
  // Initialize storage on app start
  if (!localStorage.getItem(STORAGE_KEYS.LANGUAGE)) {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, 'en');
  }
  if (!localStorage.getItem(STORAGE_KEYS.FAVORITES)) {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, '[]');
  }
  if (!localStorage.getItem(STORAGE_KEYS.CUSTOM_QUESTIONS)) {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_QUESTIONS, '[]');
  }
}

export function getLanguage() {
  return localStorage.getItem(STORAGE_KEYS.LANGUAGE) || 'en';
}

export function setLanguage(lang) {
  localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
}

export function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES) || '[]');
  } catch {
    return [];
  }
}

export function addFavorite(question) {
  const favorites = getFavorites();
  if (!favorites.some((fav) => fav.id === question.id)) {
    favorites.push(question);
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
  }
}

export function removeFavorite(questionId) {
  const favorites = getFavorites();
  const filtered = favorites.filter((fav) => fav.id !== questionId);
  localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(filtered));
}

export function getCustomQuestions() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOM_QUESTIONS) || '[]');
  } catch {
    return [];
  }
}

export function saveCustomQuestion(question) {
  const questions = getCustomQuestions();
  questions.push(question);
  localStorage.setItem(STORAGE_KEYS.CUSTOM_QUESTIONS, JSON.stringify(questions));
}
