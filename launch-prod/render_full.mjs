import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const workDir = path.join(__dirname, 'full_render_work');
fs.mkdirSync(workDir, { recursive: true });

const deliverDir = path.resolve(__dirname, '..', 'deliver');
fs.mkdirSync(deliverDir, { recursive: true });

async function renderChunk(chunkIdx, startT, endT, browser) {
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 }
  });

  const htmlPath = 'file://' + path.join(__dirname, 'index.html');
  await page.goto(htmlPath);

  const chunkFramesDir = path.join(workDir, `chunk_${chunkIdx}_frames`);
  fs.mkdirSync(chunkFramesDir, { recursive: true });

  const chunkDuration = endT - startT;
  const numFinalFrames = Math.round(chunkDuration * 60);
  const totalSubframes = numFinalFrames * 4;

  console.log(`[Chunk ${chunkIdx}] Rendering ${totalSubframes} subframes (${startT.toFixed(1)}s to ${endT.toFixed(1)}s)...`);

  for (let s = 0; s < totalSubframes; s++) {
    // subT centred on frame time
    const frameIndexInChunk = Math.floor(s / 4);
    const subOffset = ((s % 4) - 1.5) / 240.0;
    const t = startT + (frameIndexInChunk / 60.0) + subOffset;

    await page.evaluate((currT) => window.seek(currT), Math.max(0, t));
    const subPath = path.join(chunkFramesDir, `sub_${String(s).padStart(5, '0')}.png`);
    await page.screenshot({ path: subPath });

    if (s > 0 && s % 240 === 0) {
      console.log(`[Chunk ${chunkIdx}] Subframe ${s}/${totalSubframes} (t=${t.toFixed(2)}s)...`);
    }
  }

  await page.close();

  const chunkMp4 = path.join(workDir, `chunk_${chunkIdx}.mp4`);
  console.log(`[Chunk ${chunkIdx}] Blending 4x subframes with tmix motion blur into 60fps video...`);

  // ffmpeg tmix motion blur pipeline from SKILL.md
  const tmixCmd = `ffmpeg -y -framerate 240 -i "${path.join(chunkFramesDir, 'sub_%05d.png')}" -vf "tmix=frames=4:weights='1 1 1 1',select='eq(mod(n\\,4)\\,3)',setpts=N/(60*TB),scale=out_color_matrix=bt709:out_range=tv,format=yuv420p" -r 60 -c:v libx264 -preset fast -crf 16 -color_primaries bt709 -color_trc bt709 -colorspace bt709 "${chunkMp4}"`;
  execSync(tmixCmd, { stdio: 'inherit' });

  // Clean up raw PNGs to preserve disk space
  fs.rmSync(chunkFramesDir, { recursive: true, force: true });
  console.log(`[Chunk ${chunkIdx}] Complete: ${chunkMp4}`);
  return chunkMp4;
}

async function main() {
  console.log('Starting full 60fps subframe motion blur render for Dark Pattern Detector...');
  const browser = await chromium.launch();

  const chunks = [
    { idx: 0, startT: 0.0, endT: 4.0 },
    { idx: 1, startT: 4.0, endT: 8.0 },
    { idx: 2, startT: 8.0, endT: 12.0 },
    { idx: 3, startT: 12.0, endT: 16.0 },
  ];

  const chunkFiles = [];
  for (const c of chunks) {
    const chunkPath = await renderChunk(c.idx, c.startT, c.endT, browser);
    chunkFiles.push(chunkPath);
  }

  await browser.close();

  // Create concat file
  const concatListPath = path.join(workDir, 'concat_list.txt');
  const concatContent = chunkFiles.map(f => `file '${f}'`).join('\n');
  fs.writeFileSync(concatListPath, concatContent);

  const concatenatedVideo = path.join(workDir, 'concat_video.mp4');
  console.log('Concatenating video chunks...');
  execSync(`ffmpeg -y -f concat -safe 0 -i "${concatListPath}" -c copy "${concatenatedVideo}"`, { stdio: 'inherit' });

  // Mux with master audio
  const masterAudio = path.join(__dirname, 'master_audio.wav');
  const finalMp4 = path.join(deliverDir, 'dark-pattern-detector-launch-1080p60.mp4');

  console.log('Muxing final 60fps video with stereo master audio...');
  const muxCmd = `ffmpeg -y -i "${concatenatedVideo}" -i "${masterAudio}" -c:v copy -c:a aac -b:a 256k -shortest "${finalMp4}"`;
  execSync(muxCmd, { stdio: 'inherit' });

  console.log(`\n========================================\nMASTER LAUNCH FILM READY:\n${finalMp4}\n========================================\n`);

  // Generate 1-per-second storyboard
  console.log('Generating 1-per-second storyboard...');
  const storyboardPath = path.join(deliverDir, 'storyboard-1fps.png');
  execSync(`ffmpeg -y -i "${finalMp4}" -vf "fps=1,scale=480:270,tile=4x4" "${storyboardPath}"`, { stdio: 'inherit' });

  // Key stills
  console.log('Extracting key stills...');
  const stills = [
    { t: '00:00:01.0', name: 'still-01-dropzone.jpg' },
    { t: '00:00:03.0', name: 'still-02-radar-scanner.jpg' },
    { t: '00:00:05.0', name: 'still-03-phone-specimen.jpg' },
    { t: '00:00:06.5', name: 'still-04-forensic-drop.jpg' },
    { t: '00:00:08.0', name: 'still-05-severity-slider.jpg' },
    { t: '00:00:10.0', name: 'still-06-tactics-cascade.jpg' },
    { t: '00:00:11.8', name: 'still-07-ethical-fix-toggle.jpg' },
    { t: '00:00:13.2', name: 'still-08-deception-odometer.jpg' },
    { t: '00:00:14.5', name: 'still-09-verified-clean-shield.jpg' },
    { t: '00:00:15.5', name: 'still-10-brand-wordmark.jpg' },
  ];

  for (const s of stills) {
    const outStill = path.join(deliverDir, s.name);
    execSync(`ffmpeg -y -ss ${s.t} -i "${finalMp4}" -frames:v 1 -q:v 2 "${outStill}"`, { stdio: 'inherit' });
  }

  console.log('All deliverables created in:', deliverDir);
}

main().catch(console.error);
