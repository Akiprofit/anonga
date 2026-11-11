import { App as CapacitorApp } from '@capacitor/app';
import { registerPlugin } from '@capacitor/core';
import { initStorage, getLanguage, setLanguage, getFavorites, addFavorite, removeFavorite } from './storage.js';
import { defaultQuestions } from '../data/questions.js';
import {
  THEME_LIST,
  getDeckTheme,
  getTheme,
  saveDeckTheme,
  themeForCollection,
  isValidTheme,
} from './cardThemes.js';
import {
  buildBackup,
  parseBackup,
  backupFilename,
  questionsToCsv,
  csvFilename,
} from './dataTransfer.js';

// Lucide icon SVG data
const iconSvgs = {
  'home': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  'book': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
  'heart': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
  'pencil': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
  'plus': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  'download': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
  'upload': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
  'search': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  'info': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  'arrow-left': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
  'arrow-right': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
  'chevron-up': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>',
  'chevron-down': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',
  'shuffle': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>',
  'palette': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.6-.7 1.6-1.6 0-.4-.2-.8-.4-1.1-.3-.3-.4-.7-.4-1.1 0-.9.7-1.6 1.6-1.6H16c3.3 0 6-2.7 6-6 0-4.9-4.5-8.6-10-8.6z"/></svg>',
  'sparkles': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z"/><path d="M5 3l.7 1.6L7.3 5.3 5.7 6 5 7.6 4.3 6 2.7 5.3 4.3 4.6z"/></svg>',
  'trash': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>',
  'x': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
};

function renderIcon(iconName, size = 24, isFilled = false) {
  const svgString = iconSvgs[iconName];
  if (!svgString) return null;

  const parser = new DOMParser();
  const svg = parser.parseFromString(svgString, 'image/svg+xml').firstChild;
  svg.classList.add('icon');
  svg.setAttribute('data-icon', iconName);
  if (isFilled && iconName === 'heart') {
    svg.setAttribute('fill', 'currentColor');
  }
  return svg;
}

function renderAllIcons() {
  document.querySelectorAll('.icon-wrapper').forEach(wrapper => {
    if (wrapper.children.length === 0) {
      const iconName = wrapper.dataset.icon;
      const isFilled = wrapper.dataset.filled === 'true';
      const svg = renderIcon(iconName, 24, isFilled);
      if (svg) wrapper.appendChild(svg);
    }
  });
}

let currentLanguage = 'en';
let currentDeck = null;
let allDecks = [];
let currentDeckQuestions = [];
let currentCollection = 'all';
let currentTab = 'decks';
let selectedDeckColor = '#c9846f';
let window_importedQuestions = [];
// Which step opened the color picker, so Back returns to the right place.
let colorStepOrigin = 'csvImportStep';
let isCreatingCollection = false;

// Play session
let sessionOrder = [];
let sessionPosition = 0;
let isFlipped = false;
let isAnimating = false;
let isShuffling = false;
let isComplete = false;

// Pointer / swipe gesture tracking
let activePointerId = null;
let pointerStartX = 0;
let pointerStartY = 0;
let dragOffset = 0;
let dragOffsetY = 0;
let isDragging = false;

// Capacitor App plugin (native Android/iOS back button). Loaded lazily so the
// web build keeps working even if the plugin is unavailable.
let nativeAppPlugin = null;
try {
  if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) {
    nativeAppPlugin = CapacitorApp;
  }
} catch (error) {
  console.warn('Capacitor App plugin unavailable:', error);
}

// Temporary storage for deck details (filled before color selection)
let pendingDeckDetails = null;
let editingDeckId = null;
let infoDeckId = null;
let editingQuestionId = null;

const DEFAULT_DECK_COLOR = '#c9846f';
const CUSTOM_DECKS_KEY = 'anonga_custom_decks';
const IMPORTED_DECKS_KEY = 'anonga_imported_decks';
const HANDMADE_KEY = 'anonga_handmade_questions';
const DECK_OVERRIDES_KEY = 'anonga_deck_questions';
const DECK_THEMES_KEY = 'anonga_deck_themes';
const LANGUAGE_KEY = 'anonga_language';
const FAVORITES_KEY = 'anonga_favorites';
const LEGACY_CUSTOM_QUESTIONS_KEY = 'anonga_custom_questions';
const SESSION_PROGRESS_KEY = 'anonga_session_progress';
const APP_VERSION = '1.9';
const AUTO_BACKUP_PATH = 'AnoNga/anonga-autosave.json';
const AUTO_RESTORE_MARKER = 'anonga_autorestore_checked';

// Auto-backup state. The backup lives in shared Documents so it survives an
// uninstall, and is restored automatically on a fresh install.
let autoBackupTimer = null;
let autoBackupInFlight = false;
let autoBackupSuppressed = false;
let autoRestoreNotice = null;
let autoRestorePendingAccess = false;
let autoBackupBlockedByAccess = false;
let storageAccessPrompted = false;

const StorageAccess = registerPlugin('StorageAccess');

/* ============================================================================
   Shared helpers
   ============================================================================ */

// Escape anything that came from the user before interpolating it into HTML.
function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[char]));
}

function isValidHexColor(value) {
  return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);
}

function safeColor(value, fallback = DEFAULT_DECK_COLOR) {
  return isValidHexColor(value) ? value : fallback;
}

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed === null || parsed === undefined ? fallback : parsed;
  } catch (error) {
    console.error(`Could not read ${key}:`, error);
    return fallback;
  }
}

function readJsonArray(key) {
  const value = readJson(key, []);
  return Array.isArray(value) ? value : [];
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    scheduleAutoBackup();
    return true;
  } catch (error) {
    console.error(`Could not save ${key}:`, error);
    return false;
  }
}

function notifySaveFailure() {
  showAlertModal({
    title: 'Could Not Save',
    message: 'AnoNga could not write to device storage. Your change was not saved. Free some space and try again.',
    type: 'error',
  });
}

function customDecksFrom(list) {
  return list.filter((deck) => deck && !deck.isDefault && !deck.isHandmade && String(deck.id).startsWith('custom_'));
}

// Persist an edit to whichever store owns the deck. Legacy imported decks live
// under a different key; writing only the custom list made their edits look
// saved until the next launch.
function persistDeckEdit(deck) {
  if (!deck) return false;
  const id = String(deck.id || '');

  if (deck.isImported || id.startsWith('imported_')) {
    const list = readJsonArray(IMPORTED_DECKS_KEY).map((item) =>
      item && item.id === deck.id
        ? {
            ...item,
            name: deck.name,
            description: deck.description,
            collection: deck.collection,
            color: deck.color,
          }
        : item
    );
    return writeJson(IMPORTED_DECKS_KEY, list);
  }

  return writeJson(CUSTOM_DECKS_KEY, customDecksFrom(allDecks));
}

function saveCustomDecks(list = allDecks) {
  return writeJson(CUSTOM_DECKS_KEY, customDecksFrom(list));
}

function saveDeckQuestionOverrides() {
  const overrides = {};
  allDecks.forEach((deck) => {
    if (deck && deck.hasQuestionOverrides && Array.isArray(deck.questions)) {
      overrides[deck.id] = deck.questions;
    }
  });
  return writeJson(DECK_OVERRIDES_KEY, overrides);
}

// Persist questions for any deck type. Returns false when storage fails.
function saveDeckQuestions(deck) {
  if (!deck || !Array.isArray(deck.questions)) return false;
  if (deck.isHandmade || deck.id === 'handmade') {
    return writeJson(HANDMADE_KEY, deck.questions);
  }
  if (String(deck.id).startsWith('custom_')) {
    return saveCustomDecks();
  }
  deck.hasQuestionOverrides = true;
  return saveDeckQuestionOverrides();
}

// One case-insensitive rule for both the manual and CSV creation paths.
function findDeckByName(name, excludeId = null) {
  const normalized = String(name || '').trim().toLowerCase();
  if (!normalized) return null;
  return allDecks.find((deck) => (
    deck
    && deck.id !== excludeId
    && String(deck.name || '').trim().toLowerCase() === normalized
  )) || null;
}

// Resume progress is intentionally not part of the backup: it is device state,
// not user content. It is still cleared by Reset App Data.
function readSessionProgressMap() {
  const map = readJson(SESSION_PROGRESS_KEY, {});
  return map && typeof map === 'object' && !Array.isArray(map) ? map : {};
}

function writeSessionProgressMap(map) {
  try {
    localStorage.setItem(SESSION_PROGRESS_KEY, JSON.stringify(map));
  } catch (error) {
    console.warn('Could not save session progress:', error);
  }
}

function saveSessionProgress() {
  // A mixed deck is a one-off view over other decks, so it must not create a
  // resumable session of its own.
  if (currentDeck && currentDeck.isMix) return;
  if (!currentDeck || !currentDeck.id || !currentDeckQuestions.length) return;
  const question = getCurrentQuestion();
  const map = readSessionProgressMap();
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  Object.keys(map).forEach((key) => {
    if (!map[key] || !Number.isFinite(map[key].updatedAt) || map[key].updatedAt < cutoff) {
      delete map[key];
    }
  });
  map[currentDeck.id] = {
    questionId: question && question.id ? question.id : '',
    position: sessionPosition,
    updatedAt: Date.now(),
  };
  writeSessionProgressMap(map);
}

function clearSessionProgress(deckId) {
  if (!deckId) return;
  const map = readSessionProgressMap();
  if (!Object.prototype.hasOwnProperty.call(map, deckId)) return;
  delete map[deckId];
  writeSessionProgressMap(map);
}

// Re-sync the live play session after questions are added, edited or removed.
// Rebuilds sessionOrder so new cards are reachable and removed cards do not
// leave stale indexes behind, then keeps the user on the same card when it
// still exists.
function refreshCurrentDeckSession(deck) {
  if (!deck || !currentDeck || currentDeck.id !== deck.id) return;

  const previousQuestions = currentDeckQuestions;
  const currentQuestion = previousQuestions[sessionOrder[sessionPosition]];
  const currentId = currentQuestion && currentQuestion.id ? currentQuestion.id : '';

  currentDeckQuestions = Array.isArray(deck.questions) ? deck.questions : [];

  const indexById = new Map();
  currentDeckQuestions.forEach((question, index) => {
    if (question && question.id) indexById.set(question.id, index);
  });

  const rebuiltOrder = [];
  const usedIndexes = new Set();
  sessionOrder.forEach((oldIndex) => {
    const question = previousQuestions[oldIndex];
    const newIndex = question && question.id ? indexById.get(question.id) : undefined;
    if (newIndex !== undefined && !usedIndexes.has(newIndex)) {
      rebuiltOrder.push(newIndex);
      usedIndexes.add(newIndex);
    }
  });
  currentDeckQuestions.forEach((_, index) => {
    if (!usedIndexes.has(index)) rebuiltOrder.push(index);
  });
  sessionOrder = rebuiltOrder;

  const targetIndex = currentId
    ? currentDeckQuestions.findIndex((question) => question && question.id === currentId)
    : -1;
  const targetPosition = targetIndex >= 0 ? sessionOrder.indexOf(targetIndex) : -1;
  if (targetPosition >= 0) {
    sessionPosition = targetPosition;
  } else if (sessionPosition >= currentDeckQuestions.length) {
    sessionPosition = Math.max(0, currentDeckQuestions.length - 1);
  }

  const playScreen = document.getElementById('playScreen');
  if (playScreen && playScreen.classList.contains('active')) {
    renderCardContent();
    updateDeckProgress();
    updateStack();
    updatePlayControls();
  }
}

function refreshDeckCounts() {
  allDecks.forEach((deck) => {
    if (deck && Array.isArray(deck.questions)) deck.count = deck.questions.length;
  });
}

function questionCountLabel(count) {
  const value = Number.isFinite(count) ? count : 0;
  return `${value} ${value === 1 ? 'question' : 'questions'}`;
}

function resetCategoryGroup(groupId, hiddenId) {
  const group = document.getElementById(groupId);
  const hidden = document.getElementById(hiddenId);
  if (hidden) hidden.value = '';
  if (!group) return;
  group.querySelectorAll('.category-pill').forEach((pill) => {
    pill.classList.remove('selected');
    pill.setAttribute('aria-pressed', 'false');
  });
}

// Category pills are static markup, so bind them exactly once at startup.
function setupCategoryPills(groupId, hiddenId) {
  const group = document.getElementById(groupId);
  const hidden = document.getElementById(hiddenId);
  if (!group || !hidden) return;

  group.querySelectorAll('.category-pill').forEach((pill) => {
    pill.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const value = pill.dataset.value;
      hidden.value = value;
      group.querySelectorAll('.category-pill').forEach((other) => {
        const isSelected = other.dataset.value === value;
        other.classList.toggle('selected', isSelected);
        other.setAttribute('aria-pressed', String(isSelected));
      });
    });
  });
}

function showCreationStep(stepId) {
  document.querySelectorAll('#createDeckModal .creation-step').forEach((step) => {
    step.classList.toggle('active', step.id === stepId);
  });
}

// Clears every piece of transient creation state. Called when the modal opens
// and whenever it closes, so a cancelled import can never leak into a new deck.
function resetCreationFlow() {
  pendingDeckDetails = null;
  editingDeckId = null;
  window_importedQuestions = [];
  const createBtn = document.getElementById('colorCreateBtn');
  if (createBtn) createBtn.textContent = 'Create Collection';

  // Edit mode reuses this wizard, so every piece of edit chrome must reset too.
  const modal = document.getElementById('createDeckModal');
  if (modal) modal.classList.remove('is-editing');
  const modalTitle = document.getElementById('createDeckTitle');
  if (modalTitle) modalTitle.textContent = 'Add New Collection';
  const manualBack = document.getElementById('manualBackBtn');
  if (manualBack) manualBack.textContent = 'Back';
  const manualStepTitle = document.getElementById('manualStepTitle');
  if (manualStepTitle) manualStepTitle.textContent = 'Step 2: Collection Details';
  colorStepOrigin = 'csvImportStep';
  selectedDeckColor = DEFAULT_DECK_COLOR;

  const csvForm = document.getElementById('csvImportForm');
  const createForm = document.getElementById('createDeckForm');
  const detailsForm = document.getElementById('deckDetailsForm');
  if (csvForm) csvForm.reset();
  if (createForm) createForm.reset();
  if (detailsForm) detailsForm.reset();

  const csvFile = document.getElementById('csvFile');
  if (csvFile) csvFile.value = '';

  resetCategoryGroup('newDeckCollectionGroup', 'newDeckCollection');
  resetCategoryGroup('deckCategoryGroup', 'deckCategory');

  document.querySelectorAll('input[name="selectedColor"]').forEach((radio) => {
    radio.checked = false;
  });
  const defaultColor = document.getElementById('color1');
  if (defaultColor) defaultColor.checked = true;

  const previewTitle = document.querySelector('.color-preview-title');
  if (previewTitle) previewTitle.textContent = 'Your collection';
  const previewDesc = document.querySelector('.color-preview-desc');
  if (previewDesc) previewDesc.textContent = 'A little question to bring us closer.';
  const previewCount = document.querySelector('.color-preview-count');
  if (previewCount) previewCount.textContent = '0 questions';

  updateColorPreview(DEFAULT_DECK_COLOR);
  showCreationStep('csvImportStep');
}

function updateColorPreviewMeta() {
  const title = document.querySelector('.color-preview-title');
  const desc = document.querySelector('.color-preview-desc');
  const count = document.querySelector('.color-preview-count');
  if (title) title.textContent = pendingDeckDetails?.name || 'Your collection';
  if (desc) desc.textContent = pendingDeckDetails?.description || 'A little question to bring us closer.';
  if (count) {
    let total = Array.isArray(window_importedQuestions) ? window_importedQuestions.length : 0;
    if (editingDeckId) {
      const deck = allDecks.find((item) => item.id === editingDeckId);
      if (deck) total = Array.isArray(deck.questions) ? deck.questions.length : 0;
    }
    count.textContent = `${total} ${total === 1 ? 'question' : 'questions'}`;
  }
}

const defaultDecks = [
  {
    id: 'getting-to-know',
    name: 'Getting to Know',
    description: 'A little closer, one question at a time.',
    collection: 'solo',
    questions: [],
    color: '#c9846f',
    isDefault: true,
  },
  {
    id: 'in-relationship',
    name: 'In a Relationship',
    description: 'Decks for two, for every season of it.',
    collection: 'together',
    questions: [],
    color: '#3d2f5c',
    isDefault: true,
  },
  {
    id: 'friends',
    name: 'Friends',
    description: 'Know them better, laugh harder.',
    collection: 'friends',
    questions: [],
    color: '#5a7a5c',
    isDefault: true,
  },
  {
    id: 'faith-life',
    name: 'Faith & Life',
    description: 'Go deeper into what matters.',
    collection: 'solo',
    questions: [],
    color: '#8b6f47',
    isDefault: true,
  },
  {
    id: 'fun-games',
    name: 'Fun & Games',
    description: 'Laugh, play, and enjoy.',
    collection: 'friends',
    questions: [],
    color: '#c8957d',
    isDefault: true,
  },
];

export async function initApp() {
  try {
    console.log('AnoNga app initializing...');

    // Restore a shared-storage backup before anything reads local data.
    await restoreAutoBackupIfNeeded();

    initStorage();
    currentLanguage = getLanguage() || 'en';

    // Initialize decks
    allDecks = JSON.parse(JSON.stringify(defaultDecks));

    // Assign questions to decks
    allDecks[0].questions = defaultQuestions.filter(q => q.category === 'deep');
    allDecks[1].questions = defaultQuestions.filter(q => q.category === 'couples');
    allDecks[2].questions = defaultQuestions.filter(q => q.category === 'friendship');
    allDecks[3].questions = defaultQuestions.filter(q => q.category === 'faith');
    allDecks[4].questions = defaultQuestions.filter(q => q.category === 'fun');

    // Update question counts
    allDecks.forEach(deck => {
      deck.count = deck.questions.length;
    });

    console.log('Decks initialized:', allDecks.length, 'decks');

    // Load imported and custom decks
    loadImportedDecks();
    loadDeckQuestionOverrides();
    ensureAllQuestionIds();
    refreshDeckCounts();

    // Setup event listeners
    setupEventListeners();
    setupPlayScreenListeners();
    setupAndroidBackButton();

    window.addEventListener('resize', scheduleCardTextFit);
    window.addEventListener('orientationchange', () => {
      setTimeout(scheduleCardTextFit, 150);
    });
    if (document.fonts?.ready) {
      document.fonts.ready.then(scheduleCardTextFit);
    }

    // Render icons
    renderAllIcons();

    // Render home screen
    renderHomeScreen();

    // Automatic backup: keep the shared-storage copy current, and tell the
    // user when a fresh install restored it.
    await setupAutoBackupListeners();
    showAutoRestoreNotice();
    scheduleAutoBackup();
    window.setTimeout(maybePromptStorageAccess, 500);

    console.log('App initialized successfully');
  } catch (error) {
    console.error('App initialization error:', error);
  }
}

function addLoadedDecks(list, isImported) {
  if (!Array.isArray(list)) return;
  list.forEach((deck) => {
    if (!deck || typeof deck !== 'object' || !deck.id) return;
    if (allDecks.find((existing) => existing.id === deck.id)) return;
    if (!Array.isArray(deck.questions)) deck.questions = [];
    if (isImported) deck.isImported = true;
    deck.count = deck.questions.length;
    allDecks.push(deck);
  });
}

function loadImportedDecks() {
  try {
    addLoadedDecks(readJsonArray(IMPORTED_DECKS_KEY), true);
  } catch (e) {
    console.error('Error loading imported decks:', e);
  }

  try {
    addLoadedDecks(readJsonArray(CUSTOM_DECKS_KEY), false);
  } catch (e) {
    console.error('Error loading custom decks:', e);
  }
}

// Questions added to or removed from built-in decks are stored separately so
// they survive a restart without touching the shipped question data.
function loadDeckQuestionOverrides() {
  const overrides = readJson(DECK_OVERRIDES_KEY, {});
  if (!overrides || typeof overrides !== 'object' || Array.isArray(overrides)) return;
  allDecks.forEach((deck) => {
    if (Array.isArray(overrides[deck.id])) {
      deck.questions = overrides[deck.id];
      deck.hasQuestionOverrides = true;
    }
  });
}


function ensureQuestionIdsForDeck(deck) {
  if (!deck || !Array.isArray(deck.questions)) return;
  deck.questions.forEach((question, index) => {
    if (!question.id) {
      question.id = `${deck.id || 'deck'}_q${index}`;
    }
  });
}

function ensureAllQuestionIds() {
  allDecks.forEach(ensureQuestionIdsForDeck);
}

function setupEventListeners() {
  // Keep keyboard focus inside an open modal (basic focus trap).
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    const modal = Array.from(document.querySelectorAll('.modal:not(.hidden)')).pop();
    if (!modal) return;
    const focusable = modal.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  // Language toggles
  const langHomeBtn = document.getElementById('langToggleHome');
  if (langHomeBtn) langHomeBtn.addEventListener('click', toggleLanguageHome);

  // Tab navigation. Always read the button (currentTarget), never the tapped
  // child icon, otherwise the pane id is undefined and both panes go blank.
  document.querySelectorAll('.tab-navigation .tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Collection tabs (filters)
  document.querySelectorAll('.collection-tabs .tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.collection-tabs .tab-btn').forEach((other) => other.classList.remove('active'));
      btn.classList.add('active');
      currentCollection = btn.dataset.collection || 'all';
      renderDecksList();
    });
  });

  // Search decks and questions.
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  if (searchInput) {
    searchInput.addEventListener('input', applySearch);
    searchInput.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        searchInput.value = '';
        applySearch();
        searchInput.blur();
      }
    });
  }
  if (clearSearchBtn && searchInput) {
    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      applySearch();
      searchInput.focus();
    });
  }

  // Collection cards (Favorites & Handmade)
  const favoritesCard = document.getElementById('favoritesCard');
  const handmadeCard = document.getElementById('handmadeCard');
  if (favoritesCard) favoritesCard.addEventListener('click', openFavoritesView);
  if (handmadeCard) handmadeCard.addEventListener('click', openHandmadeView);

  // Create deck button
  const createBtn = document.getElementById('createDeckBtn');
  if (createBtn) createBtn.addEventListener('click', openCreateDeckModal);

  // Data safety: backup, restore and reset.
  const backupBtn = document.getElementById('backupDataBtn');
  if (backupBtn) backupBtn.addEventListener('click', handleBackupData);

  const restoreBtn = document.getElementById('restoreDataBtn');
  const restoreInput = document.getElementById('restoreFileInput');
  if (restoreBtn && restoreInput) {
    restoreBtn.addEventListener('click', () => {
      restoreInput.value = '';
      restoreInput.click();
    });
    restoreInput.addEventListener('change', handleRestoreFile);
  }

  const resetBtn = document.getElementById('resetDataBtn');
  if (resetBtn) resetBtn.addEventListener('click', openResetDataModal);

  const resetCancelBtn = document.getElementById('resetCancelBtn');
  if (resetCancelBtn) resetCancelBtn.addEventListener('click', closeModals);

  const resetConfirmInput = document.getElementById('resetConfirmInput');
  const resetConfirmBtn = document.getElementById('resetConfirmBtn');
  if (resetConfirmInput && resetConfirmBtn) {
    resetConfirmInput.addEventListener('input', updateResetConfirmState);
    resetConfirmBtn.addEventListener('click', resetAllData);
  }

  // Bulk question selection and deletion.
  const selectAllQuestions = document.getElementById('selectAllQuestions');
  if (selectAllQuestions) {
    selectAllQuestions.addEventListener('change', () => {
      document.querySelectorAll('.question-select-checkbox').forEach((box) => {
        box.checked = selectAllQuestions.checked;
      });
      updateQuestionsSelectionState();
    });
  }
  const bulkDeleteQuestionsBtn = document.getElementById('bulkDeleteQuestionsBtn');
  if (bulkDeleteQuestionsBtn) {
    bulkDeleteQuestionsBtn.addEventListener('click', deleteSelectedQuestions);
  }
  const bulkMoveQuestionsBtn = document.getElementById('bulkMoveQuestionsBtn');
  if (bulkMoveQuestionsBtn) {
    bulkMoveQuestionsBtn.addEventListener('click', openMoveQuestionsModal);
  }
  const mixDecksBtn = document.getElementById('mixDecksBtn');
  if (mixDecksBtn) {
    mixDecksBtn.addEventListener('click', openMixDecksModal);
  }

  // Bind Edit Details once. Previously it was assigned each time the info modal
  // opened, which left the button dead if that assignment was ever skipped.
  const editDetailsBtn = document.getElementById('editDeckBtn');
  if (editDetailsBtn) {
    editDetailsBtn.addEventListener('click', () => {
      const id = infoDeckId;
      if (!id) return;
      closeModals();
      openEditCollectionModal(id);
    });
  }

  // Every form exists in the static markup, so bind each one exactly once.
  const csvForm = document.getElementById('csvImportForm');
  if (csvForm) csvForm.addEventListener('submit', handleCsvImport);

  const createForm = document.getElementById('createDeckForm');
  if (createForm) createForm.addEventListener('submit', handleCreateDeck);

  const detailsForm = document.getElementById('deckDetailsForm');
  if (detailsForm) detailsForm.addEventListener('submit', handleDeckDetails);

  const addQuestionsForm = document.getElementById('addQuestionsForm');
  if (addQuestionsForm) addQuestionsForm.addEventListener('submit', handleAddQuestion);

  const cancelEditQuestionBtn = document.getElementById('cancelEditQuestionBtn');
  if (cancelEditQuestionBtn) cancelEditQuestionBtn.addEventListener('click', resetQuestionEditor);

  const manualBtn = document.getElementById('manualImportBtn');
  if (manualBtn) manualBtn.addEventListener('click', switchToManualAdd);

  const manualBackBtn = document.getElementById('manualBackBtn');
  if (manualBackBtn) {
    manualBackBtn.addEventListener('click', () => {
      // In edit mode "Back" cancels the edit; it must never drop into the CSV
      // import step and start a second collection.
      if (editingDeckId) {
        closeModals();
        return;
      }
      switchBackToCSVStep();
    });
  }

  const detailsBackBtn = document.getElementById('deckDetailsBackBtn');
  if (detailsBackBtn) detailsBackBtn.addEventListener('click', switchBackToCSVStep);

  // Color selection step
  document.querySelectorAll('input[name="selectedColor"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      if (!radio.checked) return;
      selectedDeckColor = safeColor(radio.value);
      updateColorPreview(selectedDeckColor);
    });
  });

  const colorBackBtn = document.getElementById('colorBackBtn');
  if (colorBackBtn) {
    colorBackBtn.addEventListener('click', () => {
      showCreationStep(colorStepOrigin === 'manualAddStep' ? 'manualAddStep' : 'deckDetailsStep');
    });
  }

  const colorCreateBtn = document.getElementById('colorCreateBtn');
  if (colorCreateBtn) colorCreateBtn.addEventListener('click', createPendingCollection);

  setupCategoryPills('deckCategoryGroup', 'deckCategory');
  setupCategoryPills('newDeckCollectionGroup', 'newDeckCollection');

  // Modal close
  document.querySelectorAll('.modal-close').forEach((btn) => {
    btn.addEventListener('click', closeModals);
  });

  document.querySelectorAll('.modal').forEach((modal) => {
    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeModals();
    });
  });
}

function setupAndroidBackButton() {
  if (!nativeAppPlugin || typeof nativeAppPlugin.addListener !== 'function') return;
  nativeAppPlugin.addListener('backButton', handleAndroidBackButton);
}

function isModalOpen(id) {
  const modal = document.getElementById(id);
  return Boolean(modal && !modal.classList.contains('hidden'));
}

// Android Back: close the top-most transient UI first, never leave a promise
// hanging, then walk back from play, and only exit from the home screen.
function handleAndroidBackButton() {
  if (isModalOpen('alertModal')) {
    document.getElementById('alertOkBtn')?.click();
    return;
  }
  if (isModalOpen('confirmModal')) {
    document.getElementById('confirmCancelBtn')?.click();
    return;
  }

  const completion = document.getElementById('completionOverlay');
  if (completion && completion.classList.contains('is-visible')) {
    hideCompletion();
    return;
  }

  const openModals = document.querySelectorAll('.modal:not(.hidden)');
  if (openModals.length > 0) {
    closeModals();
    return;
  }

  const playScreen = document.getElementById('playScreen');
  if (playScreen && playScreen.classList.contains('active')) {
    goBack();
    return;
  }

  if (nativeAppPlugin && typeof nativeAppPlugin.exitApp === 'function') {
    nativeAppPlugin.exitApp().catch(() => {});
  }
}

function switchTab(tab) {
  const nextTab = tab === 'collections' ? 'collections' : 'decks';
  currentTab = nextTab;

  // Update tab buttons
  document.querySelectorAll('.tab-navigation .tab-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.tab === nextTab);
  });

  // Update tab content
  document.querySelectorAll('.tab-content').forEach((content) => {
    content.classList.remove('active');
  });

  if (nextTab === 'decks') {
    document.getElementById('decksTab').classList.add('active');
    renderDecksList();
  } else {
    document.getElementById('collectionsTab').classList.add('active');
    renderCollectionsTab();
  }
}


// Reusable confirmation modal
let confirmModalResolve = null;

function showConfirmModal({ title, description, warning, confirmText, cancelText, icon, isDanger }) {
  return new Promise((resolve) => {
    const modal = document.getElementById('confirmModal');
    const titleEl = document.getElementById('confirmTitle');
    const descEl = document.getElementById('confirmDescription');
    const warnEl = document.getElementById('confirmWarning');
    const cancelBtn = document.getElementById('confirmCancelBtn');
    const deleteBtn = document.getElementById('confirmDeleteBtn');
    const iconEl = document.getElementById('confirmIcon');

    if (titleEl) titleEl.textContent = title || 'Confirm';
    if (descEl) descEl.textContent = description || '';
    if (warnEl) warnEl.textContent = warning || '';
    if (cancelBtn) cancelBtn.textContent = cancelText || 'Cancel';
    if (deleteBtn) {
      deleteBtn.textContent = confirmText || 'Confirm';
      deleteBtn.disabled = false;
    }

    // Set icon
    if (iconEl) {
      if (isDanger) {
        iconEl.innerHTML = '<span class="icon-wrapper" data-icon="trash"></span>';
        iconEl.style.background = 'rgba(184, 87, 122, 0.12)';
        iconEl.style.color = 'var(--accent-rose)';
      } else {
        iconEl.innerHTML = '<span class="icon-wrapper" data-icon="info"></span>';
        iconEl.style.background = 'rgba(25, 61, 58, 0.1)';
        iconEl.style.color = 'var(--primary-dark)';
      }
    }

    // Show modal
    if (modal) modal.classList.remove('hidden');

    // Render icons
    renderAllIcons();

    // Handle cancel
    const handleCancel = () => {
      if (modal) modal.classList.add('hidden');
      cleanup();
      resolve(false);
    };

    // Handle confirm
    const handleConfirm = () => {
      if (deleteBtn) deleteBtn.disabled = true;
      if (modal) modal.classList.add('hidden');
      cleanup();
      resolve(true);
    };

    // Handle backdrop click
    const handleBackdrop = (e) => {
      if (e.target === modal) {
        handleCancel();
      }
    };

    // Handle escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleCancel();
      }
    };

    // Cleanup
    function cleanup() {
      if (cancelBtn) cancelBtn.removeEventListener('click', handleCancel);
      if (deleteBtn) deleteBtn.removeEventListener('click', handleConfirm);
      if (modal) modal.removeEventListener('click', handleBackdrop);
      document.removeEventListener('keydown', handleEscape);
    }

    // Attach listeners
    if (cancelBtn) cancelBtn.addEventListener('click', handleCancel);
    if (deleteBtn) deleteBtn.addEventListener('click', handleConfirm);
    if (modal) modal.addEventListener('click', handleBackdrop);
    document.addEventListener('keydown', handleEscape);

    // Focus the cancel button for accessibility
    if (cancelBtn) cancelBtn.focus();
  });
}

// Toast notification system
function showToast(message, type = 'info', duration = 3000, action = null) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  const iconEl = document.createElement('span');
  iconEl.className = 'toast-icon';
  iconEl.textContent = icons[type] || 'ℹ';

  const messageEl = document.createElement('span');
  messageEl.className = 'toast-message';
  messageEl.textContent = String(message ?? '');

  toast.appendChild(iconEl);
  toast.appendChild(messageEl);

  if (action && typeof action.onClick === 'function') {
    const actionBtn = document.createElement('button');
    actionBtn.type = 'button';
    actionBtn.className = 'toast-action';
    actionBtn.textContent = action.label || 'Undo';
    actionBtn.addEventListener('click', () => {
      actionBtn.disabled = true;
      if (toast.parentNode) toast.parentNode.removeChild(toast);
      action.onClick();
    });
    toast.appendChild(actionBtn);
  }

  container.appendChild(toast);

  // Auto-remove after duration
  setTimeout(() => {
    toast.classList.add('toast-exit');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, duration);
}

// Alert modal system
function showAlertModal({ title, message, type = 'info' }) {
  return new Promise((resolve) => {
    const modal = document.getElementById('alertModal');
    const titleEl = document.getElementById('alertTitle');
    const msgEl = document.getElementById('alertMessage');
    const okBtn = document.getElementById('alertOkBtn');
    const iconEl = document.getElementById('alertIcon');

    if (titleEl) titleEl.textContent = title || 'Notice';
    if (msgEl) msgEl.textContent = message || '';

    // Set icon based on type
    if (iconEl) {
      const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
      };
      iconEl.textContent = icons[type] || 'ℹ';
      iconEl.style.background = type === 'error' ? 'rgba(184, 87, 122, 0.12)' :
        type === 'success' ? 'rgba(45, 106, 79, 0.12)' :
        type === 'warning' ? 'rgba(183, 121, 31, 0.12)' :
        'rgba(25, 61, 58, 0.1)';
      iconEl.style.color = type === 'error' ? 'var(--accent-rose)' :
        type === 'success' ? '#2d6a4f' :
        type === 'warning' ? '#b7791f' :
        'var(--primary-dark)';
    }

    if (modal) modal.classList.remove('hidden');

    const handleOk = () => {
      if (modal) modal.classList.add('hidden');
      cleanup();
      resolve();
    };

    const handleBackdrop = (e) => {
      if (e.target === modal) handleOk();
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') handleOk();
    };

    function cleanup() {
      if (okBtn) okBtn.removeEventListener('click', handleOk);
      if (modal) modal.removeEventListener('click', handleBackdrop);
      document.removeEventListener('keydown', handleEscape);
    }

    if (okBtn) okBtn.addEventListener('click', handleOk);
    if (modal) modal.addEventListener('click', handleBackdrop);
    document.addEventListener('keydown', handleEscape);

    if (okBtn) okBtn.focus();
  });
}

/* ============================================================================
   BACKUP, RESTORE, CSV EXPORT AND RESET
   ============================================================================ */

function isNativePlatform() {
  return Boolean(
    window.Capacitor
    && typeof window.Capacitor.isNativePlatform === 'function'
    && window.Capacitor.isNativePlatform(),
  );
}

// Native builds share the file through Android's share sheet. Browsers get a
// normal download. Both paths use the same generated text.
async function saveTextFile(filename, text, mimeType, title) {
  if (isNativePlatform()) {
    try {
      const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');
      const { Share } = await import('@capacitor/share');

      const file = await Filesystem.writeFile({
        path: filename,
        data: text,
        directory: Directory.Cache,
        encoding: Encoding.UTF8,
        recursive: true,
      });

      let canShare = true;
      try {
        const availability = await Share.canShare();
        canShare = Boolean(availability && availability.value);
      } catch {
        canShare = false;
      }

      if (!canShare) {
        await showAlertModal({
          title: 'File Ready',
          message: `Saved ${filename} in the app cache, but this device cannot open a share sheet.`,
          type: 'info',
        });
        return false;
      }

      await Share.share({
        title,
        text: title,
        files: [file.uri],
        dialogTitle: title,
      });
      return true;
    } catch (error) {
      const message = String(error && error.message ? error.message : error);
      // Closing the share sheet is not a failure.
      if (/cancel/i.test(message)) return false;
      console.error('Could not export file:', error);
      showAlertModal({
        title: 'Export Failed',
        message: 'AnoNga could not create the file. Please try again.',
        type: 'error',
      });
      return false;
    }
  }

  try {
    const blob = new Blob([text], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 4000);
    showToast(`Saved ${filename}.`, 'success');
    return true;
  } catch (error) {
    console.error('Could not download file:', error);
    showAlertModal({
      title: 'Export Failed',
      message: 'The browser could not save the file. Please try again.',
      type: 'error',
    });
    return false;
  }
}

function collectBackupData() {
  return buildBackup({
    language: getLanguage() || 'en',
    favorites: getFavorites(),
    customDecks: readJsonArray(CUSTOM_DECKS_KEY),
    importedDecks: readJsonArray(IMPORTED_DECKS_KEY),
    handmadeQuestions: readJsonArray(HANDMADE_KEY),
    deckOverrides: readJson(DECK_OVERRIDES_KEY, {}),
    deckThemes: readJson(DECK_THEMES_KEY, {}),
    appVersion: APP_VERSION,
  });
}

async function ensurePublicStoragePermission(Filesystem) {
  try {
    const status = await Filesystem.checkPermissions();
    if (status && status.publicStorage && status.publicStorage !== 'granted') {
      await Filesystem.requestPermissions();
    }
  } catch {
    // Newer Android versions do not expose this permission at all.
  }
}

// Android 11+ blocks direct file access to Documents without "All files
// access". The native plugin reports and requests it.
async function hasStorageAccess() {
  if (!isNativePlatform()) return true;
  try {
    const result = await StorageAccess.isGranted();
    return Boolean(result && result.granted);
  } catch {
    return true;
  }
}

async function requestStorageAccess() {
  if (!isNativePlatform()) return;
  try {
    await StorageAccess.request();
  } catch (error) {
    console.warn('Could not open file access settings:', error);
  }
}

// True when this install already has user data, so a stale shared backup must
// never overwrite it.
function hasLocalUserData() {
  return (
    readJsonArray(CUSTOM_DECKS_KEY).length > 0
    || readJsonArray(IMPORTED_DECKS_KEY).length > 0
    || readJsonArray(HANDMADE_KEY).length > 0
    || readJsonArray(FAVORITES_KEY).length > 0
  );
}

async function writeAutoBackupText(text) {
  if (!isNativePlatform()) return false;

  if (!(await hasStorageAccess())) {
    autoBackupBlockedByAccess = true;
    return false;
  }

  try {
    const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');
    await ensurePublicStoragePermission(Filesystem);
    await Filesystem.writeFile({
      path: AUTO_BACKUP_PATH,
      data: text,
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
      recursive: true,
    });
    autoBackupBlockedByAccess = false;
    return true;
  } catch (error) {
    autoBackupBlockedByAccess = true;
    console.warn('Automatic backup failed:', error);
    return false;
  }
}

async function saveAutoBackup() {
  if (!isNativePlatform() || autoBackupSuppressed || autoBackupInFlight) return false;

  autoBackupInFlight = true;
  try {
    const ok = await writeAutoBackupText(JSON.stringify(collectBackupData(), null, 2));
    if (ok) localStorage.setItem(AUTO_RESTORE_MARKER, '1');
    return ok;
  } finally {
    autoBackupInFlight = false;
  }
}

function scheduleAutoBackup() {
  if (!isNativePlatform() || autoBackupSuppressed) return;
  if (autoBackupTimer) clearTimeout(autoBackupTimer);
  autoBackupTimer = window.setTimeout(() => {
    autoBackupTimer = null;
    saveAutoBackup();
  }, 700);
}

async function flushAutoBackup() {
  if (autoBackupTimer) {
    clearTimeout(autoBackupTimer);
    autoBackupTimer = null;
  }
  await saveAutoBackup();
}

// A fresh install has no restore marker. If a shared-storage backup exists,
// apply it before the app loads any decks.
async function restoreAutoBackupIfNeeded() {
  if (!isNativePlatform() || localStorage.getItem(AUTO_RESTORE_MARKER)) return;

  // Never let an old shared backup replace data this install already has.
  if (hasLocalUserData()) {
    localStorage.setItem(AUTO_RESTORE_MARKER, '1');
    return;
  }

  if (!(await hasStorageAccess())) {
    autoRestorePendingAccess = true;
    autoBackupBlockedByAccess = true;
    return;
  }

  try {
    const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');
    await ensurePublicStoragePermission(Filesystem);
    let contents;
    try {
      contents = await Filesystem.readFile({
        path: AUTO_BACKUP_PATH,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      });
    } catch (error) {
      const message = String(error && error.message ? error.message : error);
      const code = String(error && error.code ? error.code : '');
      if (/not found|no such file|does not exist|ENOENT|NOT_FOUND/i.test(`${code} ${message}`)) {
        localStorage.setItem(AUTO_RESTORE_MARKER, '1');
        return;
      }
      // Do not overwrite a backup we could not read.
      autoBackupSuppressed = true;
      console.warn('Automatic restore could not read the backup:', error);
      return;
    }

    const result = parseBackup(String(contents.data || ''));
    if (!result.ok) {
      console.warn('Automatic restore skipped:', result.error);
      localStorage.setItem(AUTO_RESTORE_MARKER, '1');
      return;
    }

    if (applyBackup(result.backup)) {
      localStorage.setItem(AUTO_RESTORE_MARKER, '1');
      autoRestoreNotice = result.summary;
    }
  } catch (error) {
    autoBackupSuppressed = true;
    console.warn('Automatic restore failed:', error);
  }
}

function showAutoRestoreNotice() {
  if (!autoRestoreNotice) return;
  const summary = autoRestoreNotice;
  autoRestoreNotice = null;
  showToast(
    `Restored automatic backup: ${summary.customDecks} collections, ${summary.totalQuestions} questions.`,
    'success',
  );
}

// Android 11+ needs "All files access" before the app can read or write the
// automatic backup in Documents. Ask once per session, with a way to fix it.
async function maybePromptStorageAccess() {
  if (!isNativePlatform() || storageAccessPrompted) return;
  if (await hasStorageAccess()) return;

  storageAccessPrompted = true;
  autoBackupBlockedByAccess = true;
  const confirmed = await showConfirmModal({
    title: 'Allow file access?',
    description: 'AnoNga keeps its automatic backup in Documents/AnoNga. Android needs "All files access" for that folder, and to restore the backup after a reinstall.',
    warning: 'Without it, automatic backup and automatic restore stay off. Back Up Data and Restore Backup still work.',
    confirmText: 'Open settings',
    cancelText: 'Not now',
    isDanger: false,
  });

  if (confirmed) await requestStorageAccess();
}

async function setupAutoBackupListeners() {
  window.addEventListener('anonga:data-changed', scheduleAutoBackup);

  if (!isNativePlatform()) return;

  window.addEventListener('pagehide', flushAutoBackup);
  try {
    await CapacitorApp.addListener('appStateChange', async ({ isActive }) => {
      if (!isActive) {
        flushAutoBackup();
        return;
      }

      if (!(await hasStorageAccess())) return;

      // Returning from the settings screen with access granted: restore a
      // pending backup from scratch, or catch up on the automatic backup.
      if (autoRestorePendingAccess) {
        window.location.reload();
        return;
      }
      if (autoBackupBlockedByAccess) {
        autoBackupBlockedByAccess = false;
        scheduleAutoBackup();
      }
    });
  } catch (error) {
    console.warn('Could not attach automatic backup listener:', error);
  }
}

async function handleBackupData() {
  try {
    const backup = collectBackupData();
    const json = JSON.stringify(backup, null, 2);
    await saveTextFile(backupFilename(), json, 'application/json', 'AnoNga backup');
  } catch (error) {
    console.error('Backup failed:', error);
    showAlertModal({
      title: 'Backup Failed',
      message: 'AnoNga could not prepare the backup. Please try again.',
      type: 'error',
    });
  }
}

function applyBackup(backup) {
  const data = backup.data;
  const values = {
    [LANGUAGE_KEY]: data.language === 'tl' ? 'tl' : 'en',
    [FAVORITES_KEY]: JSON.stringify(data.favorites),
    [LEGACY_CUSTOM_QUESTIONS_KEY]: '[]',
    [CUSTOM_DECKS_KEY]: JSON.stringify(data.customDecks),
    [IMPORTED_DECKS_KEY]: JSON.stringify(data.importedDecks),
    [HANDMADE_KEY]: JSON.stringify(data.handmadeQuestions),
    [DECK_OVERRIDES_KEY]: JSON.stringify(data.deckOverrides),
    [DECK_THEMES_KEY]: JSON.stringify(data.deckThemes),
  };

  // Keep a snapshot so a mid-write failure cannot leave half a backup applied.
  const previous = {};
  Object.keys(values).forEach((key) => {
    previous[key] = localStorage.getItem(key);
  });

  try {
    Object.keys(values).forEach((key) => {
      localStorage.setItem(key, values[key]);
    });
    return true;
  } catch (error) {
    console.error('Restore write failed:', error);
    Object.keys(previous).forEach((key) => {
      try {
        if (previous[key] === null) localStorage.removeItem(key);
        else localStorage.setItem(key, previous[key]);
      } catch {
        // Best-effort rollback.
      }
    });
    notifySaveFailure();
    return false;
  }
}

function handleRestoreFile(event) {
  const input = event.target;
  const file = input.files && input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async () => {
    const result = parseBackup(String(reader.result || ''));
    if (!result.ok) {
      showAlertModal({
        title: 'Could Not Restore',
        message: result.error,
        type: 'error',
      });
      input.value = '';
      return;
    }

    const summary = result.summary;
    const exportedAt = result.backup.exportedAt
      ? new Date(result.backup.exportedAt).toLocaleString()
      : 'an unknown date';

    const confirmed = await showConfirmModal({
      title: 'Restore this backup?',
      description: `Backup from ${exportedAt}. ${summary.customDecks} custom collections, ${summary.importedDecks} imported collections, ${summary.handmadeQuestions} handmade questions, ${summary.favorites} favorites.`,
      warning: 'This replaces every collection, favorite, theme, and added question on this device. Your current data will be overwritten.',
      confirmText: 'Restore backup',
      cancelText: 'Cancel',
      isDanger: true,
    });

    input.value = '';

    if (!confirmed) return;
    if (applyBackup(result.backup)) {
      // The device now has this data; never let an older shared backup replace it.
      localStorage.setItem(AUTO_RESTORE_MARKER, '1');
      window.location.reload();
    }
  };
  reader.onerror = () => {
    showAlertModal({
      title: 'Could Not Read File',
      message: 'AnoNga could not read that file. Please try another backup.',
      type: 'error',
    });
    input.value = '';
  };
  reader.readAsText(file);
}

function openResetDataModal() {
  const modal = document.getElementById('resetDataModal');
  const input = document.getElementById('resetConfirmInput');
  const confirmBtn = document.getElementById('resetConfirmBtn');
  if (!modal || !input || !confirmBtn) return;

  input.value = '';
  confirmBtn.disabled = true;
  modal.classList.remove('hidden');
  window.setTimeout(() => input.focus(), 50);
}

function updateResetConfirmState() {
  const input = document.getElementById('resetConfirmInput');
  const confirmBtn = document.getElementById('resetConfirmBtn');
  if (!input || !confirmBtn) return;
  confirmBtn.disabled = input.value.trim().toUpperCase() !== 'DELETE';
}

function buildEmptyBackup() {
  return buildBackup({
    language: getLanguage() || 'en',
    favorites: [],
    customDecks: [],
    importedDecks: [],
    handmadeQuestions: [],
    deckOverrides: {},
    deckThemes: {},
    appVersion: APP_VERSION,
  });
}

async function resetAllData() {
  const input = document.getElementById('resetConfirmInput');
  if (!input || input.value.trim().toUpperCase() !== 'DELETE') return;

  // Clear the shared-storage backup first. If that write fails, stop: otherwise
  // the next launch would restore the data the user just deleted.
  if (isNativePlatform()) {
    const ok = await writeAutoBackupText(JSON.stringify(buildEmptyBackup(), null, 2));
    if (!ok) {
      showAlertModal({
        title: 'Reset Failed',
        message: 'AnoNga could not update the automatic backup, so reset was stopped to protect your data.',
        type: 'error',
      });
      return;
    }
  }

  try {
    const keys = [];
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (key && key.startsWith('anonga_')) keys.push(key);
    }
    keys.forEach((key) => localStorage.removeItem(key));
    // The shared backup is already empty; skip the automatic restore on reload.
    localStorage.setItem(AUTO_RESTORE_MARKER, '1');
    window.location.reload();
  } catch (error) {
    console.error('Reset failed:', error);
    showAlertModal({
      title: 'Reset Failed',
      message: 'AnoNga could not clear device storage. Please try again.',
      type: 'error',
    });
  }
}

async function exportDeckCsv(deck) {
  if (!deck || !Array.isArray(deck.questions) || deck.questions.length === 0) {
    showAlertModal({
      title: 'Nothing to Export',
      message: 'This collection has no questions yet.',
      type: 'warning',
    });
    return;
  }

  await saveTextFile(
    csvFilename(deck.name),
    questionsToCsv(deck.questions),
    'text/csv',
    `${deck.name} CSV`,
  );
}

function wireDeckCsvButton(deck) {
  const btn = document.getElementById('exportDeckCsvBtn');
  if (!btn) return;

  const count = deck && Array.isArray(deck.questions) ? deck.questions.length : 0;
  btn.disabled = count === 0;
  btn.onclick = () => exportDeckCsv(deck);
}

function wireDeckImportButton(deck) {
  const btn = document.getElementById('importDeckCsvBtn');
  const input = document.getElementById('deckCsvFileInput');
  if (!btn || !input || !deck) return;

  btn.onclick = () => {
    input.value = '';
    input.dataset.deckId = deck.id;
    input.click();
  };

  input.onchange = () => {
    const file = input.files && input.files[0];
    if (!file) return;
    const target = allDecks.find((item) => item.id === input.dataset.deckId) || deck;
    handleDeckCsvImport(target, file);
    input.value = '';
  };
}

// Append CSV questions to a deck the user already has. Rows that exactly match
// a question in that deck (normalized EN + TL) are skipped, and so are rows
// missing either side. Duplicates across different decks stay allowed.
async function handleDeckCsvImport(deck, file) {
  if (!deck || !file) return;

  let text = '';
  try {
    text = await file.text();
  } catch (error) {
    showAlertModal({ title: 'Could Not Read File', message: 'AnoNga could not read that CSV file. Try again.', type: 'error' });
    return;
  }

  let rows = [];
  try {
    rows = parseCsv(text);
  } catch (error) {
    showAlertModal({ title: 'Parse Error', message: 'Error parsing CSV: ' + error.message, type: 'error' });
    return;
  }

  if (rows.length < 2) {
    showAlertModal({ title: 'Invalid CSV', message: 'CSV file must have a header row and at least one question.', type: 'error' });
    return;
  }

  const parsed = csvRowsToQuestions(rows);
  if (parsed.length === 0) {
    showAlertModal({ title: 'No Questions Found', message: 'No valid questions found in this CSV file.', type: 'warning' });
    return;
  }

  ensureQuestionIdsForDeck(deck);
  const existing = Array.isArray(deck.questions) ? deck.questions : [];
  const seen = new Set(
    existing.map((question) => (
      `${(question && question.en || '').trim().toLowerCase()}|${(question && question.tl || '').trim().toLowerCase()}`
    )),
  );

  const additions = [];
  let skipped = 0;
  parsed.forEach((question) => {
    const en = String(question.en || '').trim();
    const tl = String(question.tl || '').trim();
    if (!en || !tl) {
      skipped += 1;
      return;
    }
    const key = `${en.toLowerCase()}|${tl.toLowerCase()}`;
    if (seen.has(key)) {
      skipped += 1;
      return;
    }
    seen.add(key);
    additions.push({ ...question, en, tl });
  });

  if (additions.length === 0) {
    showAlertModal({
      title: 'No New Questions',
      message: `Every row in this file already exists in "${deck.name}" or is incomplete.`,
      type: 'info',
    });
    return;
  }

  const confirmed = await showConfirmModal({
    title: 'Import questions?',
    description: `Add ${additions.length} ${additions.length === 1 ? 'question' : 'questions'} to "${deck.name}".`,
    warning: skipped > 0
      ? `${skipped} ${skipped === 1 ? 'row' : 'rows'} will be skipped because ${skipped === 1 ? 'it duplicates an existing question or is incomplete' : 'they duplicate an existing question or are incomplete'}.`
      : '',
    confirmText: 'Import',
    cancelText: 'Cancel',
    isDanger: false,
  });
  if (!confirmed) return;

  const stamp = Date.now();
  const newQuestions = additions.map((question, index) => ({
    ...question,
    id: `${deck.id}_q${stamp}_${index}`,
  }));

  const previousQuestions = deck.questions;
  const previousCount = deck.count;
  deck.questions = existing.concat(newQuestions);
  deck.count = deck.questions.length;

  if (!saveDeckQuestions(deck)) {
    deck.questions = previousQuestions;
    deck.count = previousCount;
    notifySaveFailure();
    return;
  }

  refreshDeckCounts();
  renderCollectionsTab();
  renderDecksList();

  if (currentDeck && currentDeck.id === deck.id) {
    renderQuestionsPreview();
    refreshCurrentDeckSession(deck);
  }

  const countEl = document.getElementById('infoDeckCount');
  if (countEl) {
    countEl.textContent = `${questionCountLabel(deck.count || 0)} in this deck`;
  }

  showToast(
    `Imported ${newQuestions.length} ${newQuestions.length === 1 ? 'question' : 'questions'}${skipped > 0 ? `, skipped ${skipped}` : ''}.`,
    'success',
  );
}

// Override native alert and confirm with custom implementations
// (Keeps backward compat for any remaining calls)
const _nativeAlert = window.alert;
const _nativeConfirm = window.confirm;

window.alert = function(message) {
  // For simple messages, use toast
  showToast(String(message), 'info', 4000);
};

window.confirm = function(message) {
  // This is a sync fallback - shouldn't be used in new code
  console.warn('Native confirm() called - should use showConfirmModal() instead');
  return _nativeConfirm(message);
};

window.deleteDeck = deleteDeck;

async function deleteDeck(deckId) {
  const deck = allDecks.find((item) => item.id === deckId);
  if (!deck) return;

  if (deck.isDefault) {
    showAlertModal({ title: 'Cannot Delete', message: 'Default decks cannot be deleted.', type: 'warning' });
    return;
  }

  const confirmed = await showConfirmModal({
    title: 'Delete this collection?',
    description: `You're about to delete "${deck.name}".`,
    warning: 'The collection and its questions will be removed. You can undo this for a few seconds.',
    confirmText: 'Delete collection',
    cancelText: 'Cancel',
    isDanger: true,
  });

  if (!confirmed) return;

  const deletedIndex = allDecks.findIndex((item) => item.id === deckId);
  const wasImported = Boolean(deck.isImported || String(deck.id).startsWith('imported_'));

  try {
    const nextDecks = allDecks.filter((item) => item.id !== deckId);

    // Write storage before mutating the UI so a failed write cannot look like
    // a successful deletion.
    const okCustom = writeJson(CUSTOM_DECKS_KEY, customDecksFrom(nextDecks));
    const okImported = writeJson(
      IMPORTED_DECKS_KEY,
      readJsonArray(IMPORTED_DECKS_KEY).filter((item) => item && item.id !== deckId),
    );

    const themeMap = readJson(DECK_THEMES_KEY, {});
    const deletedTheme = themeMap && typeof themeMap === 'object' && !Array.isArray(themeMap)
      ? themeMap[deckId]
      : undefined;
    if (themeMap && typeof themeMap === 'object' && !Array.isArray(themeMap)) {
      delete themeMap[deckId];
    }
    const okThemes = writeJson(DECK_THEMES_KEY, themeMap && typeof themeMap === 'object' ? themeMap : {});

    const overrides = readJson(DECK_OVERRIDES_KEY, {});
    const deletedOverride = overrides && typeof overrides === 'object' && !Array.isArray(overrides)
      ? overrides[deckId]
      : undefined;
    if (overrides && typeof overrides === 'object' && !Array.isArray(overrides)) {
      delete overrides[deckId];
    }
    const okOverrides = writeJson(DECK_OVERRIDES_KEY, overrides && typeof overrides === 'object' ? overrides : {});

    let okHandmade = true;
    if (deck.isHandmade || deck.id === 'handmade') {
      okHandmade = writeJson(HANDMADE_KEY, []);
    }

    if (!okCustom || !okImported || !okThemes || !okOverrides || !okHandmade) {
      notifySaveFailure();
      return;
    }

    allDecks = nextDecks;

    if (currentDeck && currentDeck.id === deckId) {
      currentDeck = null;
      goBack();
    }

    closeModals();
    renderCollectionsTab();
    renderDecksList();
    clearSessionProgress(deckId);
    showToast(`Deleted "${deck.name}".`, 'success', 6000, {
      label: 'Undo',
      onClick: () => restoreDeletedDeck({
        deck,
        index: deletedIndex,
        theme: deletedTheme,
        override: deletedOverride,
        wasImported,
      }),
    });
  } catch (error) {
    console.error('Delete failed:', error);
    showAlertModal({ title: 'Delete Failed', message: 'Failed to delete the collection. Please try again.', type: 'error' });
  }
}

function restoreDeletedDeck(snapshot) {
  if (!snapshot || !snapshot.deck) return;
  const { deck, index, theme, override, wasImported } = snapshot;
  if (allDecks.some((item) => item.id === deck.id)) return;

  // A new deck may have taken the same name during the undo window.
  if (findDeckByName(deck.name, deck.id)) {
    showToast(`Cannot restore "${deck.name}": that name is now in use.`, 'error');
    return;
  }

  const insertAt = Math.max(0, Math.min(Number(index) || 0, allDecks.length));
  allDecks.splice(insertAt, 0, deck);

  const deckListOk = wasImported
    ? writeJson(
        IMPORTED_DECKS_KEY,
        allDecks.filter((item) => item && (item.isImported || String(item.id).startsWith('imported_'))),
      )
    : writeJson(CUSTOM_DECKS_KEY, customDecksFrom(allDecks));

  let themeOk = true;
  if (theme !== undefined) {
    const themeMap = readJson(DECK_THEMES_KEY, {});
    if (themeMap && typeof themeMap === 'object' && !Array.isArray(themeMap)) {
      themeMap[deck.id] = theme;
      themeOk = writeJson(DECK_THEMES_KEY, themeMap);
    }
  }

  let overrideOk = true;
  if (override !== undefined) {
    const overrides = readJson(DECK_OVERRIDES_KEY, {});
    if (overrides && typeof overrides === 'object' && !Array.isArray(overrides)) {
      overrides[deck.id] = override;
      overrideOk = writeJson(DECK_OVERRIDES_KEY, overrides);
    }
  }

  if (!deckListOk || !themeOk || !overrideOk) {
    allDecks = allDecks.filter((item) => item.id !== deck.id);
    notifySaveFailure();
    return;
  }

  refreshDeckCounts();
  renderCollectionsTab();
  renderDecksList();
  showToast(`Restored "${deck.name}".`, 'success');
}

function renderCollectionsTab() {
  const customDecksList = document.getElementById('customDecksList');
  if (!customDecksList) return;

  const customDecks = allDecks.filter((deck) => !deck.isDefault && !deck.isHandmade);

  const html = customDecks.map((deck) => {
    const count = Number.isFinite(deck.count) ? deck.count : (Array.isArray(deck.questions) ? deck.questions.length : 0);
    return `
    <div class="collection-card" data-deck-id="${escapeHtml(deck.id)}" role="button" tabindex="0" aria-label="Open ${escapeHtml(deck.name)}, ${questionCountLabel(count)}">
      <div class="card-icon icon-wrapper" data-icon="pencil"></div>
      <div class="card-text">
        <div class="card-title">${escapeHtml(deck.name)}</div>
        <div class="card-subtitle">${questionCountLabel(count)}</div>
      </div>
      <button class="collection-delete-btn" data-delete-id="${escapeHtml(deck.id)}" type="button" aria-label="Delete ${escapeHtml(deck.name)}"><span class="icon-wrapper" data-icon="trash"></span></button>
    </div>
  `;
  }).join('');

  customDecksList.innerHTML = html || '<p style="grid-column: 1/-1; text-align: center; color: #999; padding: 40px;">No custom collections yet. Create one to get started!</p>';
  renderAllIcons();

  customDecksList.querySelectorAll('.collection-delete-btn').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      event.stopPropagation();
      event.preventDefault();
      const id = btn.dataset.deleteId;
      if (id) deleteDeck(id);
    });
  });

  customDecksList.querySelectorAll('.collection-card').forEach((card) => {
    const openCard = () => {
      const id = card.dataset.deckId;
      if (id) window.viewDeckDetails(id);
    };

    card.addEventListener('click', (event) => {
      if (event.target.closest('.collection-delete-btn')) return;
      // The pencil icon is an edit affordance; tapping it should not make the
      // user hunt for a second "Edit Details" button inside the info modal.
      if (event.target.closest('.card-icon')) {
        const id = card.dataset.deckId;
        if (id) openEditCollectionModal(id);
        return;
      }
      openCard();
    });

    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openCard();
      }
    });
  });
}


function toggleLanguageHome() {
  currentLanguage = currentLanguage === 'en' ? 'tl' : 'en';
  setLanguage(currentLanguage);
  updateLanguageButtons();
}

function updateLanguageButtons() {
  const homeBtn = document.getElementById('langToggleHome');
  const playBtn = document.getElementById('langTogglePlay');
  const text = currentLanguage === 'en' ? 'EN / TL' : 'TL / EN';

  if (homeBtn) homeBtn.textContent = text;
  if (playBtn) playBtn.textContent = text;
}

function renderHomeScreen() {
  renderDecksList();
  applySearch();
}

function renderDecksList() {
  const list = document.getElementById('decksList');
  if (!list) {
    console.error('decksList element not found');
    return;
  }

  // The ephemeral Handmade deck belongs only to its dedicated card.
  let visibleDecks = allDecks.filter((deck) => !deck.isHandmade && deck.id !== 'handmade');
  if (currentCollection !== 'all') {
    visibleDecks = visibleDecks.filter((deck) => deck.collection === currentCollection);
  }

  const html = visibleDecks.map((deck, idx) => {
    const theme = getTheme(getDeckTheme(deck));
    const count = Array.isArray(deck.questions) ? deck.questions.length : (deck.count || 0);
    const custom = !deck.isDefault;
    // User-created decks show the color they picked. Inline `background` wins
    // over the themed stylesheet gradient, which used to hide the choice.
    const color = safeColor(deck.color);
    const style = custom
      ? `background: linear-gradient(150deg, ${color}, ${darkenColor(color, 18)});`
      : '';
    return `
    <div class="deck-card" data-theme="${theme.id}" data-deck-id="${escapeHtml(deck.id)}" role="button" tabindex="0" aria-label="Open ${escapeHtml(deck.name)}" style="${style}">
      <div class="deck-header">
        <div class="deck-number">KUMUSTAHAN ${String(idx + 1).padStart(2, '0')}</div>
        <div class="deck-count-badge">${questionCountLabel(count)}</div>
      </div>
      <div class="deck-title-main">${escapeHtml(deck.name)}</div>
      <div class="deck-description">${escapeHtml(deck.description)}</div>
      <div class="deck-theme-tag">${escapeHtml(theme.label)}</div>
    </div>
  `;
  }).join('');

  list.innerHTML = html;

  list.querySelectorAll('.deck-card').forEach((card) => {
    const open = () => {
      const deck = allDecks.find((item) => item.id === card.dataset.deckId);
      if (deck) startDeckSession(deck);
    };
    card.addEventListener('click', open);
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        open();
      }
    });
  });
}

// ---------------------------------------------------------------------------
// SEARCH DECKS AND QUESTIONS
// ---------------------------------------------------------------------------

function normalizeSearchQuery(value) {
  return String(value || '').trim().toLowerCase();
}

function getSearchableDecks() {
  let handmadeDeck = allDecks.find((deck) => deck.id === 'handmade');
  const handmadeQuestions = readJsonArray(HANDMADE_KEY);
  if (!handmadeDeck && handmadeQuestions.length > 0) {
    handmadeDeck = {
      id: 'handmade',
      name: 'Handmade',
      description: 'Questions you wrote',
      collection: 'handmade',
      questions: [],
      count: 0,
      color: DEFAULT_DECK_COLOR,
      isHandmade: true,
    };
    allDecks.push(handmadeDeck);
  }
  if (handmadeDeck) {
    handmadeDeck.questions = handmadeQuestions;
    ensureQuestionIdsForDeck(handmadeDeck);
    handmadeDeck.count = handmadeDeck.questions.length;
  }
  return allDecks;
}

function applySearch() {
  const input = document.getElementById('searchInput');
  const results = document.getElementById('searchResults');
  const clearBtn = document.getElementById('clearSearchBtn');
  const collectionTabs = document.querySelector('.collection-tabs');
  const decksContainer = document.querySelector('.decks-container');
  if (!input || !results || !collectionTabs || !decksContainer) return;

  const query = normalizeSearchQuery(input.value);
  if (clearBtn) clearBtn.classList.toggle('hidden', !query);

  if (!query) {
    results.classList.add('hidden');
    results.innerHTML = '';
    collectionTabs.classList.remove('hidden');
    decksContainer.classList.remove('hidden');
    return;
  }

  collectionTabs.classList.add('hidden');
  decksContainer.classList.add('hidden');
  results.classList.remove('hidden');
  results.innerHTML = renderSearchResults(query);
  wireSearchResults();
}

function renderSearchResults(query) {
  const deckMatches = [];
  const questionMatches = [];
  const MAX_QUESTION_RESULTS = 60;

  getSearchableDecks().forEach((deck) => {
    if (!deck) return;
    const name = String(deck.name || '').toLowerCase();
    const description = String(deck.description || '').toLowerCase();
    if (name.includes(query) || description.includes(query)) {
      deckMatches.push(deck);
    }
    (Array.isArray(deck.questions) ? deck.questions : []).forEach((question) => {
      const en = String(question.en || '').toLowerCase();
      const tl = String(question.tl || '').toLowerCase();
      if (en.includes(query) || tl.includes(query)) {
        questionMatches.push({ deck, question });
      }
    });
  });

  if (deckMatches.length === 0 && questionMatches.length === 0) {
    return `<div class="search-empty">No decks or questions match "${escapeHtml(query)}".</div>`;
  }

  let html = '';

  if (deckMatches.length > 0) {
    html += '<div class="search-group"><h3 class="section-title">DECKS</h3>';
    html += deckMatches.map((deck) => {
      const count = Array.isArray(deck.questions) ? deck.questions.length : (deck.count || 0);
      return `
        <button class="search-result-item" type="button" data-deck-id="${escapeHtml(deck.id)}">
          <span class="search-result-title">${escapeHtml(deck.name)}</span>
          <span class="search-result-meta">${questionCountLabel(count)}</span>
        </button>
      `;
    }).join('');
    html += '</div>';
  }

  if (questionMatches.length > 0) {
    const visible = questionMatches.slice(0, MAX_QUESTION_RESULTS);
    html += '<div class="search-group"><h3 class="section-title">QUESTIONS</h3>';
    html += visible.map(({ deck, question }) => `
      <button class="search-result-item search-question-item" type="button" data-deck-id="${escapeHtml(deck.id)}" data-question-id="${escapeHtml(question.id || '')}">
        <span class="search-result-title">${escapeHtml(question.en || question.tl || '')}</span>
        ${question.en && question.tl ? `<span class="search-result-subtitle">${escapeHtml(question.tl)}</span>` : ''}
        <span class="search-result-meta">${escapeHtml(deck.name)}</span>
      </button>
    `).join('');
    if (questionMatches.length > MAX_QUESTION_RESULTS) {
      html += `<p class="search-more">Showing ${MAX_QUESTION_RESULTS} of ${questionMatches.length} matching questions. Type more to narrow it down.</p>`;
    }
    html += '</div>';
  }

  return html;
}

function wireSearchResults() {
  const results = document.getElementById('searchResults');
  if (!results) return;

  results.querySelectorAll('.search-result-item').forEach((item) => {
    item.addEventListener('click', () => {
      const deck = allDecks.find((candidate) => candidate.id === item.dataset.deckId);
      if (!deck) return;
      const startQuestionId = item.dataset.questionId || '';
      startDeckSession(deck, startQuestionId ? { startQuestionId } : {});
    });
  });
}

window.viewDeckDetails = function(deckId) {
  const deck = allDecks.find(d => d.id === deckId);
  if (deck) {
    infoDeckId = deck.id;
    // Show info modal with delete option
    document.getElementById('infoDeckName').textContent = deck.name;
    document.getElementById('infoDeckDescription').textContent = deck.description;
    document.getElementById('infoDeckCount').textContent = `${questionCountLabel(deck.count || 0)} in this deck`;
    document.getElementById('deckInfoModal').classList.remove('hidden');

    const editBtn = document.getElementById('editDeckBtn');
    if (editBtn) {
      if (deck.isDefault || deck.isHandmade || deck.id === 'handmade') {
        editBtn.style.display = 'none';
      } else {
        editBtn.style.display = '';
      }
    }

    const addQuestionsBtn = document.getElementById('addQuestionsToDeckBtn');
    if (addQuestionsBtn) {
      addQuestionsBtn.onclick = () => {
        currentDeck = deck;
        openAddQuestionsModal();
      };
    }

    wireDeckCsvButton(deck);
    wireDeckImportButton(deck);

    const deleteDeckBtn = document.getElementById('deleteDeckBtn');
    if (deleteDeckBtn) {
      if (deck.isDefault || deck.isHandmade || deck.id === 'handmade') {
        deleteDeckBtn.style.display = 'none';
      } else {
        deleteDeckBtn.style.display = '';
        deleteDeckBtn.onclick = () => deleteDeck(deck.id);
      }
    }
  }
};

function openFavoritesView() {
  const favorites = getFavorites();
  const favsList = document.getElementById('favoritesList');
  if (!favsList) return;

  if (favorites.length === 0) {
    favsList.innerHTML = '<div class="favorites-empty">No favorites yet. Heart questions while playing!</div>';
  } else {
    favsList.innerHTML = favorites.map((fav, idx) => `
      <div class="favorite-item" data-fav-index="${idx}">
        <div class="favorite-item-text">${escapeHtml(fav.en)}</div>
        <div class="favorite-item-lang">— ${escapeHtml(fav.tl)}</div>
        <button type="button" class="favorite-remove-btn" data-fav-id="${escapeHtml(fav.id)}" aria-label="Remove from favorites">&times;</button>
      </div>
    `).join('');

    favsList.querySelectorAll('.favorite-remove-btn').forEach((btn) => {
      btn.addEventListener('click', (event) => {
        event.stopPropagation();
        removeFavorite(btn.dataset.favId);
        openFavoritesView();
      });
    });
  }

  // Play-all button
  const playBtn = document.getElementById('playFavoritesBtn');
  if (playBtn) {
    playBtn.style.display = favorites.length ? '' : 'none';
    playBtn.onclick = () => {
      const favs = getFavorites();
      if (!favs.length) return;
      const favDeck = {
        id: 'favorites',
        name: 'Favorites',
        description: 'Hearted by you',
        collection: 'favorites',
        color: '#c9846f',
        theme: 'romantic',
        isDefault: true,
        questions: favs.map((q) => ({ ...q })),
      };
      closeModals();
      startDeckSession(favDeck);
    };
  }

  document.getElementById('favoritesModal').classList.remove('hidden');
}

window.openFavoritesView = openFavoritesView;

function openHandmadeView() {
  // Find or create the handmade deck
  let handmadeDeck = allDecks.find(d => d.id === 'handmade');
  if (!handmadeDeck) {
    handmadeDeck = {
      id: 'handmade',
      name: 'Handmade',
      description: 'Questions you wrote',
      collection: 'handmade',
      questions: [],
      count: 0,
      color: DEFAULT_DECK_COLOR,
      isHandmade: true,
    };
    allDecks.push(handmadeDeck);
  }

  // Load handmade questions from localStorage
  handmadeDeck.questions = readJsonArray(HANDMADE_KEY);
  ensureQuestionIdsForDeck(handmadeDeck);
  handmadeDeck.count = handmadeDeck.questions.length;

  // Set as current and show play screen
  startDeckSession(handmadeDeck);
}

window.openHandmadeView = openHandmadeView;

/* ============================================================================
   PLAY SESSION
   ============================================================================ */

function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function motionMs(ms) {
  return prefersReducedMotion() ? 0 : ms;
}

function shuffleArray(list) {
  const result = list.slice();
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function startDeckSession(deck, options = {}) {
  if (!deck) return;

  ensureQuestionIdsForDeck(deck);
  currentDeck = deck;
  currentDeckQuestions = Array.isArray(deck.questions) ? deck.questions : [];
  deck.count = currentDeckQuestions.length;

  sessionOrder = currentDeckQuestions.map((_, index) => index);
  if (options.shuffle) sessionOrder = shuffleArray(sessionOrder);

  sessionPosition = 0;
  let resumedFromSaved = false;
  if (options.startQuestionId) {
    const sourceIndex = currentDeckQuestions.findIndex(
      (question) => question && question.id === options.startQuestionId,
    );
    if (sourceIndex >= 0) {
      const orderIndex = sessionOrder.indexOf(sourceIndex);
      if (orderIndex >= 0) sessionPosition = orderIndex;
    }
  } else if (!options.fresh && deck.id && !deck.isMix) {
    const saved = readSessionProgressMap()[deck.id];
    if (saved) {
      const byQuestionId = saved.questionId
        ? currentDeckQuestions.findIndex((question) => question && question.id === saved.questionId)
        : -1;
      const savedPosition = Number(saved.position);
      let target = byQuestionId >= 0
        ? sessionOrder.indexOf(byQuestionId)
        : (Number.isInteger(savedPosition) ? savedPosition : 0);
      if (!Number.isInteger(target) || target < 0 || target >= currentDeckQuestions.length) target = 0;
      if (target > 0) {
        sessionPosition = target;
        resumedFromSaved = true;
      }
    }
  }
  isFlipped = false;
  isAnimating = false;
  isShuffling = false;
  isComplete = false;

  hideCompletion(true);
  showPlayScreen();
  applyDeckTheme(deck);

  // A mixed deck has no collection record behind it, so Info would offer
  // editing actions that cannot be saved.
  const infoBtn = document.getElementById('infoBtn');
  if (infoBtn) infoBtn.classList.toggle('hidden', Boolean(deck.isMix));

  renderCardContent();
  updateDeckProgress();
  updateStack();
  updatePlayControls();
  playStageEntrance();

  if (resumedFromSaved) {
    showToast(`Resumed at card ${sessionPosition + 1} of ${currentDeckQuestions.length}.`, 'info', 2500);
  }
}

function showPlayScreen() {
  document.getElementById('homeScreen').classList.remove('active');
  document.getElementById('playScreen').classList.add('active');
  if (currentDeck) {
    document.getElementById('currentDeckTitle').textContent = currentDeck.name;
  }
}

function goBack() {
  resetCardMotion();
  hideCompletion(true);
  isComplete = false;
  document.getElementById('playScreen').classList.remove('active');
  document.getElementById('homeScreen').classList.add('active');
  renderHomeScreen();
}

function getCurrentQuestion() {
  if (!currentDeckQuestions.length) return null;
  const sourceIndex = sessionOrder[sessionPosition];
  return currentDeckQuestions[sourceIndex] || null;
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

// Shrink card question text only as much as needed so the full question fits.
// Short questions keep the large CSS size; long questions scale down instead of
// being clipped or scrolled out of view.
function fitCardQuestionText() {
  ['questionText', 'cardBackText'].forEach((id) => {
    const element = document.getElementById(id);
    if (!element) return;
    const body = element.closest('.card-body');
    if (!body) return;

    element.style.fontSize = '';
    const maxSize = parseFloat(getComputedStyle(element).fontSize) || 27;
    const minSize = 12;
    element.style.fontSize = `${maxSize}px`;

    if (body.scrollHeight <= body.clientHeight + 1) return;

    let low = minSize;
    let high = maxSize;
    let best = minSize;
    for (let i = 0; i < 12; i += 1) {
      const mid = (low + high) / 2;
      element.style.fontSize = `${mid}px`;
      if (body.scrollHeight <= body.clientHeight + 1) {
        best = mid;
        low = mid;
      } else {
        high = mid;
      }
    }
    element.style.fontSize = `${best}px`;
  });
}

function scheduleCardTextFit() {
  requestAnimationFrame(() => fitCardQuestionText());
}

function renderCardContent() {
  const total = currentDeckQuestions.length;
  const question = getCurrentQuestion();
  const cardInner = document.getElementById('cardInner');
  const card = document.getElementById('card');

  isFlipped = false;
  if (cardInner) cardInner.classList.remove('is-flipped');
  if (card) card.setAttribute('aria-pressed', 'false');

  if (!question) {
    setText('questionText', 'This deck has no questions yet.');
    setText('cardBackText', 'Open Info to add a question, or create a new collection.');
    setText('cardDeckLabel', (currentDeck?.name || 'Deck').toUpperCase());
    setText('cardBackLabel', 'Empty deck');
    setText('cardCounter', '0 / 0');
    setText('cardBackCounter', '0 / 0');
    setText('cardLanguage', currentLanguage === 'en' ? 'EN' : 'TL');
    setText('cardBackDeck', currentDeck?.name || 'Deck');
    updateFavoriteButtonState();
    updatePlayControls();
    scheduleCardTextFit();
    return;
  }

  const front = (currentLanguage === 'en' ? question.en : question.tl) || question.en || question.tl || '';
  const alternate = currentLanguage === 'en' ? question.tl : question.en;
  const extra = question.reflection || question.answer || question.explanation || question.back || '';
  const backText = extra || alternate || (currentLanguage === 'en'
    ? 'Take a moment. What comes up for you?'
    : 'Maglaan ng sandali. Ano ang pumapasok sa isip mo?');
  const backLabel = extra
    ? 'Reflection'
    : alternate
      ? (currentLanguage === 'en' ? 'Sa Tagalog' : 'In English')
      : 'Reflect';

  setText('questionText', front);
  setText('cardBackText', backText);
  setText('cardDeckLabel', (currentDeck?.name || 'Deck').toUpperCase());
  setText('cardBackLabel', backLabel);
  setText('cardCounter', `${sessionPosition + 1} / ${total}`);
  setText('cardBackCounter', `${sessionPosition + 1} / ${total}`);
  setText('cardLanguage', currentLanguage === 'en' ? 'EN' : 'TL');
  setText('cardBackDeck', currentDeck?.name || 'Deck');

  updateFavoriteButtonState();
  updatePlayControls();
  scheduleCardTextFit();
  saveSessionProgress();
}

function updateFavoriteButtonState() {
  const question = getCurrentQuestion();
  const btn = document.getElementById('favoriteBtn');
  if (!btn) return;

  if (!question) {
    btn.classList.remove('is-favorite');
    btn.setAttribute('data-is-favorite', 'false');
    btn.setAttribute('aria-pressed', 'false');
    const emptyLabel = btn.querySelector('.control-label');
    if (emptyLabel) emptyLabel.textContent = 'Favorite';
    return;
  }

  const isFavorited = getFavorites().some((fav) => fav && fav.id === question.id);
  btn.classList.toggle('is-favorite', isFavorited);
  btn.setAttribute('data-is-favorite', String(isFavorited));
  btn.setAttribute('aria-pressed', String(isFavorited));
  btn.setAttribute('aria-label', isFavorited ? 'Remove from favorites' : 'Add to favorites');
  const label = btn.querySelector('.control-label');
  if (label) label.textContent = isFavorited ? 'Saved' : 'Favorite';
}

function toggleFavorite() {
  const question = getCurrentQuestion();
  if (!question) return;

  const isFavorited = getFavorites().some((fav) => fav && fav.id === question.id);
  const ok = isFavorited ? removeFavorite(question.id) : addFavorite(question);
  if (!ok) {
    showToast('Could not update favorites. Storage is full or unavailable.', 'error');
    return;
  }

  updateFavoriteButtonState();
}

function updateDeckProgress() {
  const fill = document.getElementById('deckProgressFill');
  if (!fill) return;
  const total = currentDeckQuestions.length;
  const progress = total ? ((sessionPosition + 1) / total) * 100 : 0;
  fill.style.width = `${progress}%`;
}

function updateStack() {
  const behind = Math.max(0, currentDeckQuestions.length - sessionPosition - 1);
  document.querySelectorAll('#deckStack .stack-card').forEach((card, index) => {
    card.classList.toggle('is-gone', index >= behind);
  });
}

function updatePlayControls() {
  const hasQuestions = currentDeckQuestions.length > 0;
  const drawBtn = document.getElementById('drawBtn');
  const shuffleBtn = document.getElementById('shuffleBtn');
  const favBtn = document.getElementById('favoriteBtn');

  if (drawBtn) drawBtn.disabled = !hasQuestions || isComplete;
  if (shuffleBtn) shuffleBtn.disabled = currentDeckQuestions.length < 2 || isComplete;
  if (favBtn) favBtn.disabled = !hasQuestions;
}

function applyDeckTheme(deck) {
  const themeId = getDeckTheme(deck);
  const screen = document.getElementById('playScreen');
  const stage = document.getElementById('playStage');

  if (screen) screen.dataset.theme = themeId;
  if (stage) stage.setAttribute('data-theme', themeId);

  document.querySelectorAll('#themeGrid .theme-option').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.theme === themeId);
  });
}

function playStageEntrance() {
  const stage = document.getElementById('playStage');
  if (!stage) return;
  stage.classList.remove('is-entering');
  void stage.offsetWidth;
  stage.classList.add('is-entering');
  window.setTimeout(() => stage.classList.remove('is-entering'), motionMs(700));
}

function toggleCardFlip() {
  if (!getCurrentQuestion() || isAnimating || isShuffling || isComplete) return;
  isFlipped = !isFlipped;
  const inner = document.getElementById('cardInner');
  const card = document.getElementById('card');
  if (inner) inner.classList.toggle('is-flipped', isFlipped);
  if (card) card.setAttribute('aria-pressed', String(isFlipped));
}

function drawNextCard() {
  if (!getCurrentQuestion() || isAnimating || isShuffling || isComplete) return;

  if (sessionPosition >= currentDeckQuestions.length - 1) {
    showCompletion();
    return;
  }

  isAnimating = true;
  const card = document.getElementById('card');
  const float = card ? card.querySelector('.card-float') : null;
  if (float) float.classList.add('is-busy', 'is-drawing');

  window.setTimeout(() => {
    if (float) float.classList.remove('is-drawing');
    sessionPosition += 1;
    renderCardContent();
    updateDeckProgress();
    updateStack();

    if (float) {
      float.classList.add('is-drawn-in');
      window.setTimeout(() => {
        float.classList.remove('is-drawn-in', 'is-busy');
        isAnimating = false;
      }, motionMs(340));
    } else {
      isAnimating = false;
    }
  }, motionMs(240));
}

function shuffleDeck() {
  if (!currentDeck || currentDeckQuestions.length < 2 || isShuffling || isAnimating) return;
  if (isComplete) hideCompletion();
  isComplete = false;
  isShuffling = true;
  updatePlayControls();

  const stage = document.getElementById('playStage');
  if (stage) stage.classList.add('is-shuffling');

  let nextOrder = shuffleArray(currentDeckQuestions.map((_, index) => index));
  if (nextOrder.length > 1 && nextOrder.every((value, index) => value === sessionOrder[index])) {
    nextOrder = nextOrder.slice(1).concat(nextOrder[0]);
  }

  window.setTimeout(() => {
    sessionOrder = nextOrder;
    sessionPosition = 0;
    renderCardContent();
    updateDeckProgress();
    updateStack();
    if (stage) stage.classList.remove('is-shuffling');
    isShuffling = false;
    updatePlayControls();
  }, motionMs(680));
}

function resetCardMotion() {
  const card = document.getElementById('card');
  if (!card) return;
  card.classList.remove(
    'swipe-out-left', 'swipe-out-right', 'swipe-in-left', 'swipe-in-right',
    'is-dragging', 'is-snapping', 'is-pressed', 'is-interacting'
  );
  card.style.transform = '';
  card.style.opacity = '';
  const float = card.querySelector('.card-float');
  if (float) float.classList.remove('is-paused', 'is-drawing', 'is-drawn-in', 'is-busy');
}

function springBack() {
  const card = document.getElementById('card');
  if (!card) return;
  card.classList.add('is-snapping');
  card.style.transform = '';
  window.setTimeout(() => card.classList.remove('is-snapping'), motionMs(380));
}

function animateSwipe(direction) {
  if (isAnimating) return;
  const card = document.getElementById('card');
  if (!card) return;

  isAnimating = true;
  const total = currentDeckQuestions.length;
  card.classList.remove('is-snapping');
  card.classList.add(direction === 'left' ? 'swipe-out-left' : 'swipe-out-right');

  window.setTimeout(() => {
    card.classList.remove('swipe-out-left', 'swipe-out-right');
    card.style.transform = '';
    card.style.opacity = '';

    if (direction === 'left') {
      if (sessionPosition >= total - 1) {
        isAnimating = false;
        showCompletion();
        return;
      }
      sessionPosition += 1;
    } else {
      if (sessionPosition <= 0) {
        isAnimating = false;
        return;
      }
      sessionPosition -= 1;
    }

    renderCardContent();
    updateDeckProgress();
    updateStack();

    card.classList.add(direction === 'left' ? 'swipe-in-right' : 'swipe-in-left');
    window.setTimeout(() => {
      card.classList.remove('swipe-in-right', 'swipe-in-left');
      isAnimating = false;
    }, motionMs(320));
  }, motionMs(320));
}

function handlePointerDown(event) {
  if (!getCurrentQuestion() || isAnimating || isShuffling || isComplete) return;
  if (event.pointerType === 'mouse' && event.button !== 0) return;

  const card = document.getElementById('card');
  if (!card) return;

  activePointerId = event.pointerId;
  pointerStartX = event.clientX;
  pointerStartY = event.clientY;
  dragOffset = 0;
  dragOffsetY = 0;
  isDragging = false;

  try {
    card.setPointerCapture(event.pointerId);
  } catch {
    // Pointer capture is unavailable in some older WebViews.
  }

  card.classList.add('is-pressed');
  const float = card.querySelector('.card-float');
  if (float) float.classList.add('is-paused');
}

function handlePointerMove(event) {
  if (event.pointerId !== activePointerId) return;
  const card = document.getElementById('card');
  if (!card) return;

  const dx = event.clientX - pointerStartX;
  const dy = event.clientY - pointerStartY;

  if (!isDragging && Math.hypot(dx, dy) > 7) {
    isDragging = true;
    card.classList.add('is-dragging');
    card.classList.remove('is-pressed');
  }

  if (!isDragging) return;
  if (event.cancelable) event.preventDefault();

  dragOffset = dx;
  dragOffsetY = dy;
  const rotation = Math.max(-16, Math.min(16, dx / 22));
  card.style.transform = `translate3d(${dx}px, ${dy * 0.22}px, 0) rotateZ(${rotation}deg)`;

  const stage = document.getElementById('playStage');
  if (stage) {
    stage.classList.toggle('drag-left', dx < -6);
    stage.classList.toggle('drag-right', dx > 6);
  }
}

function handlePointerUp(event) {
  if (event.pointerId !== activePointerId) return;
  const card = document.getElementById('card');
  if (!card) return;

  try {
    card.releasePointerCapture(event.pointerId);
  } catch {
    // Ignore release failures.
  }

  activePointerId = null;
  const float = card.querySelector('.card-float');
  if (float) float.classList.remove('is-paused');
  card.classList.remove('is-pressed', 'is-dragging');

  const stage = document.getElementById('playStage');
  if (stage) stage.classList.remove('drag-left', 'drag-right');

  if (!isDragging) {
    toggleCardFlip();
    dragOffset = 0;
    dragOffsetY = 0;
    return;
  }

  const threshold = Math.min(150, Math.max(64, card.offsetWidth * 0.26));
  if (Math.abs(dragOffset) >= threshold) {
    animateSwipe(dragOffset < 0 ? 'left' : 'right');
  } else {
    springBack();
  }

  dragOffset = 0;
  dragOffsetY = 0;
  isDragging = false;
}

function handlePointerCancel(event) {
  if (event.pointerId !== activePointerId) return;
  const card = document.getElementById('card');
  activePointerId = null;
  isDragging = false;
  dragOffset = 0;
  if (!card) return;

  const float = card.querySelector('.card-float');
  if (float) float.classList.remove('is-paused');
  card.classList.remove('is-pressed', 'is-dragging');
  springBack();
}

function showCompletion() {
  if (!currentDeckQuestions.length) return;

  isComplete = true;
  isAnimating = false;
  clearSessionProgress(currentDeck && currentDeck.id);
  resetCardMotion();
  updatePlayControls();

  const total = currentDeckQuestions.length;
  setText('completionText', `You made it through all ${total} ${total === 1 ? 'question' : 'questions'}.`);

  buildConfetti();
  const overlay = document.getElementById('completionOverlay');
  if (overlay) {
    overlay.classList.add('is-visible');
    overlay.setAttribute('aria-hidden', 'false');
  }

  const primary = document.getElementById('completionShuffleBtn');
  if (primary) primary.focus({ preventScroll: true });
}

function hideCompletion(immediate = false) {
  const overlay = document.getElementById('completionOverlay');
  if (!overlay) return;
  overlay.classList.remove('is-visible');
  overlay.setAttribute('aria-hidden', 'true');
  isComplete = false;

  if (immediate) {
    const container = document.getElementById('completionConfetti');
    if (container) container.innerHTML = '';
  }
}

function buildConfetti() {
  const container = document.getElementById('completionConfetti');
  if (!container) return;

  const colors = ['#d4a574', '#c97777', '#2f7d6d', '#a78bda', '#ef8a3c'];
  const pieces = 18;
  let html = '';

  for (let i = 0; i < pieces; i += 1) {
    const left = Math.round((i / pieces) * 100 + (i % 3) * 2);
    const delay = (i % 6) * 0.07;
    const duration = 1.5 + (i % 5) * 0.18;
    const drift = (i % 2 === 0 ? 1 : -1) * (20 + (i % 4) * 16);
    const rotate = 240 + i * 37;
    const color = colors[i % colors.length];
    html += `<span style="--x:${left}%;--delay:${delay}s;--dur:${duration}s;--drift:${drift}px;--rot:${rotate}deg;--color:${color}"></span>`;
  }

  container.innerHTML = html;
}

function restartSession(shouldShuffle = false) {
  hideCompletion(true);
  isComplete = false;
  clearSessionProgress(currentDeck && currentDeck.id);
  sessionOrder = currentDeckQuestions.map((_, index) => index);
  if (shouldShuffle) sessionOrder = shuffleArray(sessionOrder);
  sessionPosition = 0;
  renderCardContent();
  updateDeckProgress();
  updateStack();
  updatePlayControls();
  resetCardMotion();
  playStageEntrance();
}

let pendingThemeId = null;

function renderThemeGrid() {
  const grid = document.getElementById('themeGrid');
  if (!grid || !currentDeck) return;

  const activeTheme = getDeckTheme(currentDeck);
  pendingThemeId = activeTheme;

  grid.innerHTML = THEME_LIST.map((theme) => `
    <button type="button" class="theme-option ${theme.id === activeTheme ? 'is-active' : ''}" data-theme="${theme.id}">
      <span class="theme-swatch" style="background:${theme.swatch}"></span>
      <span class="theme-name">${theme.label}</span>
    </button>
  `).join('');

  // Apply the active theme to preview
  applyPreviewTheme(activeTheme);

  grid.querySelectorAll('.theme-option').forEach((button) => {
    button.addEventListener('click', () => {
      const themeId = button.dataset.theme;
      if (!currentDeck || !isValidTheme(themeId)) return;
      pendingThemeId = themeId;
      grid.querySelectorAll('.theme-option').forEach((b) => {
        b.classList.toggle('is-active', b.dataset.theme === themeId);
      });
      applyPreviewTheme(themeId);
    });
  });
}

function applyPreviewTheme(themeId) {
  const previewCard = document.getElementById('themePreviewCard');
  if (!previewCard) return;
  // Apply theme to preview card by setting data-theme on a wrapper
  // We use a temporary approach: set CSS variables on the preview card
  const theme = getTheme(themeId);
  if (!theme) return;

  // Find the theme's CSS block by checking the playScreen's theme
  // We'll apply by setting data-theme on a hidden element and reading computed styles
  const tempEl = document.createElement('div');
  tempEl.setAttribute('data-theme', themeId);
  tempEl.style.display = 'none';
  document.body.appendChild(tempEl);
  const computed = getComputedStyle(tempEl);

  // Apply all --c-* variables to the preview card. Copy every used variable
  // before the temporary element is removed.
  const props = ['--c-bg1', '--c-bg2', '--c-ink', '--c-muted', '--c-accent', '--c-accent-soft',
    '--c-btn1', '--c-btn2', '--c-line', '--c-shadow', '--c-back1', '--c-back2',
    '--c-back-ink', '--c-back-muted', '--c-back-glow', '--c-header', '--c-ornament',
    '--c-pattern', '--c-pattern-size', '--c-font', '--c-on-accent'];
  const values = {};
  for (const prop of props) {
    const val = computed.getPropertyValue(prop).trim();
    if (val) values[prop] = val;
  }
  tempEl.remove();

  Object.keys(values).forEach((prop) => previewCard.style.setProperty(prop, values[prop]));

  // Also update the play screen preview text color
  const front = document.getElementById('themePreviewFront');
  const back = document.getElementById('themePreviewBack');
  if (front && values['--c-ink']) front.style.color = values['--c-ink'];
  if (back && values['--c-back-ink']) back.style.color = values['--c-back-ink'];
}

function openThemeModal() {
  if (!currentDeck) return;
  renderThemeGrid();
  const modal = document.getElementById('themeModal');
  if (modal) modal.classList.remove('hidden');

  // Wire up Apply button
  const applyBtn = document.getElementById('themeApplyBtn');
  if (applyBtn) {
    applyBtn.onclick = () => {
      if (!currentDeck || !pendingThemeId) return;
      if (!saveDeckTheme(currentDeck.id, pendingThemeId)) {
        showAlertModal({ title: 'Could Not Save', message: 'The theme could not be saved to device storage.', type: 'error' });
        return;
      }
      currentDeck.theme = pendingThemeId;
      applyDeckTheme(currentDeck);
      renderDecksList();
      closeModals();
      showToast('Theme applied!', 'success');
    };
  }

  // Wire up Cancel button
  const cancelBtn = document.getElementById('themeCancelBtn');
  if (cancelBtn) {
    cancelBtn.onclick = () => {
      pendingThemeId = null;
      closeModals();
    };
  }

  // Wire up preview card flip
  const previewCard = document.getElementById('themePreviewCard');
  if (previewCard) {
    previewCard.onclick = () => {
      previewCard.classList.toggle('is-flipped');
    };
  }
}

function openCreateDeckModal() {
  const modal = document.getElementById('createDeckModal');
  if (!modal) {
    console.error('Modal not found');
    return;
  }

  // Clear every transient piece of state first so a cancelled import can never
  // leak into the next collection.
  resetCreationFlow();
  editingDeckId = null;
  const createBtn = document.getElementById('colorCreateBtn');
  if (createBtn) createBtn.textContent = 'Create Collection';
  modal.classList.remove('hidden');
}

function openEditCollectionModal(deckId) {
  const deck = allDecks.find((d) => d.id === deckId);
  const modal = document.getElementById('createDeckModal');
  if (!deck || !modal) return;

  resetCreationFlow();
  editingDeckId = deckId;

  // Make edit mode unmistakable instead of reusing the "new collection" chrome.
  modal.classList.add('is-editing');
  const modalTitle = document.getElementById('createDeckTitle');
  if (modalTitle) modalTitle.textContent = 'Edit Collection';
  const manualBack = document.getElementById('manualBackBtn');
  if (manualBack) manualBack.textContent = 'Cancel';

  const createBtn = document.getElementById('colorCreateBtn');
  if (createBtn) createBtn.textContent = 'Save Changes';

  // Pre-fill details
  const name = document.getElementById('newDeckName');
  const desc = document.getElementById('newDeckDescription');
  if (name) name.value = deck.name || '';
  if (desc) desc.value = deck.description || '';

  // Category
  if (deck.collection) {
    const pill = document.querySelector(`#newDeckCollectionGroup .category-pill[data-value="${deck.collection}"]`);
    if (pill) pill.click();
  }

  // Color
  selectedDeckColor = safeColor(deck.color);
  const radio = document.querySelector(`input[name="selectedColor"][value="${selectedDeckColor}"]`);
  if (radio) radio.checked = true;

  modal.classList.remove('hidden');
  showCreationStep('manualAddStep');

  // Show the real collection in the preview, not the "0 questions" placeholder.
  const previewTitle = document.querySelector('.color-preview-title');
  if (previewTitle) previewTitle.textContent = deck.name || 'Your collection';
  const previewDesc = document.querySelector('.color-preview-desc');
  if (previewDesc) previewDesc.textContent = deck.description || '';
  const previewCount = document.querySelector('.color-preview-count');
  if (previewCount) previewCount.textContent = questionCountLabel((deck.questions || []).length);

  updateColorPreview(selectedDeckColor);
}

window.openEditCollectionModal = openEditCollectionModal;

function updateColorPreview(color) {
  const previewCard = document.getElementById('colorPreviewCard');
  if (!previewCard) return;

  const safe = safeColor(color);
  // Set background gradient
  previewCard.style.background = `linear-gradient(135deg, ${safe} 0%, ${darkenColor(safe, 15)} 100%)`;
}

function darkenColor(hex, percent) {
  // Simple color darkening
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);

  r = Math.max(0, Math.round(r * (1 - percent / 100)));
  g = Math.max(0, Math.round(g * (1 - percent / 100)));
  b = Math.max(0, Math.round(b * (1 - percent / 100)));

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function closeModals() {
  const createModal = document.getElementById('createDeckModal');
  const creationWasOpen = Boolean(createModal && !createModal.classList.contains('hidden'));
  const addQuestionsModal = document.getElementById('addQuestionsModal');
  const addQuestionsWasOpen = Boolean(addQuestionsModal && !addQuestionsModal.classList.contains('hidden'));

  ['favoritesModal', 'deckInfoModal', 'themeModal', 'createDeckModal', 'addQuestionsModal', 'resetDataModal', 'mixDecksModal', 'moveQuestionsModal'].forEach((id) => {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('hidden');
  });

  // Cancel means cancel: drop partial questions/details/file selection.
  if (creationWasOpen) resetCreationFlow();
  if (addQuestionsWasOpen) resetQuestionEditor();
}

function handleCreateDeck(e) {
  e.preventDefault();

  const name = document.getElementById('newDeckName').value.trim();
  const description = document.getElementById('newDeckDescription').value.trim();
  const collection = document.getElementById('newDeckCollection').value;

  if (!name || !description) {
    showAlertModal({ title: 'Missing Fields', message: 'Please fill in all fields.', type: 'warning' });
    return;
  }

  if (!collection) {
    showAlertModal({ title: 'Choose a Category', message: 'Please select a category for this collection.', type: 'warning' });
    return;
  }

  // Check for duplicate deck name, ignoring the deck being edited.
  const existingDeck = findDeckByName(name, editingDeckId);
  if (existingDeck) {
    showAlertModal({ title: 'Duplicate Deck', message: 'A deck with this name already exists. Please choose a different name.', type: 'warning' });
    return;
  }

  // Store details temporarily - color selection is the final step
  pendingDeckDetails = { name, description, category: collection };
  colorStepOrigin = 'manualAddStep';

  // Nothing is written to storage until Create Collection is pressed.
  window_importedQuestions = [];

  // Go to color selection step (final step)
  showCreationStep('colorSelectStep');
  updateColorPreviewMeta();

  // Reset color selection, pre-selecting the deck's colour when editing.
  document.querySelectorAll('input[name="selectedColor"]').forEach(r => r.checked = false);
  let initialColor = DEFAULT_DECK_COLOR;
  if (editingDeckId) {
    const ed = allDecks.find(d => d.id === editingDeckId);
    if (ed) initialColor = safeColor(ed.color);
  }
  const matchingRadio = Array.from(document.querySelectorAll('input[name="selectedColor"]')).find(r => safeColor(r.value) === initialColor);
  const defaultColor = matchingRadio || document.getElementById('color1');
  if (defaultColor) {
    defaultColor.checked = true;
    selectedDeckColor = safeColor(defaultColor.value);
    updateColorPreview(selectedDeckColor);
  }
}

function handleCsvImport(e) {
  e.preventDefault();

  const fileInput = document.getElementById('csvFile');
  const file = fileInput.files[0];

  if (!file) {
    showAlertModal({ title: 'No File Selected', message: 'Please select a CSV file.', type: 'warning' });
    return;
  }

  const reader = new FileReader();
  reader.onload = function(event) {
    try {
      const rows = parseCsv(event.target.result);
      if (rows.length < 2) {
        showAlertModal({ title: 'Invalid CSV', message: 'CSV file must have a header row and at least one question.', type: 'error' });
        return;
      }

      const questions = csvRowsToQuestions(rows);
      if (questions.length === 0) {
        showAlertModal({ title: 'No Questions Found', message: 'No valid questions found in CSV (all may be duplicates).', type: 'warning' });
        return;
      }

      // Store imported questions temporarily
      window_importedQuestions = questions;

      // Show deck details step
      showDeckDetailsStep(questions.length);
      showToast(`Imported ${questions.length} ${questions.length === 1 ? 'question' : 'questions'}.`, 'success');

    } catch (error) {
      showAlertModal({ title: 'Parse Error', message: 'Error parsing CSV: ' + error.message, type: 'error' });
    }
  };
  reader.readAsText(file);
}

// Quote-aware CSV parser: keeps commas, quotes and line breaks inside fields.
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  const input = String(text || '').replace(/^\uFEFF/, '');

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    const next = input[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && next === '\n') i += 1;
      row.push(field);
      field = '';
      if (row.some((cell) => cell.trim() !== '')) rows.push(row);
      row = [];
    } else {
      field += char;
    }
  }

  row.push(field);
  if (row.some((cell) => cell.trim() !== '')) rows.push(row);
  return rows;
}

function normalizeCsvHeader(value) {
  return String(value || '')
    .replace(/^\uFEFF/, '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
}

// Check if an identical question already exists in the target deck (same en and tl text).
// Duplicates across different decks are allowed on purpose.
function isDuplicateQuestion(en, tl, deck, excludeId = null) {
  const normalizedEn = (en || '').trim().toLowerCase();
  const normalizedTl = (tl || '').trim().toLowerCase();
  if (!normalizedEn || !normalizedTl) return false;
  if (!deck || !Array.isArray(deck.questions)) return false;

  for (const q of deck.questions) {
    if (excludeId && q && q.id === excludeId) continue;
    const qEn = (q.en || '').trim().toLowerCase();
    const qTl = (q.tl || '').trim().toLowerCase();
    if (qEn === normalizedEn && qTl === normalizedTl) return true;
  }
  return false;
}

// Deduplicate an array of questions within the same import only.
function deduplicateQuestions(questions) {
  const seen = new Set();
  const result = [];
  for (const q of questions) {
    const key = ((q.en || '').trim().toLowerCase()) + '|' + ((q.tl || '').trim().toLowerCase());
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(q);
  }
  return result;
}

function csvRowsToQuestions(rows) {
  if (!rows || rows.length < 2) return [];

  const headers = rows[0].map(normalizeCsvHeader);
  const findIndex = (...names) => headers.findIndex((header) => names.includes(header));

  let enIndex = findIndex('question_en', 'en', 'english', 'question');
  let tlIndex = findIndex('question_tl', 'tl', 'tagalog', 'taglish', 'filipino');
  const reflectionIndex = findIndex('reflection', 'answer', 'explanation', 'back');

  if (enIndex === -1) enIndex = 0;
  if (tlIndex === -1) tlIndex = 1;

  const questions = [];
  rows.slice(1).forEach((row) => {
    const en = String(row[enIndex] || '').trim();
    const tl = String(row[tlIndex] || '').trim();
    const reflection = reflectionIndex >= 0 ? String(row[reflectionIndex] || '').trim() : '';

    if (!en && !tl) return;

    const question = { en, tl };
    if (reflection) question.reflection = reflection;
    questions.push(question);
  });

  // Remove duplicates within this import and against existing decks
  return deduplicateQuestions(questions);
}

function showDeckDetailsStep(questionCount) {
  showCreationStep('deckDetailsStep');

  // Remove any existing import info message
  const detailsForm = document.getElementById('deckDetailsForm');
  if (detailsForm) {
    const existingInfo = detailsForm.querySelector('.import-info-msg');
    if (existingInfo) existingInfo.remove();

    if (Number.isFinite(questionCount)) {
      const info = document.createElement('div');
      info.className = 'import-info-msg';
      info.textContent = `${questionCount} ${questionCount === 1 ? 'question' : 'questions'} ready to import.`;
      detailsForm.prepend(info);
    }
  }
}

function handleDeckDetails(e) {
  e.preventDefault();

  const name = document.getElementById('deckName').value.trim();
  const description = document.getElementById('deckDescription').value.trim();
  const category = document.getElementById('deckCategory').value;

  if (!name || !description) {
    showAlertModal({ title: 'Missing Fields', message: 'Please fill in all fields.', type: 'warning' });
    return;
  }

  if (!category) {
    showAlertModal({ title: 'Choose a Category', message: 'Please select a category for this collection.', type: 'warning' });
    return;
  }

  // Same duplicate-name rule as the manual path, including CSV imports.
  if (findDeckByName(name, editingDeckId)) {
    showAlertModal({ title: 'Duplicate Deck', message: 'A deck with this name already exists. Please choose a different name.', type: 'warning' });
    return;
  }

  // Store details temporarily - color selection is the final step
  pendingDeckDetails = { name, description, category };
  colorStepOrigin = 'csvImportStep';

  // Go to color selection step (final step)
  showCreationStep('colorSelectStep');
  updateColorPreviewMeta();

  // Reset color selection, pre-selecting the deck's colour when editing.
  document.querySelectorAll('input[name="selectedColor"]').forEach(r => r.checked = false);
  let initialColor = DEFAULT_DECK_COLOR;
  if (editingDeckId) {
    const ed = allDecks.find(d => d.id === editingDeckId);
    if (ed) initialColor = safeColor(ed.color);
  }
  const matchingRadio = Array.from(document.querySelectorAll('input[name="selectedColor"]')).find(r => safeColor(r.value) === initialColor);
  const defaultColor = matchingRadio || document.getElementById('color1');
  if (defaultColor) {
    defaultColor.checked = true;
    selectedDeckColor = safeColor(defaultColor.value);
    updateColorPreview(selectedDeckColor);
  }
}

// The one and only place a collection is written. Runs when the user presses
// "Create Collection" on the final step.
function createPendingCollection() {
  if (isCreatingCollection) return;

  const selected = document.querySelector('input[name="selectedColor"]:checked');
  if (!selected) {
    showAlertModal({ title: 'Missing Selection', message: 'Please select a color.', type: 'warning' });
    return;
  }

  if (!pendingDeckDetails || !pendingDeckDetails.name) {
    showAlertModal({ title: 'Missing Details', message: 'Missing collection details. Please start over.', type: 'error' });
    return;
  }

  const { name, description, category } = pendingDeckDetails;
  if (!category) {
    showAlertModal({ title: 'Choose a Category', message: 'Please select a category for this collection.', type: 'warning' });
    return;
  }

  // Re-check at the final write so a stale pending form can never create a duplicate.
  if (findDeckByName(name, editingDeckId)) {
    showAlertModal({ title: 'Duplicate Deck', message: 'A deck with this name already exists. Please choose a different name.', type: 'warning' });
    return;
  }

  isCreatingCollection = true;
  try {
    const color = safeColor(selected.value);

    if (editingDeckId) {
      const deck = allDecks.find((d) => d.id === editingDeckId);
      if (!deck) {
        showAlertModal({ title: 'Not Found', message: 'Collection no longer exists.', type: 'error' });
        return;
      }
      const previous = { name: deck.name, description: deck.description, collection: deck.collection, color: deck.color };
      deck.name = name;
      deck.description = description;
      deck.collection = category;
      deck.color = color;

      if (!persistDeckEdit(deck)) {
        // Roll back on failure
        deck.name = previous.name;
        deck.description = previous.description;
        deck.collection = previous.collection;
        deck.color = previous.color;
        notifySaveFailure();
        return;
      }

      editingDeckId = null;
      closeModals();
      renderDecksList();
      renderCollectionsTab();
      showToast(`Updated collection: "${name}".`, 'success');
      return;
    }

    const deckId = `custom_${Date.now()}`;
    const questions = (Array.isArray(window_importedQuestions) ? window_importedQuestions : []).map((question, index) => ({
      ...question,
      id: `${deckId}_q${index}`,
    }));

    const newDeck = {
      id: deckId,
      name,
      description,
      collection: category,
      count: questions.length,
      questions,
      color,
      theme: themeForCollection(category),
      isCustom: true,
    };

    const nextDecks = allDecks.concat(newDeck);
    // Persist first: only show the collection if the write actually succeeded.
    if (!writeJson(CUSTOM_DECKS_KEY, customDecksFrom(nextDecks))) {
      notifySaveFailure();
      return;
    }

    allDecks = nextDecks;
    closeModals();

    showToast(`Created collection: "${name}" with ${newDeck.count} ${newDeck.count === 1 ? 'question' : 'questions'}.`, 'success');
    renderDecksList();
    renderCollectionsTab();
  } finally {
    isCreatingCollection = false;
    editingDeckId = null;
  }
}

function switchToManualAdd() {
  // Manual collections start with zero questions, never the leftovers of a
  // cancelled or abandoned CSV import.
  window_importedQuestions = [];
  pendingDeckDetails = null;
  showCreationStep('manualAddStep');
}

function switchBackToCSVStep() {
  pendingDeckDetails = null;
  showCreationStep('csvImportStep');
}

function updateQuestionsSelectionState() {
  const preview = document.getElementById('deckQuestionsPreview');
  const toolbar = document.getElementById('questionsToolbar');
  const selectAll = document.getElementById('selectAllQuestions');
  const countEl = document.getElementById('questionsSelectedCount');
  const deleteBtn = document.getElementById('bulkDeleteQuestionsBtn');
  const moveBtn = document.getElementById('bulkMoveQuestionsBtn');
  if (!preview) return;

  const boxes = Array.from(preview.querySelectorAll('.question-select-checkbox'));
  const selected = boxes.filter((box) => box.checked).length;

  if (toolbar) toolbar.classList.toggle('hidden', boxes.length === 0);
  if (countEl) countEl.textContent = `${selected} selected`;
  if (deleteBtn) deleteBtn.disabled = selected === 0;
  if (moveBtn) moveBtn.disabled = selected === 0;
  if (selectAll) {
    selectAll.checked = boxes.length > 0 && selected === boxes.length;
    selectAll.indeterminate = selected > 0 && selected < boxes.length;
  }
}

async function deleteSelectedQuestions() {
  if (!currentDeck || !Array.isArray(currentDeck.questions)) return;

  const preview = document.getElementById('deckQuestionsPreview');
  if (!preview) return;
  const selectedIds = new Set(
    Array.from(preview.querySelectorAll('.question-select-checkbox:checked'))
      .map((box) => box.dataset.questionId)
      .filter(Boolean),
  );
  if (selectedIds.size === 0) return;

  const count = selectedIds.size;
  const confirmed = await showConfirmModal({
    title: `Delete ${count} ${count === 1 ? 'question' : 'questions'}?`,
    description: `You are about to remove ${count} selected ${count === 1 ? 'question' : 'questions'} from "${currentDeck.name}".`,
    warning: 'You can undo this for a few seconds.',
    confirmText: 'Delete selected',
    cancelText: 'Cancel',
    isDanger: true,
  });
  if (!confirmed) return;

  const deck = currentDeck;
  const previousQuestions = currentDeck.questions;
  const removedEntries = previousQuestions
    .map((question, index) => ({ question, index }))
    .filter((entry) => selectedIds.has(entry.question.id));
  const nextQuestions = previousQuestions.filter((question) => !selectedIds.has(question.id));
  currentDeck.questions = nextQuestions;
  currentDeck.count = nextQuestions.length;

  if (!saveDeckQuestions(currentDeck)) {
    currentDeck.questions = previousQuestions;
    currentDeck.count = previousQuestions.length;
    notifySaveFailure();
    return;
  }

  refreshDeckCounts();
  renderCollectionsTab();
  renderDecksList();
  renderQuestionsPreview();
  refreshCurrentDeckSession(deck);

  const countEl = document.getElementById('infoDeckCount');
  if (countEl) {
    countEl.textContent = `${questionCountLabel(currentDeck.count || 0)} in this deck`;
  }

  showToast(`${count} ${count === 1 ? 'question' : 'questions'} deleted.`, 'success', 6000, {
    label: 'Undo',
    onClick: () => undoQuestionDeletion(deck, removedEntries),
  });
}

function undoQuestionDeletion(deck, entries) {
  if (!deck || !Array.isArray(deck.questions) || !Array.isArray(entries) || entries.length === 0) return;
  if (!allDecks.some((item) => item.id === deck.id)) return;

  const previousQuestions = deck.questions.slice();
  const existingIds = new Set(deck.questions.map((question) => question && question.id).filter(Boolean));

  entries
    .slice()
    .sort((a, b) => a.index - b.index)
    .forEach((entry) => {
      const question = entry && entry.question;
      if (!question || (question.id && existingIds.has(question.id))) return;
      const at = Math.max(0, Math.min(Number(entry.index) || 0, deck.questions.length));
      deck.questions.splice(at, 0, question);
      if (question.id) existingIds.add(question.id);
    });

  deck.count = deck.questions.length;

  if (!saveDeckQuestions(deck)) {
    deck.questions = previousQuestions;
    deck.count = previousQuestions.length;
    notifySaveFailure();
    return;
  }

  refreshDeckCounts();
  renderCollectionsTab();
  renderDecksList();
  if (currentDeck && currentDeck.id === deck.id) {
    renderQuestionsPreview();
    refreshCurrentDeckSession(deck);
    const countEl = document.getElementById('infoDeckCount');
    if (countEl) countEl.textContent = `${questionCountLabel(deck.count || 0)} in this deck`;
  }

  showToast(`Restored ${entries.length} ${entries.length === 1 ? 'question' : 'questions'}.`, 'success');
}

window.removeQuestion = async function(questionId) {
  if (!currentDeck || !Array.isArray(currentDeck.questions)) return;

  const confirmed = await showConfirmModal({
    title: 'Remove this question?',
    description: 'You are about to remove this question from the deck.',
    warning: 'You can undo this for a few seconds.',
    confirmText: 'Remove',
    cancelText: 'Cancel',
    isDanger: true,
  });

  if (!confirmed) return;

  const deck = currentDeck;
  const removedIndex = deck.questions.findIndex((q) => q && q.id === questionId);
  if (removedIndex < 0) return;
  const removedQuestion = deck.questions[removedIndex];
  const nextQuestions = deck.questions.filter((q) => q.id !== questionId);
  const previousQuestions = deck.questions;
  currentDeck.questions = nextQuestions;
  currentDeck.count = nextQuestions.length;

  const saved = saveDeckQuestions(currentDeck);
  if (!saved) {
    currentDeck.questions = previousQuestions;
    currentDeck.count = previousQuestions.length;
    notifySaveFailure();
    return;
  }

  refreshDeckCounts();
  renderCollectionsTab();
  renderDecksList();
  renderQuestionsPreview();
  refreshCurrentDeckSession(deck);

  const countEl = document.getElementById('infoDeckCount');
  if (countEl) {
    countEl.textContent = `${questionCountLabel(currentDeck.count || 0)} in this deck`;
  }

  showToast('Question removed.', 'success', 6000, {
    label: 'Undo',
    onClick: () => undoQuestionDeletion(deck, [{ question: removedQuestion, index: removedIndex }]),
  });
};

function handleAddQuestion(e) {
  e.preventDefault();

  const en = document.getElementById('addQuestionsEn').value.trim();
  const tl = document.getElementById('addQuestionsTl').value.trim();

  if (!en || !tl) {
    showAlertModal({ title: 'Missing Fields', message: 'Please fill in both questions.', type: 'warning' });
    return;
  }

  if (!currentDeck) {
    showAlertModal({ title: 'No Deck', message: 'No deck selected.', type: 'warning' });
    return;
  }

  // Only exact duplicates inside the same deck are blocked. The same question
  // may live in different decks. While editing, the question being edited is
  // excluded from the duplicate check.
  if (isDuplicateQuestion(en, tl, currentDeck, editingQuestionId)) {
    showAlertModal({ title: 'Duplicate Question', message: 'This question already exists in this collection.', type: 'warning' });
    return;
  }

  if (editingQuestionId) {
    const index = currentDeck.questions.findIndex((question) => question && question.id === editingQuestionId);
    if (index < 0) {
      resetQuestionEditor();
      showAlertModal({ title: 'Question Not Found', message: 'That question is no longer in this collection.', type: 'error' });
      return;
    }

    const previous = { ...currentDeck.questions[index] };
    currentDeck.questions[index] = { ...previous, en, tl };

    if (!saveDeckQuestions(currentDeck)) {
      currentDeck.questions[index] = previous;
      notifySaveFailure();
      return;
    }

    resetQuestionEditor();
    refreshDeckCounts();
    renderCollectionsTab();
    renderDecksList();
    renderQuestionsPreview();
    refreshCurrentDeckSession(currentDeck);

    const infoCountEl = document.getElementById('infoDeckCount');
    if (infoCountEl && currentDeck) {
      infoCountEl.textContent = `${questionCountLabel(currentDeck.count || 0)} in this deck`;
    }

    showToast('Question updated.', 'success');
    return;
  }

  // Add question to current deck
  const question = {
    id: `${currentDeck.id || 'deck'}_q${Date.now()}`,
    en,
    tl,
  };
  currentDeck.questions.push(question);
  currentDeck.count = currentDeck.questions.length;

  // Persist for custom, handmade and built-in decks alike.
  if (!saveDeckQuestions(currentDeck)) {
    currentDeck.questions.pop();
    currentDeck.count = currentDeck.questions.length;
    notifySaveFailure();
    return;
  }

  refreshDeckCounts();
  renderCollectionsTab();
  renderDecksList();

  // Keep the info dialog's count in sync while it is open.
  const infoCountEl = document.getElementById('infoDeckCount');
  if (infoCountEl && currentDeck) {
    infoCountEl.textContent = `${questionCountLabel(currentDeck.count || 0)} in this deck`;
  }

  // Clear form
  document.getElementById('addQuestionsForm').reset();

  // Update preview
  renderQuestionsPreview();
  refreshCurrentDeckSession(currentDeck);

  showToast(`Question added! Total: ${currentDeck.count} ${currentDeck.count === 1 ? 'question' : 'questions'}`, 'success');
}

function resetQuestionEditor() {
  editingQuestionId = null;
  const form = document.getElementById('addQuestionsForm');
  if (form) form.reset();
  const submitBtn = document.getElementById('addQuestionSubmitBtn');
  if (submitBtn) submitBtn.textContent = 'Add Question';
  const cancelBtn = document.getElementById('cancelEditQuestionBtn');
  if (cancelBtn) cancelBtn.classList.add('hidden');
}

function startEditingQuestion(questionId) {
  if (!currentDeck || !Array.isArray(currentDeck.questions)) return;
  const question = currentDeck.questions.find((item) => item && item.id === questionId);
  if (!question) return;

  editingQuestionId = questionId;
  const enInput = document.getElementById('addQuestionsEn');
  const tlInput = document.getElementById('addQuestionsTl');
  if (enInput) enInput.value = question.en || '';
  if (tlInput) tlInput.value = question.tl || '';

  const submitBtn = document.getElementById('addQuestionSubmitBtn');
  if (submitBtn) submitBtn.textContent = 'Save Changes';
  const cancelBtn = document.getElementById('cancelEditQuestionBtn');
  if (cancelBtn) cancelBtn.classList.remove('hidden');

  const form = document.getElementById('addQuestionsForm');
  if (form && typeof form.scrollIntoView === 'function') {
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  if (enInput) enInput.focus({ preventScroll: true });
}

function renderQuestionsPreview() {
  const preview = document.getElementById('deckQuestionsPreview');
  if (!preview) return;
  if (!currentDeck || !currentDeck.questions || currentDeck.questions.length === 0) {
    preview.innerHTML = '<div class="questions-empty">No questions yet</div>';
    updateQuestionsSelectionState();
    return;
  }

  const lastIndex = currentDeck.questions.length - 1;
  const html = currentDeck.questions.map((q, idx) => `
    <div class="question-item">
      <input class="question-select-checkbox" type="checkbox" data-question-id="${escapeHtml(q.id)}" aria-label="Select question ${idx + 1}">
      <div class="question-item-content">
        <div class="question-index">${idx + 1}.</div>
        <div class="question-text">${escapeHtml(q.en)}</div>
        <div class="question-text-tl">${escapeHtml(q.tl)}</div>
      </div>
      <div class="question-order-btns">
        <button class="question-order-btn" data-question-id="${escapeHtml(q.id)}" data-direction="up" type="button" aria-label="Move question ${idx + 1} up" ${idx === 0 ? 'disabled' : ''}><span class="icon-wrapper" data-icon="chevron-up"></span></button>
        <button class="question-order-btn" data-question-id="${escapeHtml(q.id)}" data-direction="down" type="button" aria-label="Move question ${idx + 1} down" ${idx === lastIndex ? 'disabled' : ''}><span class="icon-wrapper" data-icon="chevron-down"></span></button>
      </div>
      <button class="question-edit-btn" data-question-id="${escapeHtml(q.id)}" type="button" aria-label="Edit question"><span class="icon-wrapper" data-icon="pencil"></span></button>
      <button class="question-remove-btn" data-question-id="${escapeHtml(q.id)}" type="button" aria-label="Remove question">&times;</button>
    </div>
  `).join('');

  preview.innerHTML = html;
  renderAllIcons();

  preview.querySelectorAll('.question-select-checkbox').forEach((box) => {
    box.addEventListener('change', updateQuestionsSelectionState);
  });
  preview.querySelectorAll('.question-edit-btn').forEach((btn) => {
    btn.addEventListener('click', () => startEditingQuestion(btn.dataset.questionId));
  });
  preview.querySelectorAll('.question-order-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      moveQuestionByOffset(btn.dataset.questionId, btn.dataset.direction === 'up' ? -1 : 1);
    });
  });
  preview.querySelectorAll('.question-remove-btn').forEach((btn) => {
    btn.addEventListener('click', () => window.removeQuestion(btn.dataset.questionId));
  });

  updateQuestionsSelectionState();
}

function openAddQuestionsModal() {
  if (!currentDeck) {
    showAlertModal({ title: 'No Deck', message: 'Please select a deck first.', type: 'warning' });
    return;
  }

  document.getElementById('addQuestionsTitle').textContent = currentDeck.name;
  document.getElementById('addQuestionsModal').classList.remove('hidden');

  // Clear form and any edit state.
  resetQuestionEditor();

  // Show current questions
  renderQuestionsPreview();
}


// ---------------------------------------------------------------------------
// MIX DECKS
// ---------------------------------------------------------------------------

function getMixableDecks() {
  return allDecks.filter((deck) => deck
    && deck.id !== 'handmade'
    && !deck.isHandmade
    && Array.isArray(deck.questions)
    && deck.questions.length > 0);
}

function updateMixDecksState() {
  const list = document.getElementById('mixDecksList');
  const startBtn = document.getElementById('mixDecksStartBtn');
  if (!list || !startBtn) return;
  const selected = list.querySelectorAll('.mix-deck-checkbox:checked').length;
  startBtn.disabled = selected < 2;
  startBtn.textContent = selected < 2
    ? 'Pick at least 2 decks'
    : `Start mixed session (${selected})`;
}

function openMixDecksModal() {
  const modal = document.getElementById('mixDecksModal');
  const list = document.getElementById('mixDecksList');
  if (!modal || !list) return;

  const decks = getMixableDecks();
  if (decks.length < 2) {
    showAlertModal({
      title: 'Not Enough Decks',
      message: 'You need at least two collections with questions to mix.',
      type: 'warning',
    });
    return;
  }

  list.innerHTML = decks.map((deck) => `
    <label class="picker-option">
      <input class="mix-deck-checkbox" type="checkbox" value="${escapeHtml(deck.id)}">
      <span class="picker-option-text">${escapeHtml(deck.name)}</span>
      <span class="picker-option-meta">${questionCountLabel(deck.questions.length)}</span>
    </label>
  `).join('');

  const startBtn = document.getElementById('mixDecksStartBtn');
  if (startBtn) {
    startBtn.disabled = true;
    startBtn.textContent = 'Pick at least 2 decks';
    startBtn.onclick = startMixSession;
  }

  list.querySelectorAll('.mix-deck-checkbox').forEach((box) => {
    box.addEventListener('change', updateMixDecksState);
  });

  modal.classList.remove('hidden');
}

function startMixSession() {
  const list = document.getElementById('mixDecksList');
  if (!list) return;
  const ids = new Set(
    Array.from(list.querySelectorAll('.mix-deck-checkbox:checked')).map((box) => box.value),
  );
  const chosen = getMixableDecks().filter((deck) => ids.has(deck.id));
  if (chosen.length < 2) return;

  const questions = [];
  chosen.forEach((deck) => {
    ensureQuestionIdsForDeck(deck);
    deck.questions.forEach((question) => {
      if (question) questions.push({ ...question });
    });
  });

  if (questions.length === 0) {
    showAlertModal({ title: 'No Questions', message: 'The chosen collections have no questions.', type: 'warning' });
    return;
  }

  const names = chosen.map((deck) => deck.name);
  let title = names.join(' + ');
  if (title.length > 42) title = `${chosen.length} mixed collections`;

  const mixedDeck = {
    id: `mix_${Date.now()}`,
    name: title,
    description: `Questions from ${chosen.length} collections`,
    collection: 'mixed',
    color: DEFAULT_DECK_COLOR,
    questions,
    count: questions.length,
    isMix: true,
  };

  const modal = document.getElementById('mixDecksModal');
  if (modal) modal.classList.add('hidden');
  startDeckSession(mixedDeck, { fresh: true, shuffle: true });
  showToast(`Mixing ${chosen.length} collections · ${questions.length} cards.`, 'success');
}

window.openMixDecksModal = openMixDecksModal;

// ---------------------------------------------------------------------------
// REORDER AND MOVE QUESTIONS
// ---------------------------------------------------------------------------

function restoreQuestions(deck, snapshot) {
  if (!deck || !Array.isArray(deck.questions) || !Array.isArray(snapshot)) return;
  deck.questions.length = 0;
  snapshot.forEach((question) => deck.questions.push(question));
}

function getSelectedQuestionIds() {
  const preview = document.getElementById('deckQuestionsPreview');
  if (!preview) return [];
  return Array.from(preview.querySelectorAll('.question-select-checkbox:checked'))
    .map((box) => box.dataset.questionId)
    .filter(Boolean);
}

function moveQuestionByOffset(questionId, offset) {
  if (!currentDeck || !Array.isArray(currentDeck.questions)) return;
  const index = currentDeck.questions.findIndex((question) => question && question.id === questionId);
  if (index < 0) return;
  const target = index + offset;
  if (target < 0 || target >= currentDeck.questions.length) return;

  const snapshot = currentDeck.questions.slice();
  const swap = currentDeck.questions[index];
  currentDeck.questions[index] = currentDeck.questions[target];
  currentDeck.questions[target] = swap;

  if (!saveDeckQuestions(currentDeck)) {
    restoreQuestions(currentDeck, snapshot);
    notifySaveFailure();
    return;
  }

  renderQuestionsPreview();
  refreshCurrentDeckSession(currentDeck);
}

function openMoveQuestionsModal() {
  if (!currentDeck || !Array.isArray(currentDeck.questions)) return;
  const selectedIds = getSelectedQuestionIds();
  if (selectedIds.length === 0) return;

  const modal = document.getElementById('moveQuestionsModal');
  const list = document.getElementById('moveQuestionsList');
  if (!modal || !list) return;

  const targets = allDecks.filter((deck) => deck
    && deck.id !== currentDeck.id
    && Array.isArray(deck.questions));

  if (targets.length === 0) {
    showAlertModal({
      title: 'No Other Collections',
      message: 'Create another collection before moving questions.',
      type: 'warning',
    });
    return;
  }

  list.innerHTML = targets.map((deck) => `
    <button class="picker-option" type="button" data-target-deck-id="${escapeHtml(deck.id)}">
      <span class="picker-option-text">${escapeHtml(deck.name)}</span>
      <span class="picker-option-meta">${questionCountLabel(deck.questions.length)}</span>
    </button>
  `).join('');

  list.querySelectorAll('[data-target-deck-id]').forEach((btn) => {
    btn.addEventListener('click', () => moveSelectedQuestions(btn.dataset.targetDeckId));
  });

  const titleEl = document.getElementById('moveQuestionsTitle');
  if (titleEl) {
    titleEl.textContent = `Move ${selectedIds.length} ${selectedIds.length === 1 ? 'question' : 'questions'}`;
  }

  modal.classList.remove('hidden');
}

function moveSelectedQuestions(targetDeckId) {
  if (!currentDeck || !Array.isArray(currentDeck.questions)) return;
  const target = allDecks.find((deck) => deck && deck.id === targetDeckId);
  if (!target || target.id === currentDeck.id) return;

  const selectedIds = new Set(getSelectedQuestionIds());
  if (selectedIds.size === 0) return;

  const moving = currentDeck.questions.filter((question) => question && selectedIds.has(question.id));
  if (moving.length === 0) return;

  ensureQuestionIdsForDeck(target);

  const sourceSnapshot = currentDeck.questions.slice();
  const targetSnapshot = target.questions.slice();
  const movedIds = new Set();
  let skipped = 0;

  moving.forEach((question) => {
    // The same question may live in two decks, but never twice in one deck.
    if (isDuplicateQuestion(question.en, question.tl, target)) {
      skipped += 1;
      return;
    }
    target.questions.push({
      ...question,
      id: `${target.id || 'deck'}_q${Date.now()}_${target.questions.length}`,
    });
    movedIds.add(question.id);
  });

  if (movedIds.size === 0) {
    showAlertModal({
      title: 'Already There',
      message: `Every selected question already exists in "${target.name}".`,
      type: 'warning',
    });
    return;
  }

  for (let i = currentDeck.questions.length - 1; i >= 0; i -= 1) {
    const question = currentDeck.questions[i];
    if (question && movedIds.has(question.id)) currentDeck.questions.splice(i, 1);
  }

  // Save the receiving deck first: if storage fails halfway, the question
  // stays in both decks rather than disappearing from the source.
  const targetOk = saveDeckQuestions(target);
  const sourceOk = saveDeckQuestions(currentDeck);
  if (!sourceOk || !targetOk) {
    restoreQuestions(currentDeck, sourceSnapshot);
    restoreQuestions(target, targetSnapshot);
    saveDeckQuestions(target);
    saveDeckQuestions(currentDeck);
    notifySaveFailure();
    return;
  }

  const modal = document.getElementById('moveQuestionsModal');
  if (modal) modal.classList.add('hidden');

  refreshDeckCounts();
  renderCollectionsTab();
  renderDecksList();
  renderQuestionsPreview();
  refreshCurrentDeckSession(currentDeck);

  const infoCountEl = document.getElementById('infoDeckCount');
  if (infoCountEl) infoCountEl.textContent = `${questionCountLabel(currentDeck.count || 0)} in this deck`;

  const suffix = skipped > 0
    ? ` ${skipped} duplicate${skipped === 1 ? '' : 's'} skipped.`
    : '';
  showToast(
    `Moved ${movedIds.size} ${movedIds.size === 1 ? 'question' : 'questions'} to "${target.name}".${suffix}`,
    'success',
  );
}

// Play Screen Event Listeners
function setupPlayScreenListeners() {
  const langPlayBtn = document.getElementById('langTogglePlay');
  const backBtn = document.getElementById('backBtn');
  const favBtn = document.getElementById('favoriteBtn');
  const favPlayBtn = document.getElementById('favoritesPlayBtn');
  const infoBtn = document.getElementById('infoBtn');
  const themeBtn = document.getElementById('themeBtn');
  const shuffleBtn = document.getElementById('shuffleBtn');
  const drawBtn = document.getElementById('drawBtn');
  const card = document.getElementById('card');

  if (langPlayBtn) langPlayBtn.addEventListener('click', toggleLanguagePlay);
  if (backBtn) backBtn.addEventListener('click', goBack);
  if (favBtn) favBtn.addEventListener('click', toggleFavorite);
  if (favPlayBtn) favPlayBtn.addEventListener('click', openFavoritesView);
  if (themeBtn) themeBtn.addEventListener('click', openThemeModal);
  if (shuffleBtn) shuffleBtn.addEventListener('click', shuffleDeck);
  if (drawBtn) drawBtn.addEventListener('click', drawNextCard);

  if (infoBtn) infoBtn.addEventListener('click', () => {
    if (!currentDeck) return;
    infoDeckId = currentDeck.id;
    document.getElementById('infoDeckName').textContent = currentDeck.name;
    document.getElementById('infoDeckDescription').textContent = currentDeck.description;
    document.getElementById('infoDeckCount').textContent = `${questionCountLabel(currentDeck.count || 0)} in this deck`;
    document.getElementById('deckInfoModal').classList.remove('hidden');

    // Wire up the Add Questions button
    const addQuestionsBtn = document.getElementById('addQuestionsToDeckBtn');
    if (addQuestionsBtn) {
      addQuestionsBtn.onclick = openAddQuestionsModal;
    }

    wireDeckCsvButton(currentDeck);
    wireDeckImportButton(currentDeck);

    // Wire up the Delete Deck button
    const deleteDeckBtn = document.getElementById('deleteDeckBtn');
    if (deleteDeckBtn) {
      if (currentDeck.isDefault || currentDeck.isHandmade || currentDeck.id === 'handmade') {
        deleteDeckBtn.style.display = 'none';
      } else {
        deleteDeckBtn.style.display = '';
        deleteDeckBtn.onclick = () => deleteDeck(currentDeck.id);
      }
    }
  });

  // Completion actions
  const completionShuffleBtn = document.getElementById('completionShuffleBtn');
  const completionRestartBtn = document.getElementById('completionRestartBtn');
  const completionBackBtn = document.getElementById('completionBackBtn');
  if (completionShuffleBtn) completionShuffleBtn.addEventListener('click', () => restartSession(true));
  if (completionRestartBtn) completionRestartBtn.addEventListener('click', () => restartSession(false));
  if (completionBackBtn) completionBackBtn.addEventListener('click', goBack);

  // Pointer gestures: drag to swipe, tap to flip.
  if (card) {
    card.addEventListener('pointerdown', handlePointerDown, false);
    card.addEventListener('pointermove', handlePointerMove, false);
    card.addEventListener('pointerup', handlePointerUp, false);
    card.addEventListener('pointercancel', handlePointerCancel, false);
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleCardFlip();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        animateSwipe('left');
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        animateSwipe('right');
      }
    });
  }
}

function toggleLanguagePlay() {
  currentLanguage = currentLanguage === 'en' ? 'tl' : 'en';
  setLanguage(currentLanguage);
  updateLanguageButtons();
  renderCardContent();
}
