import { spawnSync } from 'child_process';
import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { defineConfig, PluginOption } from 'vite';
import { RollupOptions, OutputOptions } from 'rollup';
import { VitePWA } from 'vite-plugin-pwa';
import solidPlugin from 'vite-plugin-solid';
import copy from 'rollup-plugin-copy';
import nodeResolve from '@rollup/plugin-node-resolve';
import ViteHtmlVariablePlugin from './scripts/vite-plugin-html-variable';
import ViteHtmlStripCrossOriginPlugin from './scripts/vite-plugin-html-strip-crossorigin';
import ViteHtmlStripModulePlugin from './scripts/vite-plugin-html-strip-module';
import htmlImportMinifyPlugin from './scripts/rollup-plugin-html-import-minify';

const DISTDIR = 'dist';

const readJSON = (path: string) => readFile(path, { encoding: 'utf8' }).then(JSON.parse);

export default defineConfig(async ({ command, mode }) => {
  const VERSION = (await readJSON(resolve(__dirname, './package.json'))).version;
  process.env.VERSION = process.env.VITE_USER_VERSION = VERSION;
  process.env.COMMIT = process.env.VITE_USER_COMMIT = '';

  const rollupOptions: RollupOptions = {};
  const otherPlugins: (PluginOption | PluginOption[])[] = [];

  if (command === 'build') {
    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = 'production';
    }

    const rev = spawnSync('git rev-parse --short HEAD', { shell: true });
    if (!rev.error) {
      process.env.COMMIT = process.env.VITE_USER_COMMIT = rev.stdout.toString().trimEnd();
    }
  }

  if (command === 'build' && mode === 'chrome-ext') {
    rollupOptions.output = rollupOptions.output as OutputOptions || {};
    rollupOptions.output.manualChunks = {};
    rollupOptions.output.assetFileNames = 'assets/[name][extname]';
    rollupOptions.output.chunkFileNames = '[name].js';
    rollupOptions.output.entryFileNames = '[name].js';

    otherPlugins.push(ViteHtmlStripCrossOriginPlugin());
    otherPlugins.push(ViteHtmlStripModulePlugin());
    otherPlugins.push(copy({
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
    base: process.env.BASE_URL || '/',

    plugins: [
      nodeResolve({ modulesOnly: true, browser: true }),
      solidPlugin(),
      ViteHtmlVariablePlugin({ exposeViteEnv: true }),
      htmlImportMinifyPlugin(),
      VitePWA({
        disable: mode !== 'pages' && mode !== 'development',
        strategies: 'injectManifest',
        registerType: 'prompt',
        srcDir: 'src',
        filename: 'sw.ts',
        includeAssets: [
          'assets/fonts/**/*',
          'assets/images/**/*',
          '!**/.*',
        ],
        manifest: {
          name: '原神数据查询',
          short_name: '原神数据查询',
          description: '根据原神 UID 查询统计数据、角色列表、深境螺旋战绩',
          lang: 'zh-CN',
          icons: [
            {
              src: 'assets/images/paimon-192.jpg',
              sizes: '192x192',
              type: 'image/jpeg',
            },
            {
              src: 'assets/images/paimon-512.webp',
              sizes: '512x512',
              type: 'image/webp',
            },
          ],
        },
      }),

      ...otherPlugins,
    ],

    build: {
      outDir: DISTDIR,
      target: 'esnext',
      polyfillDynamicImport: false,
      cssCodeSplit: false,
      manifest: false,
      rollupOptions,
    },

    css: {
      postcss: {
        plugins: [
          {
            // @see https://github.com/vitejs/vite/discussions/5079#discussioncomment-1890839
            postcssPlugin: 'internal:charset-removal',
            AtRule: {
              charset: (atRule) => {
                if (atRule.name === 'charset') {
                  atRule.remove();
                }
              },
            },
          },
        ],
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
        '/proxy/api-takumi-record.mihoyo.com': {
          target: 'https://api-takumi-record.mihoyo.com',
          cookieDomainRewrite: '',
          changeOrigin: true,
          rewrite: (path) => path.slice(35),
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
