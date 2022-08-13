import { defineConfig } from 'rollup';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';

export default defineConfig([
  {
    input: 'src/index.ts',
    output: [
      { format: 'cjs', file: 'dist/index.js' },
      { format: 'es', file: 'dist/index.mjs' },
    ],
    external: ['undici', 'abort-controller', '@leonismoe/md5'],
    plugins: [
      resolve({
        exportConditions: ['node', 'typescript', 'require', 'default'],
      }),
      typescript(),
      json(),
    ],
  },

  {
    input: 'src/index.ts',
    output: [
      { format: 'es', file: 'dist/browser.mjs' },
      { format: 'umd', file: 'dist/brower.js', name: 'miHoYoApi' },
    ],
    plugins: [
      resolve({
        browser: true,
        exportConditions: ['browser', 'typescript', 'default'],
      }),
      typescript(),
      json(),
    ],
  }
]);
