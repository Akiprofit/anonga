import { initApp } from './features/app.js';

console.log('main.js loaded, document.readyState:', document.readyState);

// Initialize the app when DOM is ready
if (document.readyState === 'loading') {
  console.log('DOM still loading, waiting for DOMContentLoaded');
  document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded fired');
    initApp();
  });
} else {
  console.log('DOM already ready, calling initApp');
  initApp();
}
