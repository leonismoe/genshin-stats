import { defineConfig } from 'rollup';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';

export default defineConfig([
  {
    input: 'src/index.ts',
    output: [
      { format: 'cjs', file: 'dist/index.cjs.js' },
      { format: 'es', file: 'dist/index.esm.js' },
    ],
    external: ['undici', 'abort-controller', '@leonismoe/md5'],
    plugins: [
      resolve({
        exportConditions: ['node', 'require', 'default'],
      }),
      typescript(),
      json(),
    ],
  },

  {
    input: 'src/index.ts',
    output: [
      { format: 'es', file: 'dist/browser.esm.js' },
      { format: 'umd', file: 'dist/brower.umd.js', name: 'miHoYoApi' },
    ],
    plugins: [
      resolve({
        browser: true,
        exportConditions: ['browser', 'default'],
      }),
      typescript(),
      json(),
    ],
  }
]);
