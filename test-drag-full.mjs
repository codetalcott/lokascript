import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: false }); // Show browser for debugging
const page = await browser.newPage();

page.on('console', msg => {
  const text = msg.text();
  if (msg.type() === 'error' || text.includes('Error') || text.includes('DEBUG')) {
    console.log('CONSOLE [' + msg.type() + ']:', text);
  }
});

page.on('pageerror', err => {
  console.log('PAGE ERROR:', err.message);
});

console.log('Opening draggable example...');
await page.goto('http://localhost:3000/examples/advanced/02-draggable.html', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);

// Get initial position
const initialPos = await page.evaluate(() => {
  const item1 = document.querySelector('#item1');
  const style = window.getComputedStyle(item1);
  return {
    left: parseInt(style.left) || 0,
    top: parseInt(style.top) || 0
  };
});
console.log('Initial position:', initialPos);

// Get the titlebar element and perform a real drag
const titlebar = page.locator('#item1 .titlebar');
const boundingBox = await titlebar.boundingBox();

if (boundingBox) {
  const startX = boundingBox.x + boundingBox.width / 2;
  const startY = boundingBox.y + boundingBox.height / 2;
  const endX = startX + 100;
  const endY = startY + 50;

  console.log(`Dragging from (${startX}, ${startY}) to (${endX}, ${endY})`);

  // Use Playwright's drag and drop
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.waitForTimeout(100);
  
  // Move in steps
  for (let i = 1; i <= 10; i++) {
    const x = startX + (endX - startX) * (i / 10);
    const y = startY + (endY - startY) * (i / 10);
    await page.mouse.move(x, y);
    await page.waitForTimeout(20);
  }
  
  await page.mouse.up();
  await page.waitForTimeout(500);

  // Check final position
  const finalPos = await page.evaluate(() => {
    const item1 = document.querySelector('#item1');
    const style = window.getComputedStyle(item1);
    return {
      left: parseInt(style.left) || 0,
      top: parseInt(style.top) || 0,
      hasDraggingClass: item1.classList.contains('dragging')
    };
  });

  console.log('Final position:', finalPos);
  console.log('Position changed:', finalPos.left !== initialPos.left || finalPos.top !== initialPos.top);

  if (finalPos.left !== initialPos.left || finalPos.top !== initialPos.top) {
    console.log('✅ DRAG SUCCESSFUL - Element moved!');
  } else {
    console.log('❌ DRAG FAILED - Element did not move');
  }
} else {
  console.log('Could not find titlebar bounding box');
}

// Keep browser open for 3 seconds to observe
await page.waitForTimeout(3000);
await browser.close();
