import { initApp } from './features/app.js';

// Bundled fonts (offline-first): no runtime Google Fonts request.
import '@fontsource/fraunces/400.css';
import '@fontsource/fraunces/700.css';
import '@fontsource/manrope/400.css';
import '@fontsource/manrope/500.css';
import '@fontsource/manrope/600.css';
import '@fontsource/manrope/700.css';
import '@fontsource/manrope/800.css';

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
