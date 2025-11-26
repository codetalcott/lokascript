import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

page.on('console', msg => {
  if (msg.type() === 'error' || msg.text().includes('Error')) {
    console.log('CONSOLE [' + msg.type() + ']:', msg.text());
  }
});

page.on('pageerror', err => {
  console.log('PAGE ERROR:', err.message);
});

await page.goto('http://localhost:5500/examples/advanced/02-draggable.html', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2500); // Wait longer for behavior to be registered and installed

// Wait for hyperscript:ready event
await page.evaluate(() => {
  return new Promise(resolve => {
    if (document.readyState === 'complete') {
      setTimeout(resolve, 500); // Extra delay
    } else {
      document.addEventListener('hyperscript:ready', () => setTimeout(resolve, 500));
    }
  });
});

// Test if Draggable behavior is installed and working
const result = await page.evaluate(() => {
  const item1 = document.querySelector('#item1');
  const titlebar = item1?.querySelector('.titlebar');

  if (!item1 || !titlebar) {
    return { success: false, error: 'Could not find item1 or titlebar' };
  }

  // Check if behavior is registered
  const hasBehavior = typeof _hyperscript !== 'undefined' &&
                      _hyperscript.behaviors?.has &&
                      _hyperscript.behaviors.has('Draggable');

  // Get initial position
  const style = window.getComputedStyle(item1);
  const initialLeft = parseInt(style.left) || 0;
  const initialTop = parseInt(style.top) || 0;

  // Simulate pointerdown on titlebar
  titlebar.dispatchEvent(new PointerEvent('pointerdown', {
    bubbles: true,
    clientX: 100,
    clientY: 100,
    pointerId: 1,
  }));

  // Check if draggable:start was triggered (should add .dragging class)
  const hasDraggingClass = item1.classList.contains('dragging');

  return {
    success: true,
    hasBehavior,
    hasDraggingClass,
    initialLeft,
    initialTop
  };
});

console.log('\n=== DRAGGABLE QUICK TEST ===\n');
console.log(JSON.stringify(result, null, 2));

if (result.hasBehavior && result.hasDraggingClass) {
  console.log('\n✅ Draggable behavior is working!');
} else if (result.hasBehavior && !result.hasDraggingClass) {
  console.log('\n⚠️  Behavior registered but draggable:start event not firing');
} else {
  console.log('\n❌ Draggable behavior not working');
}

await browser.close();
