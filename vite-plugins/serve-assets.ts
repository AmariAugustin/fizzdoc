// Serves files from node_modules under /<folder>/ in dev, and writes them to the same paths in the
// build, unhashed, so engine code can load them from fixed URLs on our own origin.
import { readFileSync } from 'node:fs';
import type { Plugin } from 'vite';

const TYPES: Record<string, string> = { js: 'text/javascript', mjs: 'text/javascript', wasm: 'application/wasm', json: 'application/json' };

/** `files` maps each published name to a path on disk or to the bytes themselves. */
export function serveAssets(name: string, folder: string, files: Map<string, string | Uint8Array>): Plugin {
  const read = (file: string | Uint8Array) => (typeof file === 'string' ? readFileSync(file) : file);
  return {
    name,
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0] ?? '';
        const file = url.startsWith(`/${folder}/`) && files.get(url.slice(folder.length + 2));
        if (!file) return next();
        res.setHeader('Content-Type', TYPES[url.split('.').pop()!] ?? 'application/octet-stream');
        res.end(read(file));
      });
    },
    generateBundle() {
      for (const [fileName, file] of files) this.emitFile({ type: 'asset', fileName: `${folder}/${fileName}`, source: read(file) });
    },
  };
}
