/** @typedef {import("rollup").PluginImpl} PluginImpl */
/** @typedef {import("vite").IndexHtmlTransformHook} IndexHtmlTransformHook */

/** @type {PluginImpl<{}>} */
export default function ViteHtmlStripModulePlugin() {
  return {
    name: 'vite-html-strip-module',

    /** @type {IndexHtmlTransformHook} */
    transformIndexHtml(html, ctx) {
      return html.replaceAll('<script type="module" ', '<script ');
    },
  }
}
