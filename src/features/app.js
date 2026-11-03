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

// Lucide icon SVG data
const iconSvgs = {
  'home': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  'book': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
  'heart': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
  'pencil': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
  'plus': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  'download': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
  'info': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  'arrow-left': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
  'arrow-right': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
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

// Capacitor Filesystem plugin (available on native Android/iOS)
let isNativePlatform = false;
try {
  if (window.Capacitor) {
    isNativePlatform = window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform();
    if (window.Capacitor.Plugins && window.Capacitor.Plugins.Filesystem) {
      CapacitorFilesystem = window.Capacitor.Plugins.Filesystem;
      console.log('Filesystem plugin found, native:', isNativePlatform);
    } else {
      console.log('Filesystem plugin not found in Capacitor.Plugins');
    }
  } else {
    console.log('Capacitor not available');
  }
} catch (e) {
  console.log('Filesystem plugin not available:', e);
}
// Temporary storage for deck details (filled before color selection)
let pendingDeckDetails = null;

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

export function initApp() {
  try {
    console.log('AnoNga app initializing...');

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
    ensureAllQuestionIds();

    // Setup event listeners
    setupEventListeners();
    setupPlayScreenListeners();

    // Render icons
    renderAllIcons();

    // Render home screen
    renderHomeScreen();

    console.log('App initialized successfully');
  } catch (error) {
    console.error('App initialization error:', error);
  }
}

function loadImportedDecks() {
  try {
    const imported = localStorage.getItem('anonga_imported_decks');
    if (imported) {
      const importedList = JSON.parse(imported);
      importedList.forEach(deck => {
        if (!allDecks.find(d => d.id === deck.id)) {
          allDecks.push(deck);
        }
      });
    }
  } catch (e) {
    console.error('Error loading imported decks:', e);
  }

  try {
    const custom = localStorage.getItem('anonga_custom_decks');
    if (custom) {
      const customList = JSON.parse(custom);
      customList.forEach(deck => {
        if (!allDecks.find(d => d.id === deck.id)) {
          allDecks.push(deck);
        }
      });
    }
  } catch (e) {
    console.error('Error loading custom decks:', e);
  }
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
  // Language toggles
  const langHomeBtn = document.getElementById('langToggleHome');
  if (langHomeBtn) langHomeBtn.addEventListener('click', toggleLanguageHome);

  // Tab navigation
  document.querySelectorAll('.tab-navigation .tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      switchTab(e.target.dataset.tab);
    });
  });

  // Collection tabs (filters)
  document.querySelectorAll('.collection-tabs .tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.collection-tabs .tab-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentCollection = e.target.dataset.collection;
      renderDecksList();
    });
  });

  // Collection cards (Favorites & Handmade)
  const favoritesCard = document.getElementById('favoritesCard');
  const handmadeCard = document.getElementById('handmadeCard');
  if (favoritesCard) favoritesCard.addEventListener('click', openFavoritesView);
  if (handmadeCard) handmadeCard.addEventListener('click', openHandmadeView);

  // Create deck button
  const createBtn = document.getElementById('createDeckBtn');
  if (createBtn) createBtn.addEventListener('click', openCreateDeckModal);

  // Modal close
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', closeModals);
  });

  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModals();
    });
  });
}

// Attach form listeners after modal is shown
function attachModalListeners() {
  // CSV import form
  const csvForm = document.getElementById('csvImportForm');
  if (csvForm) {
    csvForm.removeEventListener('submit', handleCsvImport);
    csvForm.addEventListener('submit', handleCsvImport);
  }

  // Manual create deck form
  const createForm = document.getElementById('createDeckForm');
  if (createForm) {
    createForm.removeEventListener('submit', handleCreateDeck);
    createForm.addEventListener('submit', handleCreateDeck);
  }

  // Deck details form (after CSV import)
  const detailsForm = document.getElementById('deckDetailsForm');
  if (detailsForm) {
    detailsForm.removeEventListener('submit', handleDeckDetails);
    detailsForm.addEventListener('submit', handleDeckDetails);
  }

  // Manual import button
  const manualBtn = document.getElementById('manualImportBtn');
  if (manualBtn) {
    manualBtn.removeEventListener('click', switchToManualAdd);
    manualBtn.addEventListener('click', switchToManualAdd);
  }

  // Add questions form
  const addQuestionsForm = document.getElementById('addQuestionsForm');
  if (addQuestionsForm) {
    addQuestionsForm.removeEventListener('submit', handleAddQuestion);
    addQuestionsForm.addEventListener('submit', handleAddQuestion);
  }
}

function methodBtnHandler(e) {
  switchCreationMethod(e.currentTarget.dataset.method);
}

function switchTab(tab) {
  currentTab = tab;

  // Update tab buttons
  document.querySelectorAll('.tab-navigation .tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });

  // Update tab content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });

  if (tab === 'decks') {
    document.getElementById('decksTab').classList.add('active');
  } else if (tab === 'collections') {
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
function showToast(message, type = 'info', duration = 3000) {
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

  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || 'ℹ'}</span>
    <span class="toast-message">${message}</span>
  `;

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

function deleteDeck(deckId) {
  const deck = allDecks.find(d => d.id === deckId);
  if (!deck) return;

  if (deck.isDefault) {
    showAlertModal({ title: 'Cannot Delete', message: 'Default decks cannot be deleted.', type: 'warning' });
    return;
  }

  showConfirmModal({
    title: 'Delete this deck?',
    description: `You're about to delete "${deck.name}".`,
    warning: 'This will permanently remove the deck and its questions. You can\'t undo this action.',
    confirmText: 'Delete deck',
    cancelText: 'Cancel',
    isDanger: true
  }).then((confirmed) => {
    if (!confirmed) return;

    // Remove from allDecks
    allDecks = allDecks.filter(d => d.id !== deckId);

    // Remove from localStorage
    const customDecks = allDecks.filter(d => d.id.startsWith('custom_'));
    localStorage.setItem('anonga_custom_decks', JSON.stringify(customDecks));

    // Remove theme
    const themeMap = JSON.parse(localStorage.getItem('anonga_deck_themes') || '{}');
    delete themeMap[deckId];
    localStorage.setItem('anonga_deck_themes', JSON.stringify(themeMap));

    // If currently playing this deck, go back
    if (currentDeck && currentDeck.id === deckId) {
      goBack();
    }

    closeModals();
    renderCollectionsTab();
    renderDecksList();
  }).catch((error) => {
    console.error('Delete failed:', error);
    showAlertModal({ title: 'Delete Failed', message: 'Failed to delete deck. Please try again.', type: 'error' });
  });
}

function renderCollectionsTab() {
  const customDecksList = document.getElementById('customDecksList');
  const customDecks = allDecks.filter(d => !d.isDefault);

  const html = customDecks.map(deck => `
    <div class="collection-card" data-deck-id="${deck.id}">
      <div class="card-icon icon-wrapper" data-icon="pencil"></div>
      <div class="card-text">
        <div class="card-title">${deck.name}</div>
        <div class="card-subtitle">${deck.count || 0} questions</div>
      </div>
      ${!deck.isDefault ? `<button class="collection-delete-btn" data-delete-id="${deck.id}" type="button" aria-label="Delete ${deck.name}"><span class="icon-wrapper" data-icon="trash"></span></button>` : ''}
    </div>
  `).join('');

  customDecksList.innerHTML = html || '<p style="grid-column: 1/-1; text-align: center; color: #999; padding: 40px;">No custom collections yet. Create one to get started!</p>';
  renderAllIcons();

  // Attach click listeners directly to delete buttons
  customDecksList.querySelectorAll('.collection-delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      const deckId = btn.dataset.deleteId;
      if (deckId) deleteDeck(deckId);
    });
  });

  // Attach click listeners to collection cards
  customDecksList.querySelectorAll('.collection-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't trigger if clicking delete button
      if (e.target.closest('.collection-delete-btn')) return;
      const deckId = card.dataset.deckId;
      if (deckId) window.viewDeckDetails(deckId);
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
}

function renderDecksList() {
  const list = document.getElementById('decksList');
  if (!list) {
    console.error('decksList element not found');
    return;
  }

  let visibleDecks = allDecks.filter(d => d.isDefault || !d.isDefault);
  if (currentCollection !== 'all') {
    visibleDecks = visibleDecks.filter(d => d.collection === currentCollection);
  }

  console.log('Rendering decks:', visibleDecks.length);

  const html = visibleDecks.map((deck, idx) => {
    const theme = getTheme(getDeckTheme(deck));
    return `
    <div class="deck-card" data-theme="${theme.id}" onclick="window.deckCardClick('${deck.id}')" style="background-color: ${deck.color};">
      <div class="deck-header">
        <div class="deck-number">KUMUSTAHAN ${String(idx + 1).padStart(2, '0')}</div>
        <div class="deck-count-badge">${deck.count || 0} questions</div>
      </div>
      <div class="deck-title-main">${deck.name}</div>
      <div class="deck-description">${deck.description}</div>
      <div class="deck-theme-tag">${theme.label}</div>
    </div>
  `;
  }).join('');

  list.innerHTML = html;
}

window.deckCardClick = function(deckId) {
  const deck = allDecks.find(d => d.id === deckId);
  if (deck) startDeckSession(deck);
};

window.viewDeckDetails = function(deckId) {
  const deck = allDecks.find(d => d.id === deckId);
  if (deck) {
    // Show info modal with delete option
    document.getElementById('infoDeckName').textContent = deck.name;
    document.getElementById('infoDeckDescription').textContent = deck.description;
    document.getElementById('infoDeckCount').textContent = `${deck.count || 0} questions in this deck`;
    document.getElementById('deckInfoModal').classList.remove('hidden');

    const addQuestionsBtn = document.getElementById('addQuestionsToDeckBtn');
    if (addQuestionsBtn) {
      addQuestionsBtn.onclick = () => {
        currentDeck = deck;
        openAddQuestionsModal();
      };
    }

    const deleteDeckBtn = document.getElementById('deleteDeckBtn');
    if (deleteDeckBtn) {
      if (deck.isDefault) {
        deleteDeckBtn.style.display = 'none';
      } else {
        deleteDeckBtn.style.display = '';
        deleteDeckBtn.onclick = () => deleteDeck(deck.id);
      }
    }

    // Also wire up play from modal
    const playBtn = document.getElementById('playDeckFromInfoBtn');
    if (playBtn) {
      playBtn.onclick = () => {
        closeModals();
        startDeckSession(deck);
      };
    }
  }
};

function openFavoritesView() {
  const favorites = getFavorites();
  // For now, we'll show in modal
  const favsList = document.getElementById('favoritesList');
  if (favsList) {
    if (favorites.length === 0) {
      favsList.innerHTML = '<div class="favorites-empty">No favorites yet. Heart questions while playing!</div>';
    } else {
      favsList.innerHTML = favorites.map(fav => `
        <div class="favorite-item">
          <div class="favorite-item-text">${fav.en}</div>
          <div class="favorite-item-lang">— ${fav.tl}</div>
        </div>
      `).join('');
    }
    document.getElementById('favoritesModal').classList.remove('hidden');
  }
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
      isHandmade: true,
    };
    allDecks.push(handmadeDeck);
  }

  // Load handmade questions from localStorage
  const handmadeQuestions = localStorage.getItem('anonga_handmade_questions');
  if (handmadeQuestions) {
    handmadeDeck.questions = JSON.parse(handmadeQuestions);
  }

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
  isFlipped = false;
  isAnimating = false;
  isShuffling = false;
  isComplete = false;

  hideCompletion(true);
  showPlayScreen();
  applyDeckTheme(deck);
  renderCardContent();
  updateDeckProgress();
  updateStack();
  updatePlayControls();
  playStageEntrance();
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

function toggleLongText(id, text) {
  const element = document.getElementById(id);
  if (!element) return;
  element.classList.toggle('is-long', text.length > 130);
  element.classList.toggle('is-xlong', text.length > 220);
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
    toggleLongText('questionText', '');
    toggleLongText('cardBackText', '');
    updateFavoriteButtonState();
    updatePlayControls();
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

  toggleLongText('questionText', front);
  toggleLongText('cardBackText', backText);
  updateFavoriteButtonState();
  updatePlayControls();
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
  if (isFavorited) {
    removeFavorite(question.id);
  } else {
    addFavorite(question);
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

  // Apply all --c-* variables to the preview card
  const props = ['--c-bg1', '--c-bg2', '--c-ink', '--c-muted', '--c-accent', '--c-accent-soft',
    '--c-btn1', '--c-btn2', '--c-line', '--c-shadow', '--c-back1', '--c-back2',
    '--c-back-ink', '--c-back-muted', '--c-back-glow', '--c-header', '--c-ornament', '--c-pattern', '--c-pattern-size'];
  for (const prop of props) {
    const val = computed.getPropertyValue(prop).trim();
    if (val) previewCard.style.setProperty(prop, val);
  }
  tempEl.remove();

  // Also update the play screen preview text color
  const front = document.getElementById('themePreviewFront');
  const back = document.getElementById('themePreviewBack');
  if (front) front.style.color = computed.getPropertyValue('--c-ink').trim();
  if (back) back.style.color = computed.getPropertyValue('--c-back-ink').trim();
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
      currentDeck.theme = pendingThemeId;
      saveDeckTheme(currentDeck.id, pendingThemeId);
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
  modal.classList.remove('hidden');

  // Reset to CSV import step (color selection is now the final step)
  document.getElementById('colorSelectStep').classList.remove('active');
  document.getElementById('csvImportStep').classList.add('active');
  document.getElementById('manualAddStep').classList.remove('active');
  document.getElementById('deckDetailsStep').classList.remove('active');

  // Reset all form inputs
  document.querySelectorAll('input[name="selectedColor"]').forEach(r => r.checked = false);
  selectedDeckColor = '#c9846f';

  // Category pill group (replaces dropdown - more reliable on Android)
  function setupCategoryPills(groupId, hiddenId) {
    const group = document.getElementById(groupId);
    const hidden = document.getElementById(hiddenId);
    if (!group || !hidden) return;

    // Prevent duplicate listeners
    if (group.dataset.initialized === 'true') return;
    group.dataset.initialized = 'true';

    group.querySelectorAll('.category-pill').forEach(pill => {
      pill.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const value = pill.dataset.value;
        hidden.value = value;
        group.querySelectorAll('.category-pill').forEach(p => {
          p.classList.toggle('selected', p.dataset.value === value);
        });
      });
    });
  }

  setupCategoryPills('deckCategoryGroup', 'deckCategory');
  setupCategoryPills('newDeckCollectionGroup', 'newDeckCollection');

  // Reset category on modal open
  const csvHidden = document.getElementById('deckCategory');
  if (csvHidden) csvHidden.value = '';
  const csvGroup = document.getElementById('deckCategoryGroup');
  if (csvGroup) {
    csvGroup.querySelectorAll('.category-pill').forEach(p => p.classList.remove('selected'));
  }

  const manualHidden = document.getElementById('newDeckCollection');
  if (manualHidden) manualHidden.value = '';
  const manualGroup = document.getElementById('newDeckCollectionGroup');
  if (manualGroup) {
    manualGroup.querySelectorAll('.category-pill').forEach(p => p.classList.remove('selected'));
  }

  // Set default color
  const defaultColorInput = document.getElementById('color1');
  if (defaultColorInput) {
    defaultColorInput.checked = true;
    updateColorPreview('#c9846f');
  }

  // Live preview on color change
  document.querySelectorAll('input[name="selectedColor"]').forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.checked) {
        selectedDeckColor = radio.value;
        updateColorPreview(radio.value);
      }
    });
  });

  // Attach Back button on color step
  const colorBackBtn = document.getElementById('colorBackBtn');
  if (colorBackBtn) {
    colorBackBtn.onclick = () => {
      document.getElementById('colorSelectStep').classList.remove('active');
      document.getElementById('deckDetailsStep').classList.add('active');
    };
  }

  // Attach Create Collection button on color step
  const colorCreateBtn = document.getElementById('colorCreateBtn');
  if (colorCreateBtn) {
    colorCreateBtn.onclick = () => {
      const selected = document.querySelector('input[name="selectedColor"]:checked');
      if (!selected) {
        showAlertModal({ title: 'Missing Selection', message: 'Please select a color.', type: 'warning' });
        return;
      }
      selectedDeckColor = selected.value;

      // Now create the deck using pendingDeckDetails
      if (!pendingDeckDetails) {
        showAlertModal({ title: 'Error', message: 'Missing deck details. Please start over.', type: 'error' });
        return;
      }

      const { name, description, category } = pendingDeckDetails;
      const deckId = `custom_${Date.now()}`;
      const questions = (window_importedQuestions || []).map((question, index) => ({
        ...question,
        id: `${deckId}_q${index}`,
      }));

      const newDeck = {
        id: deckId,
        name: name,
        description: description,
        collection: category,
        count: questions.length,
        questions,
        color: selectedDeckColor,
        theme: themeForCollection(category),
        isCustom: true
      };

      allDecks.push(newDeck);

      const customDecks = allDecks.filter(d => d.id.startsWith('custom_'));
      localStorage.setItem('anonga_custom_decks', JSON.stringify(customDecks));

      document.getElementById('createDeckForm').reset();
      closeModals();

      showToast(`Created collection: "${name}" with ${newDeck.count} questions`, 'success');
      renderDecksList();
      renderCollectionsTab();

      // Reset pending details
      pendingDeckDetails = null;
      window_importedQuestions = [];
    };
  }

  // Attach form listeners
  const csvForm = document.getElementById('csvImportForm');
  if (csvForm) {
    csvForm.onsubmit = handleCsvImport;
  }

  const manualBtn = document.getElementById('manualImportBtn');
  if (manualBtn) {
    manualBtn.onclick = switchToManualAdd;
  }

  const deckDetailsForm = document.getElementById('deckDetailsForm');
  if (deckDetailsForm) {
    deckDetailsForm.onsubmit = handleDeckDetails;
  }

  const createForm = document.getElementById('createDeckForm');
  if (createForm) {
    createForm.onsubmit = handleCreateDeck;
  }
}

function updateColorPreview(color) {
  const previewCard = document.getElementById('colorPreviewCard');
  if (!previewCard) return;

  // Set background gradient
  previewCard.style.background = `linear-gradient(135deg, ${color} 0%, ${darkenColor(color, 15)} 100%)`;
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

function openImportStep() {
  openCreateDeckModal();
  const firstColor = document.getElementById('color1');
  if (firstColor) firstColor.checked = true;
  selectedDeckColor = '#c9846f';
  updateColorPreview('#c9846f');
  document.getElementById('colorSelectStep').classList.remove('active');
  document.getElementById('csvImportStep').classList.add('active');
}


function closeModals() {
  document.getElementById('favoritesModal').classList.add('hidden');
  document.getElementById('deckInfoModal').classList.add('hidden');
  document.getElementById('themeModal').classList.add('hidden');
  document.getElementById('createDeckModal').classList.add('hidden');
  document.getElementById('addQuestionsModal').classList.add('hidden');
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

  // Check for duplicate deck name
  const existingDeck = allDecks.find(d => d.name.toLowerCase().trim() === name.toLowerCase().trim());
  if (existingDeck) {
    showAlertModal({ title: 'Duplicate Deck', message: 'A deck with this name already exists. Please choose a different name.', type: 'warning' });
    return;
  }

  // Store details temporarily - color selection is the final step
  pendingDeckDetails = { name, description, collection };

  // Go to color selection step (final step)
  document.getElementById('manualAddStep').classList.remove('active');
  document.getElementById('colorSelectStep').classList.add('active');

  // Update preview with the entered name
  const previewTitle = document.querySelector('.color-preview-title');
  if (previewTitle) previewTitle.textContent = name;

  // Reset color selection
  document.querySelectorAll('input[name="selectedColor"]').forEach(r => r.checked = false);
  const defaultColor = document.getElementById('color1');
  if (defaultColor) {
    defaultColor.checked = true;
    selectedDeckColor = defaultColor.value;
    updateColorPreview(selectedDeckColor);
  }
  return;
}

// Scan for CSV files on the device (Android/iOS)
async function scanForCsvFiles() {
  const csvFiles = [];
  
  if (!CapacitorFilesystem) {
    console.log('Filesystem plugin not available, falling back to file picker');
    return csvFiles;
  }
  
  // Request permissions first
  try {
    const permStatus = await CapacitorFilesystem.requestPermissions();
    console.log('Permission status:', JSON.stringify(permStatus));
    if (permStatus && permStatus.publicStorage === 'denied') {
      showAlertModal({ title: 'Permission Required', message: 'Storage permission is needed to scan for files. Please grant permission in settings.', type: 'warning' });
      return csvFiles;
    }
  } catch (e) {
    console.log('Permission request failed:', e);
  }
  
  try {
    // Try Documents directory first
    const docsResult = await CapacitorFilesystem.readdir({
      path: '',
      directory: 'DOCUMENTS'
    });
    
    if (docsResult && docsResult.files) {
      for (const file of docsResult.files) {
        if (file.type === 'file') {
          csvFiles.push({ name: file.name, path: file.name, directory: 'DOCUMENTS' });
        }
      }
    }
  } catch (e) {
    console.log('Could not read Documents directory:', e.message || e);
  }
  
  try {
    // Try ExternalStorage directory (Android 10 and below)
    const extResult = await CapacitorFilesystem.readdir({
      path: '',
      directory: 'EXTERNAL_STORAGE'
    });
    
    if (extResult && extResult.files) {
      for (const file of extResult.files) {
        if (file.type === 'file') {
          csvFiles.push({ name: file.name, path: file.name, directory: 'EXTERNAL_STORAGE' });
        }
        // Also check Downloads folder
        if (file.type === 'directory' && (file.name === 'Download' || file.name === 'Downloads')) {
          try {
            const dlResult = await CapacitorFilesystem.readdir({
              path: file.name,
              directory: 'EXTERNAL_STORAGE'
            });
            if (dlResult && dlResult.files) {
              for (const dlFile of dlResult.files) {
                if (dlFile.type === 'file') {
                  csvFiles.push({ name: dlFile.name, path: file.name + '/' + dlFile.name, directory: 'EXTERNAL_STORAGE' });
                }
              }
            }
          } catch (e) {
            console.log('Could not read Downloads folder:', e.message || e);
          }
        }
      }
    }
  } catch (e) {
    console.log('Could not read ExternalStorage directory:', e.message || e);
  }
  
  console.log('Found', csvFiles.length, 'files');
  return csvFiles;
}

// Show a modal with found CSV files
async function showCsvFilePicker() {
  const csvFiles = await scanForCsvFiles();
  
  if (csvFiles.length === 0) {
    showConfirmModal({
      title: 'No Files Found',
      description: 'No files found in Documents or Downloads folders.',
      warning: 'Would you like to browse for a file instead?',
      confirmText: 'Browse Files',
      cancelText: 'Cancel',
      isDanger: false
    }).then((confirmed) => {
      if (confirmed) {
        const fileInput = document.getElementById('csvFile');
        if (fileInput) fileInput.click();
      }
    });
    return;
  }
  
  // Show modal with found files
  let modal = document.getElementById('csvScanModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'csvScanModal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>Found ${csvFiles.length} File${csvFiles.length > 1 ? 's' : ''}</h2>
          <button class="modal-close" onclick="document.getElementById('csvScanModal').classList.add('hidden')">&times;</button>
        </div>
        <div id="csvScanList" style="max-height: 300px; overflow-y: auto;"></div>
        <div style="margin-top: 16px; display: flex; gap: 8px;">
          <button class="btn btn-secondary" onclick="document.getElementById('csvFile').click(); document.getElementById('csvScanModal').classList.add('hidden');">Browse Files</button>
          <button class="btn btn-ghost" onclick="document.getElementById('csvScanModal').classList.add('hidden')">Cancel</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  
  const list = document.getElementById('csvScanList');
  if (list) {
    list.innerHTML = csvFiles.map(f => `
      <div class="csv-scan-item" onclick="loadCsvFromDevice('${f.directory}', '${f.path}')" style="padding: 12px; border-bottom: 1px solid #eee; cursor: pointer; display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 20px;">📄</span>
        <span>${f.name}</span>
      </div>
    `).join('');
  }
  
  modal.classList.remove('hidden');
}

// Load a CSV file from the device filesystem
async function loadCsvFromDevice(directory, path) {
  if (!CapacitorFilesystem) return;
  
  try {
    const result = await CapacitorFilesystem.readFile({
      path: path,
      directory: directory,
      encoding: 'utf8'
    });
    
    const rows = parseCsv(result.data);
    if (rows.length < 2) {
      showAlertModal({ title: 'Invalid CSV', message: 'CSV file must have a header row and at least one question.', type: 'error' });
      return;
    }
    
    const questions = csvRowsToQuestions(rows);
    if (questions.length === 0) {
      showAlertModal({ title: 'No Questions Found', message: 'No valid questions found in CSV.', type: 'warning' });
      return;
    }
    
    window_importedQuestions = questions;
    document.getElementById('csvScanModal').classList.add('hidden');
    showDeckDetailsStep(questions.length);
  } catch (e) {
    showAlertModal({ title: 'Import Error', message: 'Error reading CSV file: ' + e.message, type: 'error' });
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

// Check if a question already exists in any deck (by en and tl text)
function isDuplicateQuestion(en, tl) {
  const normalizedEn = (en || '').trim().toLowerCase();
  const normalizedTl = (tl || '').trim().toLowerCase();
  if (!normalizedEn && !normalizedTl) return false;

  for (const deck of allDecks) {
    if (!deck.questions || !Array.isArray(deck.questions)) continue;
    for (const q of deck.questions) {
      const qEn = (q.en || '').trim().toLowerCase();
      const qTl = (q.tl || '').trim().toLowerCase();
      if (normalizedEn && qEn === normalizedEn) return true;
      if (normalizedTl && qTl === normalizedTl) return true;
    }
  }
  return false;
}

// Deduplicate an array of questions against all existing decks
function deduplicateQuestions(questions) {
  const seen = new Set();
  const result = [];
  for (const q of questions) {
    const key = ((q.en || '').trim().toLowerCase()) + '|' + ((q.tl || '').trim().toLowerCase());
    if (seen.has(key)) continue;
    if (isDuplicateQuestion(q.en, q.tl)) continue;
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
  document.getElementById('csvImportStep').classList.remove('active');
  document.getElementById('deckDetailsStep').classList.add('active');

  // Remove any existing import info message
  const detailsForm = document.getElementById('deckDetailsForm');
  if (detailsForm) {
    const existingInfo = detailsForm.querySelector('.import-info-msg');
    if (existingInfo) existingInfo.remove();
  }
}

function handleDeckDetails(e) {
  e.preventDefault();

  const name = document.getElementById('deckName').value.trim();
  const description = document.getElementById('deckDescription').value.trim();
  const category = document.getElementById('deckCategory').value;

  if (!name || !description || !category) {
    showAlertModal({ title: 'Missing Fields', message: 'Please fill in all fields.', type: 'warning' });
    return;
  }

  // Store details temporarily - color selection is the final step
  pendingDeckDetails = { name, description, category };

  // Go to color selection step (final step)
  document.getElementById('deckDetailsStep').classList.remove('active');
  document.getElementById('colorSelectStep').classList.add('active');

  // Update preview with the entered name
  const previewTitle = document.querySelector('.color-preview-title');
  if (previewTitle) previewTitle.textContent = name;

  // Reset color selection
  document.querySelectorAll('input[name="selectedColor"]').forEach(r => r.checked = false);
  const defaultColor = document.getElementById('color1');
  if (defaultColor) {
    defaultColor.checked = true;
    selectedDeckColor = defaultColor.value;
    updateColorPreview(selectedDeckColor);
  }
  return;
}

function switchToManualAdd() {
  document.getElementById('csvImportStep').classList.remove('active');
  document.getElementById('manualAddStep').classList.add('active');
}

function switchBackToCSVStep() {
  document.getElementById('manualAddStep').classList.remove('active');
  document.getElementById('csvImportStep').classList.add('active');
}

window.removeQuestion = function(questionId) {
  if (!currentDeck || !currentDeck.questions) return;

  showConfirmModal({
    title: 'Remove this question?',
    description: 'You are about to remove this question from the deck.',
    warning: 'This action cannot be undone.',
    confirmText: 'Remove',
    cancelText: 'Cancel',
    isDanger: true
  }).then((confirmed) => {
    if (!confirmed) return;

    currentDeck.questions = currentDeck.questions.filter(q => q.id !== questionId);
    currentDeck.count = currentDeck.questions.length;

    // Save to localStorage if it's a custom deck
    if (currentDeck.id.startsWith('custom_')) {
      const customDecks = allDecks.filter(d => d.id.startsWith('custom_'));
      localStorage.setItem('anonga_custom_decks', JSON.stringify(customDecks));
    }

    // Re-render preview
    renderQuestionsPreview();

    // Update count display
    const countEl = document.getElementById('infoDeckCount');
    if (countEl) {
      countEl.textContent = `${currentDeck.count || 0} questions in this deck`;
    }
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

  // Check for duplicate question
  if (isDuplicateQuestion(en, tl)) {
    showAlertModal({ title: 'Duplicate Question', message: 'This question already exists in a deck. Skipping.', type: 'warning' });
    document.getElementById('addQuestionsForm').reset();
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

  // Save to localStorage if it's a custom deck
  if (currentDeck.id.startsWith('custom_')) {
    const customDecks = allDecks.filter(d => d.id.startsWith('custom_'));
    localStorage.setItem('anonga_custom_decks', JSON.stringify(customDecks));
  }

  // Clear form
  document.getElementById('addQuestionsForm').reset();

  // Update preview
  renderQuestionsPreview();

  showToast(`Question added! Total: ${currentDeck.count} questions`, 'success');
}

function renderQuestionsPreview() {
  const preview = document.getElementById('deckQuestionsPreview');
  if (!currentDeck || !currentDeck.questions || currentDeck.questions.length === 0) {
    preview.innerHTML = '<div class="questions-empty">No questions yet</div>';
    return;
  }

  const html = currentDeck.questions.map((q, idx) => `
    <div class="question-item" style="margin-bottom: 12px; padding: 8px; background: #f5f5f5; border-radius: 4px; position: relative;">
      <button class="question-remove-btn" onclick="window.removeQuestion('${q.id}')" aria-label="Remove question" style="position: absolute; top: 4px; right: 4px; width: 20px; height: 20px; border-radius: 50%; border: none; background: rgba(184, 87, 122, 0.15); color: var(--accent-rose); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; line-height: 1;">&times;</button>
      <div style="font-weight: 600; font-size: 12px; color: #666; margin-bottom: 4px;">${idx + 1}.</div>
      <div style="font-size: 13px; margin-bottom: 4px; padding-right: 24px;">${q.en}</div>
      <div style="font-size: 13px; color: #666; font-style: italic; padding-right: 24px;">${q.tl}</div>
    </div>
  `).join('');

  preview.innerHTML = html;
}

function openAddQuestionsModal() {
  if (!currentDeck) {
    showAlertModal({ title: 'No Deck', message: 'Please select a deck first.', type: 'warning' });
    return;
  }

  document.getElementById('addQuestionsTitle').textContent = currentDeck.name;
  document.getElementById('addQuestionsModal').classList.remove('hidden');

  // Clear form
  document.getElementById('addQuestionsForm').reset();

  // Show current questions
  renderQuestionsPreview();

  attachModalListeners();
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
    document.getElementById('infoDeckName').textContent = currentDeck.name;
    document.getElementById('infoDeckDescription').textContent = currentDeck.description;
    document.getElementById('infoDeckCount').textContent = `${currentDeck.count || 0} questions in this deck`;
    document.getElementById('deckInfoModal').classList.remove('hidden');

    // Wire up the Add Questions button
    const addQuestionsBtn = document.getElementById('addQuestionsToDeckBtn');
    if (addQuestionsBtn) {
      addQuestionsBtn.onclick = openAddQuestionsModal;
    }

    // Wire up the Delete Deck button
    const deleteDeckBtn = document.getElementById('deleteDeckBtn');
    if (deleteDeckBtn) {
      if (currentDeck.isDefault) {
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
