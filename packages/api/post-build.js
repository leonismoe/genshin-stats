/// <reference lib="ES2021" />

import { readdir, stat, rename, unlink, readFile, writeFile } from 'fs/promises';

async function rename_js_files(dir, extension) {
  for (const file of await readdir(dir)) {
    const path = `${dir}/${file}`;
    if (file.endsWith('.js')) {
      await rename(path, `${dir}/${file.slice(0, -2)}${extension}`);

    } else if ((await stat(path)).isDirectory()) {
      await rename_js_files(path, extension);
    }
  }
}

function readJSON(path) {
  return readFile(path, { encoding: 'utf8' }).then(data => JSON.parse(data));
}

const DIST_DIR = 'lib';
try {
  if (await stat(`${DIST_DIR}/typings.js`)) {
    await unlink(`${DIST_DIR}/typings.js`);
  }
} catch (e) {
  // DO NOTHING
}

const extension = process.argv[2];
if (extension && extension !== 'js') {
  await rename_js_files(DIST_DIR, extension);

} else {
  const pkg = (await readJSON('./package.json')).name;

  // NOTE: Node.js >= 16.0.0
  const rectify = async subpath => writeFile(`${DIST_DIR}/${subpath}`, (await readFile(`${DIST_DIR}/${subpath}`, { encoding: 'utf8' })).replaceAll(`${pkg}/src/`, `${pkg}/lib/`));

  await rectify('index.mjs');
  await rectify('index.js');
  await rectify('index.d.ts');
}
