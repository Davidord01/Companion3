/**
 * Cypress support file for E2E tests
 */

import './commands';
import 'cypress-file-upload';

// Hide fetch/XHR requests from command log
Cypress.on('window:before:load', (win) => {
  const originalFetch = win.fetch;
  win.fetch = function (...args) {
    return originalFetch.apply(this, args);
  };
});

// Global error handling
Cypress.on('uncaught:exception', (err, runnable) => {
  // Prevent Cypress from failing the test on uncaught exceptions
  // that we don't care about
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }
  return true;
});