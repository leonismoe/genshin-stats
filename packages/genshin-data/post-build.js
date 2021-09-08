import { readdir, stat, rename, unlink } from 'fs/promises';

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
}
