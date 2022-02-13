import { createFilter } from '@rollup/pluginutils';
import { minify } from 'html-minifier-terser';

/** @typedef {import('@rollup/pluginutils').FilterPattern} FilterPattern */
/** @typedef {import('html-minifier-terser').Options} HtmlMinifyOptions */
/** @typedef {{ include?: FilterPattern, exclude?: FilterPattern } & HtmlMinifyOptions} HtmlImportPluginOptions */
/**
 * @type {import('rollup').PluginImpl<HtmlImportOptions>}
 * @param {HtmlImportPluginOptions} [options]
 */
export default function htmlImport(options) {
  options = {
    include: '**/*.html',

    collapseWhitespace: true,
    keepClosingSlash: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    useShortDoctype: true,
    minifyCSS: true,
    ...options,
  };

  const filter = createFilter(options.include, options.exclude);

  return {
    name: 'html-import',

    transform(code, id) {
      const test = id.match(/\?(minify|dom)\b/);
      if (!test || !filter(id.slice(0, test.index))) {
        return null;
      }

      const action = test[1];
      return minify(code, options).then(html => {
        /** @type {import('rollup').SourceDescription} */
        const result = {
          code: '',
          moduleSideEffects: false,
        };

        if (action === 'minify') {
          result.code = `export default ${JSON.stringify(html)}`;

        } else if (action === 'dom') {
          if (/\?dom&element\b/.test(id)) {
            result.code = `
              let template = document.createElement('div');
              template.innerHTML = ${JSON.stringify(html)};
              template = template.firstElementChild;

              export default /*#__PURE__*/ function() {
                return template.cloneNode(true);
              }
            `;

          } else if (/\?dom&fragment\b/.test(id)) {
            result.code = `
              const template = document.createElement('template');
              template.innerHTML = ${JSON.stringify(html)};

              export default /*#__PURE__*/ function() {
                return template.content.cloneNode(true);
              }
            `;

          } else {
            result.code = `
              const template = document.createElement('template');
              template.innerHTML = ${JSON.stringify(html)};

              export default /*#__PURE__*/ function() {
                const fragment = template.content;
                return fragment.children.length == 1
                  ? fragment.children[0].cloneNode(true)
                  : fragment.cloneNode(true);
              }
            `;
          }
        }

        return result;
      });
    },
  };
}
