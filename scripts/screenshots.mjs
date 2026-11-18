import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE_URL = process.argv[2] || 'http://localhost:5173';

const pages = [
  { id: '01', name: '01-trade-overview' },
  { id: '02', name: '02-area-analysis' },
  { id: '03', name: '03-product-analysis' },
  { id: '04', name: '04-trade-balance' },
  { id: '05', name: '05-data-quality' },
  { id: '06', name: '06-quantity-analysis' },
  { id: '07', name: '07-growth-and-share' },
  { id: '08', name: '08-trade-composition' },
  { id: '09', name: '09-area-trade-position' },
  { id: '10', name: '10-import-analysis' },
  { id: '11', name: '11-area-trends' },
  { id: '12', name: '12-product-deep-dive' },
];

const screenshotsDir = path.resolve('screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

let browser;
try {
  browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 2,
  });

  const firstUrl = `${BASE_URL.replace(/\/+$/, '')}/#/01`;
  await page.goto(firstUrl, { waitUntil: 'networkidle' });

  for (const p of pages) {
    await page.evaluate((hash) => {
      window.location.hash = hash;
    }, `#/${p.id}`);

    await page.waitForTimeout(1200);

    const outPath = path.join(screenshotsDir, `${p.name}.png`);
    await page.screenshot({ path: outPath, fullPage: true });
    console.log(`Saved screenshot: ${outPath}`);
  }
} finally {
  if (browser) {
    await browser.close();
  }
}
