import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  let errors = [];
  page.on('pageerror', err => {
    errors.push('PAGE_ERROR: ' + err.message);
  });
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push('CONSOLE_ERROR: ' + msg.text());
    }
  });

  await page.goto('http://localhost:5173');
  
  // Wait for the UI to load
  await new Promise(r => setTimeout(r, 2000));

  // Find Lịch button
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('Lịch')) {
      await btn.click();
      break;
    }
  }

  await new Promise(r => setTimeout(r, 2000));
  
  if (errors.length > 0) {
    console.log("ERRORS FOUND:");
    console.log(errors.join('\n'));
  } else {
    console.log("No errors found. HTML:");
    const html = await page.evaluate(() => document.body.innerHTML);
    console.log(html.substring(0, 1000));
  }
  
  await browser.close();
})();
