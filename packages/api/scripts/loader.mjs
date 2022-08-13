import { readFile } from 'node:fs/promises';

/**
 * @see https://nodejs.org/api/esm.html#resolvespecifier-context-defaultresolve
 * @typedef {'builtin' | 'commonjs' | 'json' | 'module' | 'wasm'} LoadFormat
 * @typedef {{ conditions: string[], format?: 'builtin' | 'commonjs' | 'json' | 'module' | 'wasm' | null, importAssertions: unknown }} LoadContext
 * @typedef {{ format: LoadFormat, shortCircuit?: boolean, source: string | ArrayBuffer | SharedArrayBuffer | Uint8Array }} LoadResult
 * @param {string} url
 * @param {LoadContext} context
 * @param {(specifier: string, context: LoadContext) => Promise<LoadResult>} nextLoad
 * @returns {Promise<LoadResult>}
 */
export async function load(url, context, nextLoad) {
  if (url.endsWith('.json')) {
    if (url.startsWith('file:///')) {
      url = (new URL(url)).pathname.slice(1);
    }
    else if (url.includes('://')) {
      throw new Error('Loading remote JSON file is prohibited.');
    }

    return readFile(url, 'utf8').then(text => ({
      format: 'json',
      source: text,
      shortCircuit: true,
    }));
  }

  if (url.startsWith('file:///') && url.endsWith('.esm.js')) {
    url = (new URL(url)).pathname.slice(1);
    return readFile(url).then(data => ({
      format: 'module',
      source: data,
      shortCircuit: true,
    }));
  }

  return nextLoad(url, context);
}
