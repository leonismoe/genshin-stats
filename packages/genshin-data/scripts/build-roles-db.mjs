import { spawnSync } from 'child_process';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { readFile, writeFile, readdir, stat } from 'fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../');
const GENSHIN_DATA_ROOT = resolve(ROOT, './GenshinData');

const fileExists = path => stat(path).then(() => true, () => false);
const readJSON = async path => JSON.parse(await readFile(path, { encoding: 'utf8' }));
const ucfirst = text => text.slice(0, 1).toUpperCase() + text.slice(1).toLowerCase();

const git = (command, options) => {
  process.stderr.write(`\x1b[35m+ git ${command}\x1b[0m\n`);
  const result = spawnSync(`git ${command}`, { shell: true, stdio: 'inherit', cwd: GENSHIN_DATA_ROOT, ...options });

  process.stderr.write('\n');
  if (result.error) {
    throw result.error;
  }
}

if (!await fileExists(GENSHIN_DATA_ROOT)) {
  process.stdout.write('==> Fetching GenshinData...\n');
  git('clone --depth=1 --no-checkout --filter=blob:none --sparse https://github.com/Dimbreath/GenshinData.git', { cwd: ROOT });
  git('sparse-checkout init');
  git('sparse-checkout set TextMap ExcelBinOutput/AvatarExcelConfigData.json ExcelBinOutput/AvatarCodexExcelConfigData.json ExcelBinOutput/FetterInfoExcelConfigData.json');
  git('checkout');

} else if (!process.argv.includes('--no-update')) {
  process.stdout.write('==> Updating GenshinData...\n');
  git('pull');
}

process.stdout.write('==> Reading data...\n');
const release_dates = Object.create(null);
for (const item of await readJSON(`${GENSHIN_DATA_ROOT}/ExcelBinOutput/AvatarCodexExcelConfigData.json`)) {
  release_dates[item.AvatarId] = item.BeginTime.substr(0, 4) + item.BeginTime.substr(5, 2) + item.BeginTime.substr(8, 2);
}

const fetter_info = Object.create(null);
for (const item of await readJSON(`${GENSHIN_DATA_ROOT}/ExcelBinOutput/FetterInfoExcelConfigData.json`)) {
  fetter_info[item.AvatarId] = item;
}

process.stdout.write('==> Reading translations...\n');
const languages = [];
const TextMap = Object.create(null);
for (const file of await readdir(`${GENSHIN_DATA_ROOT}/TextMap`)) {
  const lang = file.slice(7, -5).toLowerCase();
  languages.push(lang);
  TextMap[lang] = await readJSON(`${GENSHIN_DATA_ROOT}/TextMap/${file}`);
}

const weapon_map = {
  WEAPON_SWORD_ONE_HAND: 'Sword',
  WEAPON_CATALYST: 'Catalyst',
  WEAPON_CLAYMORE: 'Claymore',
  WEAPON_BOW: 'Bow',
  WEAPON_POLE: 'Polearm',
};

const rarity_map = {
  QUALITY_ORANGE_SP: 105,
  QUALITY_ORANGE: 5,
  QUALITY_PURPLE: 4,
};

process.stdout.write('==> Generating...\n');
const avatars = await readJSON(`${GENSHIN_DATA_ROOT}/ExcelBinOutput/AvatarExcelConfigData.json`);
const roles = avatars
  .filter(avatar => release_dates[avatar.Id])
  .map(avatar => {
    const info = fetter_info[avatar.Id];
    return {
      id: avatar.Id,
      codename: avatar.IconName.slice(14),
      rarity: rarity_map[avatar.QualityType],
      name: languages.reduce((dict, lang) => { dict[lang] = TextMap[lang][avatar.NameTextMapHash]; return dict; }, {}),
      assoc: info.AvatarAssocType === 'ASSOC_TYPE_MAINACTOR' ? '' : ucfirst(info.AvatarAssocType.slice(11)),
      weapon: weapon_map[avatar.WeaponType],
      vision: TextMap.en[info.AvatarVisionBeforTextMapHash],
      birthday: ('0' + info.InfoBirthMonth).slice(-2) + ('0' + info.InfoBirthDay).slice(-2),
      release_date: release_dates[avatar.Id],
    };
  })
  .sort((a, b) => {
    if (a.release_date !== b.release_date) {
      return a.release_date.localeCompare(b.release_date);
    }
    return a.id - b.id;
  });

process.stdout.write('==> Writing data...\n');
await writeFile(`${ROOT}/data/roles.json`, JSON.stringify(roles, null, 2));

process.stdout.write('==> Done\n');
