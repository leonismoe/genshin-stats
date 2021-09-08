import { readFile } from 'fs/promises';
import { defineConfig, PluginOption } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import copy from 'rollup-plugin-copy';
import nodeResolve from '@rollup/plugin-node-resolve';
import ViteHtmlVariablePlugin from './scripts/vite-plugin-html-variable';
import ViteHtmlStripCrossOriginPlugin from './scripts/vite-plugin-html-strip-crossorigin';
import ViteHtmlStripModulePlugin from './scripts/vite-plugin-html-strip-module';

const DISTDIR = 'dist';

export default defineConfig(async ({ command, mode }) => {

  const VERSION = process.env.VERSION = JSON.parse(await readFile('./package.json', { encoding: 'utf8' })).version;

  const CHROME_EXT_PLUGINS: PluginOption[] = [];
  if (command === 'build' && mode === 'chrome-ext') {
    CHROME_EXT_PLUGINS.push(ViteHtmlStripCrossOriginPlugin());
    CHROME_EXT_PLUGINS.push(ViteHtmlStripModulePlugin());
    CHROME_EXT_PLUGINS.push(copy({
      hook: 'writeBundle',
      targets: [
        {
          src: ['chrome-ext/**/*'],
          dest: DISTDIR,
          transform: (contents, filename) => {
            if (filename === 'manifest.json') {
              const manifest = JSON.parse(contents.toString());
              manifest.version = VERSION;
              return JSON.stringify(manifest, null, 2);
            }
            return contents;
          },
        },
      ],
    }));
  }

  return {
    base: '/',

    plugins: [
      nodeResolve({ modulesOnly: true, browser: true }),
      solidPlugin(),

      command === 'build' && ViteHtmlVariablePlugin(),

      ...CHROME_EXT_PLUGINS,
    ],

    build: {
      outDir: DISTDIR,
      target: 'esnext',
      polyfillDynamicImport: false,
      cssCodeSplit: false,
      manifest: false,

      rollupOptions: {
        output: {
          manualChunks: {},
        },
      },
    },

    server: {
      fs: {
        strict: true,
      },

      proxy: {
        '/proxy/api-takumi.mihoyo.com': {
          target: 'https://api-takumi.mihoyo.com',
          cookieDomainRewrite: '',
          changeOrigin: true,
          rewrite: (path) => path.slice(28),
        },
        '/proxy/bbs-api.mihoyo.com': {
          target: 'https://bbs-api.mihoyo.com',
          cookieDomainRewrite: '',
          changeOrigin: true,
          rewrite: (path) => path.slice(25),
        },
        '/proxy/webapi.account.mihoyo.com': {
          target: 'https://webapi.account.mihoyo.com',
          cookieDomainRewrite: '',
          changeOrigin: true,
          rewrite: (path) => path.slice(32),
        },
      },
    },
  };
});
