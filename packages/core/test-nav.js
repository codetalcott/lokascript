/**
 * Enhanced Test Navigation Component
 * Comprehensive navigation for all HyperFixi test and demo pages
 * Version 2.0 - Includes all pages organized by category
 */

(function() {
  // Get current page for highlighting
  const currentPath = window.location.pathname;
  const currentFile = currentPath.split('/').pop() || 'index.html';

  // Define navigation structure with categories
  const navStructure = {
    primary: [
      {
        href: '/index.html',
        emoji: '🏠',
        title: 'Home',
        description: 'Main landing page',
        file: 'index.html'
      },
      {
        href: '/test-dashboard.html',
        emoji: '⚡',
        title: 'Quick Tests',
        description: '15 tests, <1 min',
        file: 'test-dashboard.html'
      },
      {
        href: '/src/compatibility/hyperscript-tests/test-runner.html',
        emoji: '📋',
        title: 'Full Suite',
        description: '51 comprehensive tests',
        file: 'test-runner.html'
      }
    ],
    demos: [
      {
        href: '/live-demo.html',
        emoji: '🎮',
        title: 'Live Demo',
        description: 'Interactive features',
        file: 'live-demo.html'
      },
      {
        href: '/compound-examples.html',
        emoji: '📝',
        title: 'Compound Examples',
        description: 'Advanced patterns',
        file: 'compound-examples.html'
      },
      {
        href: '/sortable-examples.html',
        emoji: '📑',
        title: 'Sortable Lists',
        description: 'Drag-to-reorder lists',
        file: 'sortable-examples.html'
      },
      {
        href: '/hyperfixi-demo.html',
        emoji: '🚀',
        title: 'HyperFixi Demo',
        description: 'Core capabilities',
        file: 'hyperfixi-demo.html'
      },
      {
        href: '/increment-decrement-demo.html',
        emoji: '➕➖',
        title: 'Inc/Dec Demo',
        description: 'Counter commands',
        file: 'increment-decrement-demo.html'
      },
      {
        href: '/secure-demo.html',
        emoji: '🔒',
        title: 'Secure Demo',
        description: 'CSP mode',
        file: 'secure-demo.html'
      }
    ],
    tests: [
      {
        href: '/src/tests/index.html',
        emoji: '📊',
        title: 'Modular Tests Hub',
        description: 'Test suite index',
        file: 'index.html'
      },
      {
        href: '/compatibility-test.html',
        emoji: '🔍',
        title: 'Compatibility',
        description: 'Side-by-side comparison',
        file: 'compatibility-test.html'
      },
      {
        href: '/official-test-suite.html',
        emoji: '📄',
        title: 'Official Suite',
        description: 'Redirects to runner',
        file: 'official-test-suite.html'
      }
    ],
    debug: [
      {
        href: '/debug/manual-test.html',
        emoji: '🔧',
        title: 'Manual Test',
        description: 'Quick API testing',
        file: 'manual-test.html'
      },
      {
        href: '/debug/minimal-set-test.html',
        emoji: '🎯',
        title: 'Minimal SET Test',
        description: 'SET command tests',
        file: 'minimal-set-test.html'
      },
      {
        href: '/debug/minimal-set-debug.html',
        emoji: '🐛',
        title: 'SET Debug',
        description: 'SET debugging',
        file: 'minimal-set-debug.html'
      },
      {
        href: '/debug/set-debug-simple.html',
        emoji: '🔍',
        title: 'Simple SET Debug',
        description: 'Basic SET tests',
        file: 'set-debug-simple.html'
      },
      {
        href: '/debug/hyperscript-api-test.html',
        emoji: '📡',
        title: 'API Test',
        description: 'API verification',
        file: 'hyperscript-api-test.html'
      }
    ]
  };

  // Helper to check if link is current
  function isCurrent(item) {
    return currentPath.endsWith(item.href) || currentFile === item.file;
  }

  // Generate nav section HTML
  function renderSection(title, items, collapsible = false) {
    const sectionId = title.replace(/\s+/g, '-').toLowerCase();
    const links = items.map(item => `
      <a href="${item.href}" class="hyperfixi-nav-link ${isCurrent(item) ? 'current' : ''}"
         title="${item.title} - ${item.description}">
        <span class="emoji">${item.emoji}</span>
        <span class="nav-text">
          ${item.title}
          <span class="description">${item.description}</span>
        </span>
      </a>
    `).join('');

    if (collapsible) {
      return `
        <details class="nav-section" ${title === 'Debug Tools' ? '' : 'open'}>
          <summary class="nav-section-title">${title}</summary>
          <div class="hyperfixi-nav-links">
            ${links}
          </div>
        </details>
      `;
    }

    return `
      <div class="nav-section">
        <h4 class="nav-section-title">${title}</h4>
        <div class="hyperfixi-nav-links">
          ${links}
        </div>
      </div>
    `;
  }

  // Create complete navigation HTML
  const navHTML = `
    <style>
      .hyperfixi-test-nav {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 20px;
        margin: -20px -20px 20px -20px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      .hyperfixi-test-nav h2 {
        color: white;
        margin: 0 0 15px 0;
        font-size: 18px;
        font-weight: 600;
      }
      .nav-section {
        margin-bottom: 15px;
      }
      .nav-section:last-child {
        margin-bottom: 0;
      }
      .nav-section-title {
        color: white;
        font-size: 13px;
        font-weight: 600;
        margin: 0 0 8px 0;
        opacity: 0.95;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      details.nav-section {
        background: rgba(255, 255, 255, 0.05);
        padding: 10px;
        border-radius: 6px;
      }
      details.nav-section summary {
        cursor: pointer;
        color: white;
        font-size: 13px;
        font-weight: 600;
        margin-bottom: 8px;
        opacity: 0.95;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        list-style-position: inside;
      }
      details.nav-section summary:hover {
        opacity: 1;
      }
      details.nav-section[open] summary {
        margin-bottom: 12px;
      }
      .hyperfixi-nav-links {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 8px;
      }
      .hyperfixi-nav-link {
        display: flex;
        align-items: center;
        padding: 10px 12px;
        background: rgba(255, 255, 255, 0.12);
        color: white;
        text-decoration: none;
        border-radius: 6px;
        transition: all 0.2s;
        font-weight: 500;
        font-size: 13px;
        border: 1px solid rgba(255, 255, 255, 0.15);
      }
      .hyperfixi-nav-link:hover {
        background: rgba(255, 255, 255, 0.22);
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      .hyperfixi-nav-link.current {
        background: rgba(40, 167, 69, 0.9);
        border-color: rgba(255, 255, 255, 0.4);
        cursor: default;
        font-weight: 600;
      }
      .hyperfixi-nav-link.current:hover {
        transform: none;
        box-shadow: none;
      }
      .hyperfixi-nav-link .emoji {
        margin-right: 8px;
        font-size: 16px;
        flex-shrink: 0;
      }
      .hyperfixi-nav-link .nav-text {
        flex: 1;
        min-width: 0;
      }
      .hyperfixi-nav-link .description {
        font-size: 10px;
        opacity: 0.85;
        display: block;
        margin-top: 2px;
        font-weight: 400;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      @media (max-width: 768px) {
        .hyperfixi-nav-links {
          grid-template-columns: 1fr;
        }
      }
    </style>
    <nav class="hyperfixi-test-nav">
      <h2>🧪 HyperFixi Test Infrastructure</h2>
      ${renderSection('⚡ Quick Access', navStructure.primary)}
      ${renderSection('🎮 Interactive Demos', navStructure.demos)}
      ${renderSection('🧪 Test Suites', navStructure.tests)}
      ${renderSection('🔧 Debug Tools', navStructure.debug, true)}
    </nav>
  `;

  // Inject navigation when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectNav);
  } else {
    injectNav();
  }

  function injectNav() {
    const body = document.body;
    if (body && !body.querySelector('.hyperfixi-test-nav')) {
      const navContainer = document.createElement('div');
      navContainer.innerHTML = navHTML;
      body.insertBefore(navContainer.firstElementChild, body.firstChild);
    }
  }
})();
