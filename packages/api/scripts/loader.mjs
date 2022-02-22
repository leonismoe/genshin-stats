import { readFile } from 'node:fs/promises';

/**
 * @see https://nodejs.org/api/esm.html#resolvespecifier-context-defaultresolve
 * @param {string} url
 * @param {{ format: string }} context
 * @param {Function} defaultLoad
 * @returns {Promise<{ format: string, source: string | ArrayBuffer | SharedArrayBuffer | Uint8Array }>}
 */
export async function load(url, context, defaultLoad) {
  if (!context.format && url.endsWith('.json')) {
    if (url.startsWith('file:///')) {
      url = (new URL(url)).pathname.slice(1);
    }
    else if (url.includes('://')) {
      throw new Error('Loading remote JSON file is prohibited.');
    }

    return readFile(url, 'utf8').then(text => ({
      format: 'json',
      source: text,
    }));
  }

  if (url.startsWith('file:///') && url.endsWith('.esm.js')) {
    url = (new URL(url)).pathname.slice(1);
    return readFile(url).then(data => ({
      format: 'module',
      source: data,
    }));
  }

  return defaultLoad(url, context, defaultLoad);
}
