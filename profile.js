const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

  console.log('Starting trace...');
  await browser.startTracing(page, { path: 'trace.json', screenshots: true });

  console.log('Navigating to http://localhost:3000...');
  
  const startTime = Date.now();
  let navigationFinished = false;
  
  try {
    // Wait for networkidle, but with a timeout
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 15000 });
    navigationFinished = true;
    console.log(`Navigation finished in ${Date.now() - startTime}ms`);
  } catch (err) {
    console.log(`Navigation timed out or failed after ${Date.now() - startTime}ms:`, err.message);
  }

  // Wait 5 more seconds just to capture any runaway loops
  console.log('Waiting 5 more seconds...');
  await page.waitForTimeout(5000);

  console.log('Stopping trace...');
  await browser.stopTracing();
  
  await browser.close();
  
  const trace = JSON.parse(fs.readFileSync('trace.json', 'utf8'));
  console.log(`Trace captured ${trace.traceEvents.length} events.`);
  
  // Check for long tasks
  const longTasks = trace.traceEvents.filter(e => e.name === 'RunTask' && e.dur > 50000); // > 50ms
  console.log(`Found ${longTasks.length} long tasks.`);
  
})();
