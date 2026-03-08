const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.text().includes('Courses API Errors')) {
      console.log('CONSOLE:', msg.text());
    }
  });

  page.on('response', async response => {
    const url = response.url();
    if (url.includes('/api/admin/') || url.includes('/api/courses')) {
      try {
        const text = await response.text();
        console.log(`[API Response] ${response.status()} ${url}: ${text.slice(0, 500)}`);
      } catch (e) {}
    }
  });

  console.log('Navigating to login...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
  
  await page.type('input[type="email"]', 'admin@nitk.ac.in');
  await page.type('input[type="password"]', 'password123'); // assuming standard seed password works, let me try if it fails I'll check url
  await page.click('button[type="submit"]');
  
  console.log('Waiting for redirect...');
  await page.waitForTimeout(2000);
  
  if (page.url().includes('login')) {
    console.log('Trying with Admin@123...');
    await page.evaluate(() => document.querySelector('input[type="password"]').value = '');
    await page.type('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
  }

  console.log('Navigating to courses...');
  await page.goto('http://localhost:5173/admin/courses', { waitUntil: 'networkidle2' });
  
  await page.waitForTimeout(2000);
  
  await browser.close();
})();
