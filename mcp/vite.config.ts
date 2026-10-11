// Bundles the server and the engines it shares with the website into one Node file.
// Only the packages listed in package.json stay external (npm installs them); anything else the
// engines import is bundled in, so a published package can't miss a dependency.
import { builtinModules } from 'node:module';
import { defineConfig } from 'vite';
import pkg from './package.json' with { type: 'json' };

const external = [...Object.keys(pkg.dependencies), ...builtinModules];

export default defineConfig({
  ssr: { noExternal: true },
  build: {
    ssr: 'src/cli.ts',
    outDir: 'dist',
    emptyOutDir: true,
    target: 'node20',
    minify: false,
    rollupOptions: {
      external: (id) => id.startsWith('node:') || external.some((name) => id === name || id.startsWith(`${name}/`)),
      output: { entryFileNames: 'server.js', banner: '#!/usr/bin/env node' },
    },
  },
});
