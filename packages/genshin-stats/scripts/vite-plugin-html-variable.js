/** @typedef {import("rollup").PluginImpl} PluginImpl */
/** @typedef {import("vite").IndexHtmlTransformHook} IndexHtmlTransformHook */

/** @type {PluginImpl<{}>} */
/** @param {{ prefix?: string, dict?: Record<string, string | number | boolean | undefined | null> }} [options] */
export default function ViteHtmlVariablePlugin(options) {
  let prefix = '';
  let dict = process.env;

  if (options) {
    if (options.prefix) prefix = options.prefix;
    if (options.dict) dict = options.dict;
  }

  return {
    name: 'vite-html-variable',

    /** @type {IndexHtmlTransformHook} */
    transformIndexHtml(html, ctx) {
      return html.replace(/\{%(\w+)%\}/g, (_, name) => {
        const value = dict[prefix + name];
        return value == null ? '' : value;
      });
    },
  }
}
