import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const framesDir = path.join(__dirname, 'draft_frames');
fs.mkdirSync(framesDir, { recursive: true });

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 }
  });

  const htmlPath = 'file://' + path.join(__dirname, 'index.html');
  await page.goto(htmlPath);

  const fps = 30;
  const duration = 16.0;
  const totalFrames = Math.floor(fps * duration);

  console.log(`Rendering ${totalFrames} draft frames at ${fps} fps...`);

  for (let i = 0; i < totalFrames; i++) {
    const t = i / fps;
    await page.evaluate((currT) => window.seek(currT), t);
    const framePath = path.join(framesDir, `frame_${String(i).padStart(5, '0')}.png`);
    await page.screenshot({ path: framePath });
    if (i % 60 === 0) {
      console.log(`Frame ${i}/${totalFrames} (t=${t.toFixed(2)}s)...`);
    }
  }

  await browser.close();
  console.log('Frames captured. Encoding draft preview MP4...');

  const audioPath = path.join(__dirname, 'master_audio.wav');
  const outMp4 = path.join(__dirname, 'draft_preview.mp4');

  const ffmpegCmd = `ffmpeg -y -framerate ${fps} -i "${path.join(framesDir, 'frame_%05d.png')}" -i "${audioPath}" -c:v libx264 -preset veryfast -pix_fmt yuv420p -c:a aac -b:a 192k -shortest "${outMp4}"`;
  execSync(ffmpegCmd, { stdio: 'inherit' });

  console.log(`Draft video ready: ${outMp4}`);
}

main().catch(console.error);
