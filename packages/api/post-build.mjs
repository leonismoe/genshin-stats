/// <reference lib="ES2021" />

import { readdir, stat, rename, unlink, readFile, writeFile, copyFile } from 'fs/promises';
import ts from 'typescript';

const pkg = (await readJSON('./package.json')).name;

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
              node.moduleSpecifier.text = imports + '.' + extension;

            } else if (file === 'index.js' && imports.startsWith('#')) {
              shouldFixImports = true;
              node.moduleSpecifier.text = `${pkg}/lib/${imports.slice(1)}`;
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

function readJSON(path) {
  return readFile(path, { encoding: 'utf8' }).then(data => JSON.parse(data));
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
  const fixInternalImports = async subpath => {
    const path = `${DIST_DIR}/${subpath}`;
    const source = ts.createSourceFile(path, await readFile(path, { encoding: 'utf8' }), ts.ScriptTarget.Latest);
    source.forEachChild(function traverse(node) {
      if (node.kind === ts.SyntaxKind.ImportDeclaration || node.kind === ts.SyntaxKind.ExportDeclaration) {
        if (node.moduleSpecifier && node.moduleSpecifier.kind === ts.SyntaxKind.StringLiteral) {
          if (node.moduleSpecifier.text.startsWith('#')) {
            node.moduleSpecifier.text = `${pkg}/lib/${node.moduleSpecifier.text.slice(1)}`;
          }
        }
      }

      else if (node.kind === ts.SyntaxKind.CallExpression && node.expression.kind === ts.SyntaxKind.Identifier && node.expression.escapedText === 'require') {
        if (node.arguments.length === 1 && node.arguments[0].kind === ts.SyntaxKind.StringLiteral) {
          if (node.arguments[0].text.startsWith('#')) {
            node.arguments[0].text = `${pkg}/lib/${node.arguments[0].text.slice(1)}`;
          }
        }
      }

      node.forEachChild(traverse);
    });

    const printer = ts.createPrinter();
    return writeFile(path, printer.printFile(source));
  };

  await fixInternalImports('index.js');
  await fixInternalImports('index.mjs');
  await fixInternalImports('index.d.ts');

  if (await fileExists('src/typings.d.ts')) {
    await copyFile('src/typings.d.ts', `${DIST_DIR}/typings.d.ts`);
  }
}
