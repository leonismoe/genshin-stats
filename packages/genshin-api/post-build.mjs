import { existsSync, statSync } from 'fs';
import { readdir, stat, rename, unlink, readFile, writeFile, copyFile } from 'fs/promises';
import { dirname, resolve } from 'path';
import { globby } from 'globby';
import mkdirp from 'mkdirp';
import ts from 'typescript';

function fileExists(path) {
  return stat(path).then(() => true, () => false);
}

async function rename_js_files(dir, extension) {
  for (const file of await readdir(dir)) {
    const path = `${dir}/${file}`;
    if (file.endsWith('.js')) {
      let shouldFixImports = false;

      const source = ts.createSourceFile(path, await readFile(path, { encoding: 'utf8' }), ts.ScriptTarget.Latest);
      source.forEachChild(node => {
        if (node.kind === ts.SyntaxKind.ImportDeclaration || node.kind === ts.SyntaxKind.ExportDeclaration) {
          if (node.moduleSpecifier && node.moduleSpecifier.kind === ts.SyntaxKind.StringLiteral) {
            const imports = node.moduleSpecifier.text;

            if (imports.startsWith('.') && !imports.endsWith('.json')) {
              shouldFixImports = true;

              const target = resolve(dir, imports);
              if (existsSync(target) && statSync(target).isDirectory()) {
                node.moduleSpecifier.text = imports + '/index.' + extension;
              } else {
                node.moduleSpecifier.text = imports + '.' + extension;
              }
            }
          }
        }
      });

      if (shouldFixImports) {
        const printer = ts.createPrinter();
        await writeFile(`${dir}/${file.slice(0, -2)}${extension}`, printer.printFile(source));

      } else {
        await rename(path, `${dir}/${file.slice(0, -2)}${extension}`);
      }

    } else if ((await stat(path)).isDirectory()) {
      await rename_js_files(path, extension);
    }
  }
}

const DIST_DIR = 'lib';
try {
  if (await fileExists(`${DIST_DIR}/typings.js`)) {
    await unlink(`${DIST_DIR}/typings.js`);
  }
} catch (e) {
  // DO NOTHING
}

const extension = process.argv[2];
if (extension && extension !== 'js') {
  await rename_js_files(DIST_DIR, extension);

} else {
  const typeFiles = await globby('**/*.d.ts', { cwd: 'src' });
  for (const path of typeFiles) {
    await mkdirp(dirname(`${DIST_DIR}/${path}`));
    await copyFile(`src/${path}`, `${DIST_DIR}/${path}`);
  }
}
