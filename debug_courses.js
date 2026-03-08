const puppeteer = require('puppeteer-core');
const fs = require('fs');

(async () => {
  let browser;
  try {
    // We can use the chromium bundled with puppeteer instead of puppeteer-core
    browser = await require('puppeteer').launch({ headless: 'new' });
    const page = await browser.newPage();
    
    page.on('console', msg => {
      console.log('CONSOLE:', msg.text());
    });

    page.on('response', async response => {
      const url = response.url();
      if (url.includes('/api/admin/')) {
        try {
          const text = await response.text();
          console.log(`[API Response] ${response.status()} ${url}: ${text.slice(0, 300)}`);
        } catch (e) {}
      }
    });

    page.on('pageerror', err => {
      console.error('PAGE ERROR:', err.toString());
    });

    console.log('Navigating to login...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
    
    await page.type('input[type="email"]', 'admin@nitk.ac.in');
    await page.type('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    
    console.log('Waiting for redirect...');
    await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(e => console.log('No nav event'));
    
    console.log('Current URL:', page.url());
    
    console.log('Navigating to courses...');
    await page.goto('http://localhost:5173/admin/courses', { waitUntil: 'networkidle2' });
    
    await page.waitForTimeout(3000); // let APIs finish
    
    // Check what is rendered on the page
    const html = await page.evaluate(() => document.querySelector('tbody')?.innerText || 'No tbody found');
    console.log('Rendered Table Content:', html);
    
    await browser.close();
  } catch (error) {
    console.error('Puppeteer Script Error:', error);
    if (browser) await browser.close();
  }
})();
