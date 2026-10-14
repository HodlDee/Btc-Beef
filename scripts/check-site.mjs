import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const htmlFiles = readdirSync(root).filter(file => file.endsWith('.html'));
const documents = new Map(htmlFiles.map(file => [resolve(root, file), readFileSync(resolve(root, file), 'utf8')]));
const idsFor = html => new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
const checkedCss = new Set();
const localPath = (reference, source) => {
  const clean = decodeURIComponent(reference.split(/[?#]/)[0]);
  return clean.startsWith('/') ? resolve(root, `.${clean}`) : resolve(dirname(source), clean || source);
};
const checkReference = (reference, source) => {
  if (!reference || /^(?:[a-z]+:|\/\/)/i.test(reference)) return;
  const target = localPath(reference, source);
  const label = relative(root, source);
  if (!existsSync(target)) { errors.push(`Missing file ${reference} in ${label}`); return; }
  const hash = reference.split('#')[1];
  if (hash && documents.has(target) && !idsFor(documents.get(target)).has(decodeURIComponent(hash))) {
    errors.push(`Missing anchor ${reference} in ${label}`);
  }
  if (extname(target) === '.css' && !checkedCss.has(target)) {
    checkedCss.add(target);
    for (const match of readFileSync(target, 'utf8').matchAll(/url\(["']?([^"')]+)["']?\)/g)) checkReference(match[1], target);
  }
};
let totalIds = 0;
for (const [source, html] of documents) {
  const file = relative(root, source);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  const idSet = new Set(ids);
  totalIds += idSet.size;
  if (idSet.size !== ids.length) errors.push(`Duplicate ids in ${file}`);
  for (const match of html.matchAll(/\b(?:href|src|data-image)="([^"]+)"/g)) checkReference(match[1], source);
  for (const match of html.matchAll(/\bsrcset="([^"]+)"/g)) {
    for (const candidate of match[1].split(',')) checkReference(candidate.trim().split(/\s+/)[0], source);
  }
  const expectedCanonical = `https://btcbeef.com/${file === 'index.html' ? '' : file}`;
  if (!html.includes(`rel="canonical" href="${expectedCanonical}"`)) errors.push(`Missing production canonical in ${file}`);
  if (!html.includes('name="robots" content="index, follow"')) errors.push(`Missing production robots metadata in ${file}`);
  if (/class="preview-dock"|(?:href|src)="(?:previews\/|bold-dark\.html)|design preview/i.test(html)) errors.push(`Preview content remains in ${file}`);
  if ([...html.matchAll(/<h1\b/g)].length !== 1) errors.push(`Expected one page heading in ${file}`);
  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const data = JSON.parse(match[1]);
      if (data['@type'] === 'FAQPage' && !data.mainEntity.length) errors.push('FAQ schema is empty');
      const walk = value => {
        if (typeof value === 'string' && value.startsWith('https://btcbeef.com/')) checkReference(value.replace('https://btcbeef.com/', '/'), source);
        else if (Array.isArray(value)) value.forEach(walk);
        else if (value && typeof value === 'object') Object.values(value).forEach(walk);
      };
      walk(data);
    } catch (error) { errors.push(`Invalid structured data in ${file}: ${error.message}`); }
  }
}
const sitemap = readFileSync(resolve(root, 'sitemap.xml'), 'utf8');
for (const file of htmlFiles) {
  const url = `https://btcbeef.com/${file === 'index.html' ? '' : file}`;
  if (!sitemap.includes(`<loc>${url}</loc>`)) errors.push(`Missing sitemap entry for ${file}`);
}
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`Site checks passed: ${htmlFiles.length} pages, ${totalIds} unique ids, local links and assets, production metadata and structured data.`);
