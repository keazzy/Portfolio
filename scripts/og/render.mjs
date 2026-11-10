/*
  Renders the link-preview video (og:video) and its still (og:image) from scripts/og/doodle.html.

    node scripts/og/render.mjs              → public/og/doodle.mp4 and public/og/doodle.png (then bump VERSION in src/lib/preview.ts)
    node scripts/og/render.mjs --serve      → the composition at http://127.0.0.1:4322/?play (or ?still) to look at it live
    node scripts/og/render.mjs --still      → only the still, for a quick look
    node scripts/og/render.mjs --still --at 4.5 --out some/dir   → one frame of the video, somewhere else

  No dependencies: it serves the composition on localhost, drives Google Chrome headless over the DevTools protocol
  (Node's own WebSocket), seeks the composition to each frame's time, screenshots it at 2x, and pipes the frames to
  ffmpeg, which scales them down to 1200×630 and encodes H.264. Needs Chrome (or CHROME=/path/to/chrome) and ffmpeg.

  The name's ink comes straight from src/lib/ink.ts (its types stripped by Node), so the video's ink is the site's.
*/
import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { stripTypeScriptTypes } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

// Node flags its type stripping as experimental; that's all this would print.
process.removeAllListeners('warning').on('warning', (w) => w.name !== 'ExperimentalWarning' && console.warn(w));

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../..');
const W = 1200, H = 630, SCALE = 2;

const { values: args } = parseArgs({
  options: {
    out: { type: 'string', default: join(ROOT, 'public/og') },
    name: { type: 'string', default: 'doodle' },
    fps: { type: 'string', default: '30' },
    crf: { type: 'string', default: '23' },
    serve: { type: 'boolean', default: false },
    still: { type: 'boolean', default: false },
    at: { type: 'string' },
    port: { type: 'string', default: '4322' },
  },
});

// The composition, the site's ink and the two faces, on one origin (Chrome won't load modules or fonts from file://).
const FILES = {
  '/': ['doodle.html', 'text/html'],
  '/ink.js': ['../../src/lib/ink.ts', 'text/javascript'],
  '/fonts/Fraunces.woff2': ['../../src/app/(site)/fonts/Fraunces.woff2', 'font/woff2'],
  '/fonts/Caveat.woff2': ['fonts/Caveat.woff2', 'font/woff2'],
};
const server = createServer(async (req, res) => {
  const file = FILES[new URL(req.url, 'http://x').pathname];
  if (!file) return res.writeHead(404).end();
  let body = await readFile(join(HERE, file[0]));
  if (file[0].endsWith('.ts')) body = stripTypeScriptTypes(body.toString());
  res.writeHead(200, { 'content-type': file[1], 'cache-control': 'no-store' }).end(body);
});
await new Promise((ok) => server.listen(args.serve ? +args.port : 0, '127.0.0.1', ok));
const origin = `http://127.0.0.1:${server.address().port}`;

if (args.serve) {
  console.log(`Playing at ${origin}/?play, the still at ${origin}/?still  (Ctrl-C to stop)`);
} else {
  await render();
  server.close();
}

async function render() {
  const chrome = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const profile = await mkdtemp(join(tmpdir(), 'og-chrome-'));
  const browser = spawn(chrome, [
    '--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check',
    '--hide-scrollbars', '--force-color-profile=srgb', '--mute-audio', 'about:blank',
  ], { stdio: ['ignore', 'ignore', 'pipe'] });
  try {
    const wsUrl = await new Promise((ok, fail) => {
      let err = '';
      browser.stderr.on('data', (d) => {
        err += d;
        const m = err.match(/DevTools listening on (ws:\/\/\S+)/);
        if (m) ok(m[1]);
      });
      browser.on('exit', () => fail(new Error(`Chrome exited before it was ready:\n${err}`)));
    });
    const pages = await (await fetch(`http://${new URL(wsUrl).host}/json/list`)).json();
    const page = await connect(pages.find((p) => p.type === 'page').webSocketDebuggerUrl);

    await page.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: SCALE, mobile: false });
    await page.send('Page.enable');
    const loaded = page.once('Page.loadEventFired');
    await page.send('Page.navigate', { url: `${origin}/` });
    await loaded;
    const evaluate = async (expression) => {
      const { result, exceptionDetails } = await page.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
      if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? exceptionDetails.text);
      return result.value;
    };
    // The composition sets window.ready once its fonts are in and it has laid itself out.
    const { duration } = await evaluate('new Promise((r) => { const c = () => (window.ready ? r(window.ready) : setTimeout(c, 50)); c(); })');

    // Each frame: set the composition to its time, let Chrome paint twice, take the picture.
    const shoot = async (t) => {
      await evaluate(`seek(${t}); new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))`);
      const { data } = await page.send('Page.captureScreenshot', { format: 'png' });
      return Buffer.from(data, 'base64');
    };

    await mkdir(args.out, { recursive: true });
    const mp4 = join(args.out, `${args.name}.mp4`), png = join(args.out, `${args.name}.png`);
    const fps = +args.fps, frames = args.still ? 0 : Math.round(duration * fps);
    if (frames) await video(mp4, fps, frames, shoot);

    // The still: the composition's own still (or a moment of it, with --at), scaled down the same way.
    const still = join(profile, 'still.png');
    if (args.at) await writeFile(still, await shoot(+args.at));
    else {
      await evaluate('still(); new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))');
      await writeFile(still, Buffer.from((await page.send('Page.captureScreenshot', { format: 'png' })).data, 'base64'));
    }
    await run('ffmpeg', ['-y', '-loglevel', 'error', '-i', still, '-vf', `scale=${W}:${H}:flags=lanczos`, png]);
    console.log(`${frames ? `Wrote ${mp4}\n` : ''}Wrote ${png}`);
    page.close();
  } finally {
    // Chrome may already be gone (by exit code or by signal); otherwise stop it and wait, then clear its profile.
    if (browser.exitCode === null && browser.signalCode === null) await new Promise((ok) => browser.once('exit', ok).kill());
    await rm(profile, { recursive: true, force: true, maxRetries: 5 });
  }
}

async function video(mp4, fps, frames, shoot) {
  const ffmpeg = spawn('ffmpeg', [
    '-y', '-loglevel', 'error', '-f', 'image2pipe', '-c:v', 'png', '-framerate', String(fps), '-i', '-',
    // Down from 2x with lanczos, into BT.709 limited range, tagged as such, so the paper stays the paper's colour.
    '-vf', `scale=${W}:${H}:flags=lanczos:out_color_matrix=bt709:out_range=tv,format=yuv420p`,
    '-c:v', 'libx264', '-preset', 'veryslow', '-crf', args.crf, '-profile:v', 'high', '-level', '4.0',
    '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
    '-movflags', '+faststart', '-an', mp4,
  ], { stdio: ['pipe', 'inherit', 'inherit'] });
  const encoded = new Promise((ok, fail) => ffmpeg.on('exit', (code) => (code ? fail(new Error(`ffmpeg exited ${code}`)) : ok())));
  for (let i = 0; i < frames; i++) {
    const frame = await shoot(i / fps);
    if (!ffmpeg.stdin.write(frame)) await new Promise((ok) => ffmpeg.stdin.once('drain', ok));
    if (process.stdout.isTTY) process.stdout.write(`\rframe ${i + 1}/${frames}`);
  }
  ffmpeg.stdin.end();
  await encoded;
  if (process.stdout.isTTY) process.stdout.write('\n');
}

// A minimal DevTools protocol client.
function connect(url) {
  const ws = new WebSocket(url);
  let id = 0;
  const pending = new Map(), waiting = new Map();
  ws.onmessage = ({ data }) => {
    const m = JSON.parse(data);
    if (m.id && pending.has(m.id)) {
      const { ok, fail } = pending.get(m.id);
      pending.delete(m.id);
      if (m.error) fail(new Error(`${m.error.message} ${m.error.data ?? ''}`));
      else ok(m.result);
    } else if (m.method && waiting.has(m.method)) {
      waiting.get(m.method)(m.params);
      waiting.delete(m.method);
    }
  };
  return new Promise((ready) => {
    ws.onopen = () => ready({
      send: (method, params = {}) => new Promise((ok, fail) => {
        pending.set(++id, { ok, fail });
        ws.send(JSON.stringify({ id, method, params }));
      }),
      once: (method) => new Promise((ok) => waiting.set(method, ok)),
      close: () => ws.close(),
    });
  });
}

function run(cmd, argv) {
  return new Promise((ok, fail) => spawn(cmd, argv, { stdio: 'inherit' }).on('exit', (code) => (code ? fail(new Error(`${cmd} exited ${code}`)) : ok())));
}
