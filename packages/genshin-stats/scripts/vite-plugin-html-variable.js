/** @typedef {import("rollup").PluginImpl} PluginImpl */
/** @typedef {import("vite").IndexHtmlTransformHook} IndexHtmlTransformHook */
/** @typedef {import("vite").ResolvedConfig} ResolvedConfig */

/** @type {PluginImpl<{}>} */
/** @param {{ prefix?: string, dict?: Record<string, string | number | boolean | undefined | null>, exposeViteEnv?: boolean }} [options] */
export default function ViteHtmlVariablePlugin(options) {
  let prefix = '';
  let dict = process.env;
  let viteEnv = Object.create(null);

  if (options) {
    if (options.prefix) prefix = options.prefix;
    if (options.dict) dict = options.dict;
  }

  return {
    name: 'vite-html-variable',

    /** @param {ResolvedConfig} config */
    configResolved(config) {
      if (options && options.exposeViteEnv) {
        process.env.MODE = config.env.MODE;
        process.env.BASE_URL = config.env.BASE_URL;
      }
      viteEnv = config.env;
    },

    /** @type {IndexHtmlTransformHook} */
    transformIndexHtml(html, ctx) {
      return html.replace(/\{%(\w+)%\}/g, (_, name) => {
        const key = prefix + name;
        const value = key in viteEnv ? viteEnv[key] : dict[key];
        return value == null ? '' : value;
      });
    },
  }
}
