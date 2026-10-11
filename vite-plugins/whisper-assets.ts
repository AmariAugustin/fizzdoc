// Serves ONNX Runtime's WebAssembly build from our own origin under /whisper/ort/, for Audio to Text.
// Only the plain CPU build is used: the WebGPU build is over 25 MiB, too big for static hosts, and
// the page's CSP would block loading it from a CDN anyway. The speech model itself is in
// public/whisper/ (see scripts/whisper-model.mjs).
import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { serveAssets } from './serve-assets.ts';

const require = createRequire(import.meta.url);
const NAMES = ['ort-wasm-simd-threaded.wasm', 'ort-wasm-simd-threaded.mjs'];

export function whisperAssets() {
  const dist = dirname(require.resolve('onnxruntime-web'));
  const files = new Map<string, string>();
  for (const name of NAMES) {
    const path = join(dist, name);
    if (!existsSync(path)) throw new Error(`whisper-assets: missing ${path}`);
    files.set(name, path);
  }
  return serveAssets('fizzdoc-whisper-assets', 'whisper/ort', files);
}
