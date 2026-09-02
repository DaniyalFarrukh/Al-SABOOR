const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  console.log('Launching Puppeteer...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  console.log('Starting trace AFTER page load (waiting for idle)...');
  await page.tracing.start({ path: 'trace.json', screenshots: true });

  console.log('Waiting 10 seconds (2 slider rotations)...');
  await new Promise(r => setTimeout(r, 10000));

  console.log('Stopping trace...');
  await page.tracing.stop();
  await browser.close();

  // Basic trace analysis
  const trace = JSON.parse(fs.readFileSync('trace.json', 'utf8'));
  
  // Find long tasks > 50ms
  const longTasks = trace.traceEvents.filter(e => 
    e.name === 'RunTask' && e.ph === 'X' && e.dur > 50000
  );
  
  console.log(`Trace analysis complete!`);
  console.log(`Found ${longTasks.length} Long Tasks (>50ms) on Main Thread during the 10s idle window.`);
  
  if (longTasks.length > 2) {
    console.log('WARNING: The main thread is still busy!');
  } else {
    console.log('SUCCESS: The CPU is idling correctly.');
  }

})();
