import { defineConfig } from 'rollup';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

export default defineConfig([
  {
    input: 'src/index.ts',
    output: [
      { format: 'cjs', file: 'dist/index.cjs.js' },
      { format: 'es', file: 'dist/index.esm.js' },
    ],
    external: ['@mihoyo-kit/api', '@genshin-data', 'undici'],
    plugins: [
      resolve({
        exportConditions: ['node', 'require', 'default'],
      }),
      typescript(),
    ],
  },

  {
    input: 'src/index.ts',
    output: [
      { format: 'es', file: 'dist/browser.esm.js' },
      {
        format: 'umd',
        file: 'dist/browser.umd.js',
        name: 'miHoYoGenshinApi',
        globals: {
          '@mihoyo-kit/api': 'miHoYoApi',
        },
      },
    ],
    external: ['@mihoyo-kit/api'],
    plugins: [
      resolve({
        browser: true,
        exportConditions: ['browser', 'default'],
      }),
      typescript(),
    ],
  }
]);
