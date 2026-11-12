// Copies the single-file build to the repository root so index.html opens directly from disk.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const built = await readFile(`${root}dist/index.html`, 'utf8');

if (/<script[^>]+src="\.\/assets\//.test(built) || /<link[^>]+href="\.\/assets\//.test(built)) {
  throw new Error('dist/index.html still references external bundles; the inline step did not run.');
}

const standalone = built
  .replace(/\s*<link rel="manifest"[^>]*>/, '')
  .replace(/(href|content)="\.\/icons\//g, '$1="./public/icons/');

await writeFile(`${root}index.html`, standalone);
console.log(`Standalone index.html written (${(standalone.length / 1024).toFixed(0)} KB).`);
