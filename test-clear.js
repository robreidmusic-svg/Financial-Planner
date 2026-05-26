const puppeteer = require('puppeteer');

(async () => {
  console.log('Starting puppeteer...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));
  
  console.log('Navigating to localhost:3000...');
  await page.goto('http://localhost:3000');
  
  console.log('Clicking Settings tab...');
  // Find the settings tab. It has the text 'Settings'
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const settingsBtn = buttons.find(b => b.textContent.includes('Settings'));
    if (settingsBtn) settingsBtn.click();
  });
  
  await new Promise(r => setTimeout(r, 1000));
  
  console.log('Clicking wipe button...');
  // Automatically accept confirmation dialogs
  page.on('dialog', async dialog => {
    console.log('Dialog opened:', dialog.message());
    await dialog.accept();
  });
  
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const wipeBtn = buttons.find(b => b.textContent.includes('Wipe All Application Data'));
    if (wipeBtn) wipeBtn.click();
  });
  
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('Done test.');
  await browser.close();
})();
