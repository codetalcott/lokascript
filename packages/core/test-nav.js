/**
 * Shared Test Navigation Component
 * Inject this into any test page for consistent navigation
 */

(function() {
  // Get current page filename
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  // Define navigation items
  const navItems = [
    {
      href: 'test-dashboard.html',
      emoji: '⚡',
      title: 'Quick Dashboard',
      description: 'Fast validation (15 tests)',
      page: 'test-dashboard.html'
    },
    {
      href: 'official-test-suite.html',
      emoji: '📋',
      title: 'Official Suite',
      description: 'Comprehensive tests (51 tests)',
      page: 'official-test-suite.html'
    },
    {
      href: 'live-demo.html',
      emoji: '🎮',
      title: 'Live Demo',
      description: 'Interactive features',
      page: 'live-demo.html'
    },
    {
      href: 'compatibility-test.html',
      emoji: '🔍',
      title: 'Compatibility',
      description: 'Side-by-side comparison',
      page: 'compatibility-test.html'
    }
  ];

  // Create navigation HTML
  const navHTML = `
    <style>
      .hyperfixi-test-nav {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 15px 20px;
        margin: -20px -20px 20px -20px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      }
      .hyperfixi-test-nav h3 {
        color: white;
        margin: 0 0 12px 0;
        font-size: 14px;
        font-weight: 600;
        opacity: 0.95;
      }
      .hyperfixi-nav-links {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 8px;
      }
      .hyperfixi-nav-link {
        display: flex;
        align-items: center;
        padding: 10px 14px;
        background: rgba(255, 255, 255, 0.15);
        color: white;
        text-decoration: none;
        border-radius: 6px;
        transition: all 0.2s;
        font-weight: 500;
        font-size: 14px;
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
      .hyperfixi-nav-link:hover {
        background: rgba(255, 255, 255, 0.25);
        transform: translateY(-1px);
      }
      .hyperfixi-nav-link.current {
        background: rgba(255, 255, 255, 0.3);
        border-color: rgba(255, 255, 255, 0.5);
        cursor: default;
        font-weight: 600;
      }
      .hyperfixi-nav-link .emoji {
        margin-right: 8px;
        font-size: 16px;
      }
      .hyperfixi-nav-link .nav-text {
        flex: 1;
      }
      .hyperfixi-nav-link .description {
        font-size: 11px;
        opacity: 0.85;
        display: block;
        margin-top: 2px;
        font-weight: 400;
      }
    </style>
    <div class="hyperfixi-test-nav">
      <h3>📑 Test Pages</h3>
      <div class="hyperfixi-nav-links">
        ${navItems.map(item => `
          <a href="${item.href}" class="hyperfixi-nav-link ${currentPage === item.page ? 'current' : ''}">
            <span class="emoji">${item.emoji}</span>
            <span class="nav-text">
              ${item.title}
              <span class="description">${item.description}</span>
            </span>
          </a>
        `).join('')}
      </div>
    </div>
  `;

  // Inject navigation when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectNav);
  } else {
    injectNav();
  }

  function injectNav() {
    const body = document.body;
    if (body) {
      const navDiv = document.createElement('div');
      navDiv.innerHTML = navHTML;
      body.insertBefore(navDiv.firstElementChild, body.firstChild);
    }
  }
})();
