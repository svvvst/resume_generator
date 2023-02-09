const fs = require('fs');
const cfg = require('./cfg.json');
const puppeteer = require('puppeteer');

async function generatePDF(html,pdfProperties) 
{
  const browser = await puppeteer.launch({
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
  const page = await browser.newPage();
  await page.setContent(html);
  const pdf = await page.pdf(pdfProperties);

  await browser.close();
}

const html = fs.readFileSync(cfg.saveas).toString();

generatePDF( html, { path: cfg.pdf.saveas, format: 'Letter', printBackground: true });

console.log('Document saved to: ' + cfg.pdf.saveas);
