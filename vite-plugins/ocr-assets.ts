// Serves tesseract.js's worker script, wasm core and English traineddata from our own origin,
// unhashed and side by side under /ocr/. This matters because tesseract.js-core's emscripten glue
// resolves its .wasm sibling relative to the *worker script's own URL* (self.location.href inside
// a dedicated worker) rather than the core .js file's URL, so the worker and its core files must
// live in the same directory with stable names for that lookup to succeed.
import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { serveAssets } from './serve-assets.ts';

const require = createRequire(import.meta.url);

// [published name, package.json to resolve the package root from, path within that package]
const FILES: [name: string, pkg: string, path: string][] = [
  ['worker.min.js', 'tesseract.js', 'dist/worker.min.js'],
  ['tesseract-core-simd-lstm.js', 'tesseract.js-core', 'tesseract-core-simd-lstm.js'],
  ['tesseract-core-simd-lstm.wasm', 'tesseract.js-core', 'tesseract-core-simd-lstm.wasm'],
  ['eng.traineddata.gz', '@tesseract.js-data/eng', '4.0.0_best_int/eng.traineddata.gz'],
];

export function ocrAssets() {
  const files = new Map<string, string>();
  for (const [name, pkg, path] of FILES) {
    const full = join(dirname(require.resolve(`${pkg}/package.json`)), path);
    if (!existsSync(full)) throw new Error(`ocr-assets: missing ${full} (from ${pkg})`);
    files.set(name, full);
  }
  return serveAssets('fizzdoc-ocr-assets', 'ocr', files);
}
