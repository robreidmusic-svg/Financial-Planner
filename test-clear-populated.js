const puppeteer = require('puppeteer');

(async () => {
  console.log('Starting puppeteer...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('BROWSER ERROR:', msg.text());
  });
  page.on('pageerror', err => console.log('BROWSER EXCEPTION:', err.toString()));
  
  console.log('Navigating to localhost:3000...');
  await page.goto('http://localhost:3000');
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('Clicking Settings tab...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const settingsBtn = buttons.find(b => b.textContent.includes('Settings'));
    if (settingsBtn) settingsBtn.click();
  });
  
  await new Promise(r => setTimeout(r, 1000));
  
  console.log('Loading Demo Data first to populate state...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const loadBtn = buttons.find(b => b.textContent.includes('Load Demo Database'));
    if (loadBtn) loadBtn.click();
  });
  
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('Clicking wipe button...');
  page.on('dialog', async dialog => {
    await dialog.accept();
  });
  
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const wipeBtn = buttons.find(b => b.textContent.includes('Wipe All Application Data'));
    if (wipeBtn) wipeBtn.click();
  });
  
  await new Promise(r => setTimeout(r, 3000));
  
  console.log('Done test.');
  await browser.close();
})();
