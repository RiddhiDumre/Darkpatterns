import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const snapsDir = path.join(__dirname, 'snaps');
fs.mkdirSync(snapsDir, { recursive: true });

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 }
  });

  const htmlPath = 'file://' + path.join(__dirname, 'index.html');
  await page.goto(htmlPath);

  // Take one snapshot per beat: t = k * 0.5s (0.5 to 15.5)
  const times = [];
  for (let t = 0.5; t <= 15.5; t += 0.5) {
    times.push(parseFloat(t.toFixed(2)));
  }

  console.log(`Rendering ${times.length} beat frames...`);

  for (let i = 0; i < times.length; i++) {
    const t = times[i];
    await page.evaluate((currT) => window.seek(currT), t);
    const snapPath = path.join(snapsDir, `beat_${String(i + 1).padStart(2, '0')}_t${t.toFixed(1)}s.png`);
    await page.screenshot({ path: snapPath });
  }

  await browser.close();
  console.log(`Saved ${times.length} snapshots to ${snapsDir}`);
}

main().catch(console.error);
