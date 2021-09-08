/** @typedef {import("rollup").PluginImpl} PluginImpl */
/** @typedef {import("vite").IndexHtmlTransformHook} IndexHtmlTransformHook */

/** @type {PluginImpl<{}>} */
export default function ViteHtmlStripCrossOriginPlugin() {
  return {
    name: 'vite-html-strip-crossorigin',

    /** @type {IndexHtmlTransformHook} */
    transformIndexHtml(html, ctx) {
      return html.replace(/\<script type="module" crossorigin src="(.+?)"\>\<\/script\>/g, '<script type="module" src="$1"></script>');
    },
  }
}
