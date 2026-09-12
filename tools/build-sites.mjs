import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const hosting = join(root, '.openai', 'hosting.json');
if (!existsSync(hosting)) throw new Error('Register the Site before building.');
const manifest = JSON.parse(readFileSync(hosting, 'utf8'));
if (typeof manifest.project_id !== 'string' || !manifest.project_id) {
  throw new Error('The Site project_id is missing.');
}
const output = join(root, 'dist');
mkdirSync(join(output, 'server'), { recursive: true });
mkdirSync(join(output, '.openai'), { recursive: true });
for (const [source, target] of [
  ['worker.mjs', 'index.js'],
  ['transform.mjs', 'transform.mjs'],
  ['openapi.mjs', 'openapi.mjs'],
]) {
  copyFileSync(join(root, 'src', source), join(output, 'server', target));
}
writeFileSync(join(output, '.openai', 'hosting.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log('Prepared the unchanged Worker modules and Sites hosting manifest.');
