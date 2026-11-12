import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(root, 'public');
const iconsDir = path.join(publicDir, 'icons');

await mkdir(iconsDir, { recursive: true });

const [iconSvg, maskableSvg] = await Promise.all([
  readFile(path.join(iconsDir, 'icon.svg')),
  readFile(path.join(iconsDir, 'maskable.svg')),
]);

const rasterTargets = [
  { source: iconSvg, name: 'icon-192.png', size: 192 },
  { source: iconSvg, name: 'icon-512.png', size: 512 },
  { source: iconSvg, name: 'apple-touch-icon.png', size: 180 },
  { source: iconSvg, name: 'favicon-32.png', size: 32 },
  { source: maskableSvg, name: 'maskable-512.png', size: 512 },
];

for (const target of rasterTargets) {
  await sharp(target.source, { density: 384 })
    .resize(target.size, target.size, { fit: 'contain' })
    .png({ compressionLevel: 9 })
    .toFile(path.join(iconsDir, target.name));
  console.log(`icons/${target.name}`);
}

const ogSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#111823" />
      <stop offset="0.62" stop-color="#0c1017" />
      <stop offset="1" stop-color="#0b0d12" />
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffd166" />
      <stop offset="1" stop-color="#f59e0b" />
    </linearGradient>
    <linearGradient id="logoBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1b2230" />
      <stop offset="1" stop-color="#0b0d12" />
    </linearGradient>
    <linearGradient id="screen" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1a2836" />
      <stop offset="0.55" stop-color="#0e141d" />
      <stop offset="1" stop-color="#1c160d" />
    </linearGradient>
    <radialGradient id="glowA" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#f59e0b" stop-opacity="0.3" />
      <stop offset="1" stop-color="#f59e0b" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="glowB" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#5eead4" stop-opacity="0.18" />
      <stop offset="1" stop-color="#5eead4" stop-opacity="0" />
    </radialGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)" />
  <circle cx="1060" cy="40" r="420" fill="url(#glowA)" />
  <circle cx="30" cy="620" r="360" fill="url(#glowB)" />

  <g opacity="0.045" stroke="#ffffff" stroke-width="1">
    <path d="M0 120h1200M0 240h1200M0 360h1200M0 480h1200" />
    <path d="M120 0v630M240 0v630M360 0v630M480 0v630M600 0v630M720 0v630M840 0v630M960 0v630M1080 0v630" />
  </g>

  <g transform="translate(80 64) scale(0.25)">
    <rect width="512" height="512" rx="112" fill="url(#logoBg)" />
    <rect x="8" y="8" width="496" height="496" rx="104" fill="none" stroke="#ffffff" stroke-opacity="0.09" stroke-width="4" />
    <path d="M206 172 340 256 206 340Z" fill="url(#accent)" />
    <rect x="112" y="372" width="288" height="24" rx="12" fill="#eef1f7" fill-opacity="0.92" />
    <rect x="112" y="412" width="190" height="24" rx="12" fill="#5eead4" fill-opacity="0.85" />
  </g>

  <text x="222" y="152" font-family="Segoe UI, Arial, sans-serif" font-size="52" font-weight="700" fill="#f7f9fc">NoxaPlus</text>
  <text x="80" y="332" font-family="Segoe UI, Arial, sans-serif" font-size="30" font-weight="700" letter-spacing="3" fill="#fbbf24">NOXAPLUS</text>
  <text x="80" y="408" font-family="Segoe UI, Arial, sans-serif" font-size="72" font-weight="800" fill="#eef1f7">Subtitle Studio</text>
  <text x="80" y="464" font-family="Segoe UI, Arial, sans-serif" font-size="27" fill="#b9c0ce">A Persian-first subtitle workbench that stays on your device.</text>

  <g font-family="Segoe UI, Arial, sans-serif" font-size="21" font-weight="600">
    <rect x="80" y="506" width="98" height="46" rx="23" fill="#f59e0b" fill-opacity="0.13" stroke="#f59e0b" stroke-opacity="0.4" />
    <text x="104" y="536" fill="#fbbf24">SRT</text>
    <rect x="190" y="506" width="138" height="46" rx="23" fill="#5eead4" fill-opacity="0.1" stroke="#5eead4" stroke-opacity="0.32" />
    <text x="214" y="536" fill="#5eead4">WebVTT</text>
    <rect x="340" y="506" width="178" height="46" rx="23" fill="#ffffff" fill-opacity="0.05" stroke="#ffffff" stroke-opacity="0.16" />
    <text x="364" y="536" fill="#d6dce8">100% local</text>
  </g>

  <g>
    <rect x="716" y="132" width="404" height="294" rx="22" fill="#121821" stroke="#ffffff" stroke-opacity="0.14" />
    <rect x="716" y="132" width="404" height="44" rx="22" fill="#171e29" />
    <rect x="716" y="154" width="404" height="22" fill="#171e29" />
    <circle cx="744" cy="154" r="5" fill="#ff6159" />
    <circle cx="762" cy="154" r="5" fill="#ffbd2e" />
    <circle cx="780" cy="154" r="5" fill="#28c840" />
    <text x="806" y="160" font-family="Segoe UI, Arial, sans-serif" font-size="14" fill="#8792a6">NoxaPlus Subtitle Studio</text>

    <rect x="738" y="198" width="360" height="180" rx="14" fill="url(#screen)" stroke="#ffffff" stroke-opacity="0.06" />
    <rect x="770" y="230" width="120" height="8" rx="4" fill="#ffffff" fill-opacity="0.14" />

    <rect x="842" y="318" width="152" height="32" rx="8" fill="#05070b" fill-opacity="0.6" />
    <text x="918" y="339" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="15" font-weight="600" fill="#ffffff">In context, always.</text>

    <rect x="738" y="398" width="360" height="5" rx="2.5" fill="#ffffff" fill-opacity="0.1" />
    <rect x="738" y="398" width="126" height="5" rx="2.5" fill="#f59e0b" />
    <circle cx="864" cy="400" r="6" fill="#fbbf24" />
    <text x="738" y="418" font-family="Segoe UI, Arial, sans-serif" font-size="11" fill="#8792a6">00:01:24</text>
    <text x="1098" y="418" text-anchor="end" font-family="Segoe UI, Arial, sans-serif" font-size="11" fill="#8792a6">CPS 16.4</text>
  </g>

  <g>
    <rect x="774" y="456" width="346" height="76" rx="18" fill="#151c27" stroke="#ffffff" stroke-opacity="0.12" />
    <circle cx="812" cy="494" r="17" fill="#f59e0b" fill-opacity="0.16" />
    <path d="M807 486l13 8-13 8z" fill="#fbbf24" />
    <text x="844" y="490" font-family="Segoe UI, Arial, sans-serif" font-size="16" font-weight="700" fill="#eef1f7">Clean SRT &amp; VTT exports</text>
    <text x="844" y="512" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="#8792a6">Quality checks · Persian fixes · Undo</text>
  </g>

  <text x="80" y="596" font-family="Segoe UI, Arial, sans-serif" font-size="17" fill="#6f7a8c">github.com/noxaplus-star/noxaplus-subtitle-studio</text>
</svg>
`;

await sharp(Buffer.from(ogSvg), { density: 144 })
  .resize(1200, 630)
  .png({ compressionLevel: 9 })
  .toFile(path.join(publicDir, 'og.png'));

console.log('og.png');
