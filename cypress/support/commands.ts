/**
 * Custom Cypress commands
 */

/// <reference types="cypress" />

Cypress.Commands.add('getByTestId', (testId: string) => {
  return cy.get(`[data-cy="${testId}"]`);
});

Cypress.Commands.add('loginViaAPI', (email: string, password: string) => {
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: { email, password }
  }).then(response => {
    window.localStorage.setItem('accessToken', response.body.accessToken);
    window.localStorage.setItem('userData', JSON.stringify(response.body.user));
  });
});

Cypress.Commands.add('uploadFile', (fileName: string, fileType: string = 'video/mp4') => {
  cy.fixture(fileName).then(fileContent => {
    cy.get('input[type="file"]').attachFile({
      fileContent: fileContent.toString(),
      fileName: fileName,
      mimeType: fileType
    });
  });
});

declare global {
  namespace Cypress {
    interface Chainable {
      getByTestId(testId: string): Chainable<JQuery<HTMLElement>>;
      loginViaAPI(email: string, password: string): Chainable<void>;
      uploadFile(fileName: string, fileType?: string): Chainable<void>;
    }
  }
}