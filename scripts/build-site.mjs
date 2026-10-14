import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { dirname, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'dist');
// Only the checkout's generated dist directory may be replaced.
if (dirname(output) !== root || basename(output) !== 'dist') throw new Error('Unexpected build directory');
if (existsSync(output)) rmSync(output, { recursive: true, force: true });
mkdirSync(output);
for (const file of readdirSync(root).filter(file => file.endsWith('.html'))) cpSync(resolve(root, file), resolve(output, file));
for (const file of ['assets', 'CNAME', 'robots.txt', 'sitemap.xml']) cpSync(resolve(root, file), resolve(output, file), { recursive: true });
console.log(`Static production site built in ${output}; previews are excluded.`);
