/** eslint-env node */

const { readFile, access, readdir, stat } = require('fs/promises');
const { dirname, resolve } = require('path');
const { spawn } = require('child_process');

/**
 * @param {string} path
 * @returns {Promise<*>}
 */
function readJSON(path) {
  return readFile(path, { encoding: 'utf8' }).then(data => JSON.parse(data));
}

function fileExists(path) {
  return access(path).then(() => true, () => false);
}

function exec(command, options) {
  const $0 = command.split(' ')[0];
  return fileExists(__dirname + '../node_modules/.bin/' + $0)
    .then(npx => new Promise((resolve, reject) => {
      const cp = spawn(npx ? 'npm exec ' + command : command, {
        shell: true,
        ...options,
      });
      cp.on('close', resolve);
      cp.on('error', reject);
    }));
}

async function* list_node_modules(path) {
  if (await fileExists(path + '/node_modules')) {
    for (const name of await readdir(path + '/node_modules')) {
      if (name.startsWith('.')) continue;

      const stats = await stat(path + '/node_modules/' + name);
      if (stats.isSymbolicLink()) continue;

      if (stats.isDirectory()) {
        if (name.startsWith('@')) {
          for (const subname of await readdir(path + '/node_modules/' + name)) {
            const stats = await stat(path + '/node_modules/' + name);
            if (stats.isDirectory() && !stats.isSymbolicLink()) {
              yield path + '/node_modules/' + name + '/' + subname;
            }
          }

        } else {
          yield path + '/node_modules/' + name;
        }
      }
    }
  }
}

/**
 * @param {string} package
 * @param {boolean} [recursive]
 * @returns {Promise<void>}
 */
async function simulate_npm_lifecycle(package, recursive) {
  try {
    const metadata_path = require.resolve(package + '/package.json');
    const metadata = await readJSON(metadata_path);
    const cwd = dirname(metadata_path);

    if (recursive) {
      const deferreds = [];
      for await (const path of list_node_modules(cwd)) {
        deferreds.push(simulate_npm_lifecycle(path, recursive));
      }
      await Promise.all(deferreds);
    }

    const deferreds = [];
    if (metadata.scripts) {
      for (const hook of ['preinstall', 'install', 'postinstall']) {
        if (metadata.scripts[hook]) {
          deferreds.push(exec(metadata.scripts[hook], { cwd }));
        }
      }

      if (deferreds.length) {
        console.log('[+] ' + package);
      }
    }

    return Promise.all(deferreds);

  } catch (e) {
    return Promise.resolve();
  }
}

simulate_npm_lifecycle(resolve(__dirname, '../../../'), true);
