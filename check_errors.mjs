import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request =>
    console.log('REQUEST FAILED:', request.url(), request.failure()?.errorText)
  );

  console.log('Navigating to https://technovalearning.com ...');
  await page.goto('https://technovalearning.com', { waitUntil: 'networkidle0', timeout: 30000 });
  
  console.log('Page loaded. Capturing screenshot just in case...');
  await page.screenshot({ path: 'screenshot.png' });
  
  await browser.close();
})();
