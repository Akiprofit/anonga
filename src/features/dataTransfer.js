// Backup, restore and CSV export helpers for AnoNga.
// Pure functions live here so they can be tested without a DOM or storage.

export const BACKUP_FORMAT = 'anonga-backup';
export const BACKUP_VERSION = 1;
export const MAX_BACKUP_BYTES = 5 * 1024 * 1024;
export const MAX_DECKS = 500;
export const MAX_QUESTIONS = 50000;

export const DEFAULT_COLLECTION = 'solo';
export const ALLOWED_COLLECTIONS = ['solo', 'together', 'friends'];
export const DEFAULT_DECK_COLOR = '#c9846f';

const DEFAULT_DECK_IDS = [
  'getting-to-know',
  'in-relationship',
  'friends',
  'faith-life',
  'fun-games',
  'handmade',
  'favorites',
];

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isHexColor(value) {
  return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);
}

function cleanString(value, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback;
}

function uniqueId(candidate, usedIds, fallback) {
  let base = cleanString(candidate) || fallback;
  let id = base;
  let suffix = 2;
  while (!id || usedIds.has(id) || DEFAULT_DECK_IDS.includes(id)) {
    id = `${base}_r${suffix}`;
    suffix += 1;
  }
  usedIds.add(id);
  return id;
}

function normalizeQuestion(raw, fallbackId) {
  if (!isPlainObject(raw)) return null;

  const en = cleanString(raw.en);
  const tl = cleanString(raw.tl);
  if (!en && !tl) return null;

  const question = {
    id: cleanString(raw.id) || fallbackId,
    en,
    tl,
  };

  const reflection = cleanString(raw.reflection);
  if (reflection) question.reflection = reflection;

  return question;
}

function normalizeQuestions(list, deckId) {
  if (!Array.isArray(list)) return [];

  const usedQuestionIds = new Set();
  const questions = [];

  list.forEach((raw, index) => {
    const question = normalizeQuestion(raw, `${deckId}_q${index}`);
    if (!question) return;

    let id = question.id;
    let suffix = 2;
    while (usedQuestionIds.has(id)) {
      id = `${question.id}_r${suffix}`;
      suffix += 1;
    }
    question.id = id;
    usedQuestionIds.add(id);
    questions.push(question);
  });

  return questions;
}

function normalizeDeck(raw, { isImported, usedIds, index }) {
  if (!isPlainObject(raw)) return null;

  const name = cleanString(raw.name);
  if (!name) return null;

  const rawId = cleanString(raw.id);
  const fallbackId = isImported
    ? `imported_restored_${index + 1}`
    : `custom_restored_${index + 1}`;
  const preferredId = isImported
    ? (rawId || fallbackId)
    : (rawId.startsWith('custom_') ? rawId : fallbackId);
  const id = uniqueId(preferredId, usedIds, fallbackId);

  const questions = normalizeQuestions(raw.questions, id);
  const collection = ALLOWED_COLLECTIONS.includes(raw.collection)
    ? raw.collection
    : DEFAULT_COLLECTION;

  const deck = {
    id,
    name,
    description: cleanString(raw.description),
    collection,
    questions,
    count: questions.length,
    color: isHexColor(raw.color) ? raw.color : DEFAULT_DECK_COLOR,
    isCustom: !isImported,
  };

  if (isImported) deck.isImported = true;
  if (typeof raw.theme === 'string' && raw.theme) deck.theme = raw.theme;

  return deck;
}

function normalizeFavorites(list) {
  if (!Array.isArray(list)) return [];

  const used = new Set();
  const favorites = [];

  list.forEach((raw) => {
    if (!isPlainObject(raw)) return;
    const id = cleanString(raw.id);
    const en = cleanString(raw.en);
    const tl = cleanString(raw.tl);
    if (!id || (!en && !tl) || used.has(id)) return;

    const favorite = { id, en, tl };
    const reflection = cleanString(raw.reflection);
    if (reflection) favorite.reflection = reflection;
    used.add(id);
    favorites.push(favorite);
  });

  return favorites;
}

function normalizeOverrides(raw) {
  if (!isPlainObject(raw)) return {};

  const overrides = {};
  Object.keys(raw).forEach((deckId) => {
    if (!deckId || !Array.isArray(raw[deckId])) return;
    overrides[deckId] = normalizeQuestions(raw[deckId], deckId);
  });
  return overrides;
}

function normalizeThemes(raw) {
  if (!isPlainObject(raw)) return {};

  const themes = {};
  Object.keys(raw).forEach((deckId) => {
    const theme = raw[deckId];
    if (deckId && typeof theme === 'string' && theme) themes[deckId] = theme;
  });
  return themes;
}

export function buildBackup({
  language = 'en',
  favorites = [],
  customDecks = [],
  importedDecks = [],
  handmadeQuestions = [],
  deckOverrides = {},
  deckThemes = {},
  appVersion = '',
  now = new Date(),
} = {}) {
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: now.toISOString(),
    app: 'AnoNga?',
    appVersion,
    data: {
      language: language === 'tl' ? 'tl' : 'en',
      favorites: Array.isArray(favorites) ? favorites : [],
      customDecks: Array.isArray(customDecks) ? customDecks : [],
      importedDecks: Array.isArray(importedDecks) ? importedDecks : [],
      handmadeQuestions: Array.isArray(handmadeQuestions) ? handmadeQuestions : [],
      deckOverrides: isPlainObject(deckOverrides) ? deckOverrides : {},
      deckThemes: isPlainObject(deckThemes) ? deckThemes : {},
    },
  };
}

export function backupSummary(backup) {
  const data = backup && backup.data ? backup.data : {};
  const customDecks = Array.isArray(data.customDecks) ? data.customDecks : [];
  const importedDecks = Array.isArray(data.importedDecks) ? data.importedDecks : [];
  const handmadeQuestions = Array.isArray(data.handmadeQuestions) ? data.handmadeQuestions : [];
  const favorites = Array.isArray(data.favorites) ? data.favorites : [];
  const overrides = isPlainObject(data.deckOverrides) ? data.deckOverrides : {};
  const themes = isPlainObject(data.deckThemes) ? data.deckThemes : {};

  const countQuestions = (decks) => decks.reduce(
    (total, deck) => total + (Array.isArray(deck.questions) ? deck.questions.length : 0),
    0,
  );

  return {
    customDecks: customDecks.length,
    importedDecks: importedDecks.length,
    handmadeQuestions: handmadeQuestions.length,
    favorites: favorites.length,
    overriddenDecks: Object.keys(overrides).length,
    themes: Object.keys(themes).length,
    totalQuestions: countQuestions(customDecks) + countQuestions(importedDecks) + handmadeQuestions.length,
  };
}

export function parseBackup(text) {
  if (typeof text !== 'string' || !text.trim()) {
    return { ok: false, error: 'The backup file is empty.' };
  }
  if (text.length > MAX_BACKUP_BYTES) {
    return { ok: false, error: 'The backup file is too large (limit 5 MB).' };
  }

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: 'The file is not valid JSON. Choose an AnoNga backup file.' };
  }

  if (!isPlainObject(parsed) || parsed.format !== BACKUP_FORMAT) {
    return { ok: false, error: 'This is not an AnoNga backup file.' };
  }
  if (parsed.version !== BACKUP_VERSION) {
    return { ok: false, error: `Unsupported backup version: ${parsed.version}.` };
  }
  if (!isPlainObject(parsed.data)) {
    return { ok: false, error: 'The backup file has no data section.' };
  }

  const raw = parsed.data;
  if (
    (Array.isArray(raw.customDecks) && raw.customDecks.length > MAX_DECKS) ||
    (Array.isArray(raw.importedDecks) && raw.importedDecks.length > MAX_DECKS)
  ) {
    return { ok: false, error: `The backup has too many collections (limit ${MAX_DECKS}).` };
  }

  const usedIds = new Set();
  const customDecks = [];
  const importedDecks = [];

  if (Array.isArray(raw.customDecks)) {
    raw.customDecks.forEach((deck, index) => {
      const normalized = normalizeDeck(deck, { isImported: false, usedIds, index });
      if (normalized) customDecks.push(normalized);
    });
  }
  if (Array.isArray(raw.importedDecks)) {
    raw.importedDecks.forEach((deck, index) => {
      const normalized = normalizeDeck(deck, { isImported: true, usedIds, index });
      if (normalized) importedDecks.push(normalized);
    });
  }

  const handmadeQuestions = normalizeQuestions(raw.handmadeQuestions, 'handmade');
  const deckOverrides = normalizeOverrides(raw.deckOverrides);
  const deckThemes = normalizeThemes(raw.deckThemes);
  const favorites = normalizeFavorites(raw.favorites);

  const totalQuestions = customDecks.reduce((total, deck) => total + deck.questions.length, 0)
    + importedDecks.reduce((total, deck) => total + deck.questions.length, 0)
    + handmadeQuestions.length;

  if (totalQuestions > MAX_QUESTIONS) {
    return { ok: false, error: `The backup has too many questions (limit ${MAX_QUESTIONS}).` };
  }

  const backup = {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: typeof parsed.exportedAt === 'string' ? parsed.exportedAt : '',
    appVersion: typeof parsed.appVersion === 'string' ? parsed.appVersion : '',
    data: {
      language: raw.language === 'tl' ? 'tl' : 'en',
      favorites,
      customDecks,
      importedDecks,
      handmadeQuestions,
      deckOverrides,
      deckThemes,
    },
  };

  return { ok: true, backup, summary: backupSummary(backup) };
}

function csvCell(value) {
  const text = String(value ?? '');
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function questionsToCsv(questions) {
  const list = Array.isArray(questions) ? questions : [];
  const rows = [['question_en', 'question_tl', 'reflection']];

  list.forEach((question) => {
    if (!isPlainObject(question)) return;
    const en = cleanString(question.en);
    const tl = cleanString(question.tl);
    if (!en && !tl) return;
    rows.push([en, tl, cleanString(question.reflection)]);
  });

  // UTF-8 BOM keeps Excel from mangling non-ASCII characters.
  return `\uFEFF${rows.map((row) => row.map(csvCell).join(',')).join('\r\n')}\r\n`;
}

export function slugifyFilename(name) {
  const slug = String(name || '')
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
  return slug || 'collection';
}

export function backupFilename(now = new Date()) {
  const pad = (value) => String(value).padStart(2, '0');
  return `anonga-backup-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}.json`;
}

export function csvFilename(deckName) {
  return `anonga-${slugifyFilename(deckName)}.csv`;
}
