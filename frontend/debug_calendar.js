import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('pageerror', err => {
    console.log('Page error: ', err.message);
  });
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('Console error: ', msg.text());
    }
  });

  await page.goto('http://localhost:5173');
  
  // Wait for the calendar tab button and click it
  await page.waitForSelector('button');
  
  const buttons = await page.$$('button');
  let clicked = false;
  for (const button of buttons) {
    const text = await page.evaluate(el => el.textContent, button);
    if (text && text.includes('Lịch')) {
      console.log('Clicking Calendar tab...');
      await button.click();
      clicked = true;
      break;
    }
  }

  if (!clicked) {
    console.log('Could not find Lịch tab');
  }

  // Wait a bit to see if there are errors
  await new Promise(r => setTimeout(r, 2000));
  
  await page.screenshot({ path: 'screenshot.png' });
  console.log('Screenshot saved to screenshot.png');
  
  await browser.close();
})();
