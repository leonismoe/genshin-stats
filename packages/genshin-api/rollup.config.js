import { defineConfig } from 'rollup';
import resolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';

export default defineConfig([
  {
    input: 'src/index.ts',
    output: [
      { format: 'cjs', file: 'dist/index.js' },
      { format: 'es', file: 'dist/index.mjs' },
    ],
    external: ['@mihoyo-kit/api', '@mihoyo-kit/genshin-data', 'undici'],
    plugins: [
      resolve({
        modulesOnly: true,
        exportConditions: ['node', 'require', 'default'],
      }),
      typescript({
        check: false,
        useTsconfigDeclarationDir: true,
        tsconfig: 'tsconfig.build.json',
        tsconfigOverride: {
          declaration: false,
        },
      }),
    ],
  },

  {
    input: 'src/index.ts',
    output: [
      { format: 'es', file: 'dist/browser.mjs' },
      {
        format: 'umd',
        file: 'dist/browser.js',
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
        modulesOnly: true,
        exportConditions: ['browser', 'default'],
      }),
      typescript({
        check: false,
        useTsconfigDeclarationDir: true,
        tsconfig: 'tsconfig.build.json',
        tsconfigOverride: {
          declaration: false,
        },
      }),
    ],
  }
]);
