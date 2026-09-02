const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  
  // Create a mobile viewport context
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
  });
  
  const page = await context.newPage();

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

  console.log('Starting trace...');
  await browser.startTracing(page, { path: 'trace_mobile.json', screenshots: false });

  console.log('Navigating to http://localhost:3000...');
  
  const startTime = Date.now();
  let navigationFinished = false;
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 15000 });
    navigationFinished = true;
    console.log(`Navigation finished in ${Date.now() - startTime}ms`);
  } catch (err) {
    console.log(`Navigation timed out or failed after ${Date.now() - startTime}ms:`, err.message);
  }

  console.log('Waiting 3 more seconds to capture layout thrashing...');
  await page.waitForTimeout(3000);

  console.log('Stopping trace...');
  await browser.stopTracing();
  await browser.close();
  
  const trace = JSON.parse(fs.readFileSync('trace_mobile.json', 'utf8'));
  console.log(`Trace captured ${trace.traceEvents.length} events.`);
  
  const layoutEvents = trace.traceEvents.filter(e => e.name === 'Layout');
  const paintEvents = trace.traceEvents.filter(e => e.name === 'Paint');
  const styleEvents = trace.traceEvents.filter(e => e.name === 'UpdateLayoutTree');
  const timerEvents = trace.traceEvents.filter(e => e.name === 'TimerFire');
  const animationEvents = trace.traceEvents.filter(e => e.name === 'Animation');
  
  console.log(`Layout Events: ${layoutEvents.length}`);
  console.log(`Paint Events: ${paintEvents.length}`);
  console.log(`Style Calc Events: ${styleEvents.length}`);
  console.log(`Timer Fire Events: ${timerEvents.length}`);
  
  // Let's count how many style recalculations happened in the last 2 seconds of the trace
  // (which would indicate continuous activity)
  const maxTs = Math.max(...trace.traceEvents.map(e => e.ts || 0));
  const lateEvents = styleEvents.filter(e => e.ts > (maxTs - 2000000)); // last 2 seconds
  console.log(`Style Calcs in last 2 seconds: ${lateEvents.length}`);
  
  // Find which elements are causing layout shifts or continuous updates
  const continuousLayouts = layoutEvents.filter(e => e.ts > (maxTs - 2000000));
  console.log(`Layouts in last 2 seconds: ${continuousLayouts.length}`);

})();
