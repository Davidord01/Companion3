/**
 * E2E tests for video platform functionality
 */

describe('Video Platform', () => {
  beforeEach(() => {
    cy.visit('/');
    // Navigate to videos section
    cy.get('[data-cy="nav-videos"]').click();
  });

  describe('Authentication', () => {
    it('should show login prompt for unauthenticated users', () => {
      cy.get('[data-cy="auth-required"]').should('be.visible');
      cy.get('[data-cy="login-button"]').should('be.visible');
    });

    it('should allow user registration', () => {
      cy.get('[data-cy="login-button"]').click();
      cy.get('[data-cy="register-tab"]').click();
      
      cy.get('[data-cy="register-name"]').type('Test User');
      cy.get('[data-cy="register-lastname"]').type('Test Lastname');
      cy.get('[data-cy="register-email"]').type('test@example.com');
      cy.get('[data-cy="register-password"]').type('TestPassword123!');
      cy.get('[data-cy="register-country"]').select('España');
      
      cy.get('[data-cy="register-submit"]').click();
      
      // Should show success message
      cy.get('[data-cy="success-message"]').should('be.visible');
    });

    it('should allow user login', () => {
      cy.get('[data-cy="login-button"]').click();
      
      cy.get('[data-cy="login-email"]').type('test@example.com');
      cy.get('[data-cy="login-password"]').type('TestPassword123!');
      
      cy.get('[data-cy="login-submit"]').click();
      
      // Should redirect and show authenticated content
      cy.get('[data-cy="upload-section"]').should('be.visible');
    });
  });

  describe('Video Upload', () => {
    beforeEach(() => {
      // Login first
      cy.login('test@example.com', 'TestPassword123!');
    });

    it('should show upload interface for authenticated users', () => {
      cy.get('[data-cy="upload-toggle"]').click();
      cy.get('[data-cy="upload-container"]').should('be.visible');
    });

    it('should allow file upload', () => {
      cy.get('[data-cy="upload-toggle"]').click();
      
      // Select file upload mode
      cy.get('[data-cy="upload-mode-file"]').click();
      
      // Upload a test file
      const fileName = 'test-video.mp4';
      cy.fixture(fileName).then(fileContent => {
        cy.get('[data-cy="file-input"]').attachFile({
          fileContent: fileContent.toString(),
          fileName: fileName,
          mimeType: 'video/mp4'
        });
      });
      
      // Fill metadata
      cy.get('[data-cy="video-name"]').type('Test Video');
      cy.get('[data-cy="video-description"]').type('Test video description');
      
      // Submit upload
      cy.get('[data-cy="upload-submit"]').click();
      
      // Should show success message
      cy.get('[data-cy="upload-success"]').should('be.visible');
    });

    it('should allow YouTube URL addition', () => {
      cy.get('[data-cy="upload-toggle"]').click();
      
      // Select YouTube mode
      cy.get('[data-cy="upload-mode-youtube"]').click();
      
      // Enter YouTube URL
      cy.get('[data-cy="youtube-url"]').type('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      cy.get('[data-cy="youtube-name"]').type('Test YouTube Video');
      
      // Submit
      cy.get('[data-cy="youtube-submit"]').click();
      
      // Should show success message
      cy.get('[data-cy="upload-success"]').should('be.visible');
    });
  });

  describe('Video Player', () => {
    beforeEach(() => {
      cy.login('test@example.com', 'TestPassword123!');
    });

    it('should display video player when video is selected', () => {
      // Select first video
      cy.get('[data-cy="video-card"]').first().click();
      
      // Should show player
      cy.get('[data-cy="video-player"]').should('be.visible');
      cy.get('[data-cy="video-controls"]').should('be.visible');
    });

    it('should have functional video controls', () => {
      cy.get('[data-cy="video-card"]').first().click();
      
      // Test play/pause
      cy.get('[data-cy="play-button"]').click();
      cy.get('[data-cy="pause-button"]').should('be.visible');
      
      // Test volume control
      cy.get('[data-cy="volume-button"]').click();
      cy.get('[data-cy="volume-slider"]').should('be.visible');
      
      // Test fullscreen
      cy.get('[data-cy="fullscreen-button"]').click();
      // Note: Fullscreen testing might be limited in Cypress
    });
  });

  describe('Video Management', () => {
    beforeEach(() => {
      cy.login('test@example.com', 'TestPassword123!');
    });

    it('should allow video editing', () => {
      // Find user's own video
      cy.get('[data-cy="video-card"]').first().within(() => {
        cy.get('[data-cy="edit-button"]').click();
      });
      
      // Edit modal should appear
      cy.get('[data-cy="edit-modal"]').should('be.visible');
      
      // Change video name
      cy.get('[data-cy="edit-name"]').clear().type('Updated Video Name');
      
      // Save changes
      cy.get('[data-cy="edit-save"]').click();
      
      // Should show updated name
      cy.get('[data-cy="video-card"]').first().should('contain', 'Updated Video Name');
    });

    it('should allow video deletion', () => {
      // Count initial videos
      cy.get('[data-cy="video-card"]').then($cards => {
        const initialCount = $cards.length;
        
        // Delete first video
        cy.get('[data-cy="video-card"]').first().within(() => {
          cy.get('[data-cy="delete-button"]').click();
        });
        
        // Confirm deletion
        cy.get('[data-cy="confirm-delete"]').click();
        
        // Should have one less video
        cy.get('[data-cy="video-card"]').should('have.length', initialCount - 1);
      });
    });
  });

  describe('Search and Filtering', () => {
    it('should filter videos by search term', () => {
      cy.get('[data-cy="search-input"]').type('test');
      cy.get('[data-cy="search-button"]').click();
      
      // Should show filtered results
      cy.get('[data-cy="video-card"]').each($card => {
        cy.wrap($card).should('contain.text', 'test');
      });
    });

    it('should filter videos by type', () => {
      cy.get('[data-cy="type-filter"]').select('youtube');
      
      // Should show only YouTube videos
      cy.get('[data-cy="video-card"]').each($card => {
        cy.wrap($card).find('[data-cy="video-type-badge"]').should('contain', 'YouTube');
      });
    });

    it('should sort videos', () => {
      cy.get('[data-cy="sort-filter"]').select('nombre');
      
      // Should sort videos alphabetically
      cy.get('[data-cy="video-card"] [data-cy="video-title"]').then($titles => {
        const titles = Array.from($titles).map(el => el.textContent);
        const sortedTitles = [...titles].sort();
        expect(titles).to.deep.equal(sortedTitles);
      });
    });
  });

  describe('Responsive Design', () => {
    it('should work on mobile devices', () => {
      cy.viewport('iphone-x');
      
      // Navigation should be responsive
      cy.get('[data-cy="mobile-menu-toggle"]').should('be.visible');
      cy.get('[data-cy="mobile-menu-toggle"]').click();
      cy.get('[data-cy="mobile-menu"]').should('be.visible');
      
      // Video grid should stack on mobile
      cy.get('[data-cy="videos-grid"]').should('have.css', 'grid-template-columns', '1fr');
    });

    it('should work on tablet devices', () => {
      cy.viewport('ipad-2');
      
      // Should show appropriate layout for tablet
      cy.get('[data-cy="videos-grid"]').should('be.visible');
      cy.get('[data-cy="video-card"]').should('have.length.greaterThan', 0);
    });
  });
});

// Custom commands
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: { email, password }
  }).then(response => {
    localStorage.setItem('accessToken', response.body.accessToken);
    localStorage.setItem('userData', JSON.stringify(response.body.user));
  });
});

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
    }
  }
}