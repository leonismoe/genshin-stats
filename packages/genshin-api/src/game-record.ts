import { APIClientType, WrapWithKey, request, RequestOptions } from '@mihoyo-kit/api';
import { getServerRegionByUid } from '@mihoyo-kit/genshin-data';
import { SpiralAbyssScheduleType } from './constants';
import { GameStats, CharacterDetail, Character, SpiralAbyssData } from './types';

/**
 * 获取原神游戏数据总览
 * Fetch game record data (what you see in HoYoLab's Game Record, except Spiral Abyss) for given uid.
 * @param role_id UID
 */
export function getGenshinGameStats(role_id: number | string, options?: RequestOptions): Promise<GameStats> {
  const server = getServerRegionByUid(role_id);

  return request<GameStats>(`https://api-takumi-record.mihoyo.com/game_record/app/genshin/api/index?server=${server}&role_id=${role_id}`, {
    ...options,
    client_type: APIClientType.WEBVIEW,
    responseType: 'json',
    resolveBodyOnly: true,
    ds2: true,
  });
}

/**
 * 获取原神深境螺旋数据
 * Fetch Spiral Abyss statistics data
 * @param role_id UID
 * @param schedule_type 本期或上期 (Current or previous)
 */
export function getSpiralAbyssData(role_id: number | string, schedule_type = SpiralAbyssScheduleType.CURRENT, options?: RequestOptions): Promise<SpiralAbyssData> {
  const server = getServerRegionByUid(role_id);

  return request<SpiralAbyssData>(`https://api-takumi-record.mihoyo.com/game_record/app/genshin/api/spiralAbyss?schedule_type=${schedule_type}&server=${server}&role_id=${role_id}`, {
    ...options,
    client_type: APIClientType.WEBVIEW,
    responseType: 'json',
    resolveBodyOnly: true,
    ds2: true,
  });
}

/**
 * 获取角色装备详情
 * Fetch details of a player's characters, including weapon and reliquaries.
 */
export async function getPlayerCharacterDetails(role_id: number | string, characters: Character[], options?: RequestOptions): Promise<readonly CharacterDetail[]>;
export async function getPlayerCharacterDetails(role_id: number | string, character_ids: number[], options?: RequestOptions): Promise<readonly CharacterDetail[]>;
export async function getPlayerCharacterDetails(role_id: number | string, data: GameStats, options?: RequestOptions): Promise<readonly CharacterDetail[]>;
export async function getPlayerCharacterDetails(role_id: number | string, data: Character[] | number[] | GameStats, options?: RequestOptions): Promise<readonly CharacterDetail[]> {
  let character_ids: number[];

  if (Array.isArray(data)) {
    if (data.length === 0) {
      throw new Error('no characters provided');
    }
    character_ids = typeof data[0] === 'number' ? <number[]>data : (<Character[]>data).map(v => v.id);

  } else {
    character_ids = data.avatars.map(v => v.id);
  }

  const res = await request<WrapWithKey<CharacterDetail[], 'avatars'>>('https://api-takumi-record.mihoyo.com/game_record/app/genshin/api/character', {
    ...options,
    method: 'POST',
    responseType: 'json',
    resolveBodyOnly: true,
    client_type: APIClientType.WEBVIEW,
    ds2: true,
    json: {
      character_ids: character_ids,
      role_id: '' + role_id,
      server: getServerRegionByUid(role_id),
    },
  });

  return res.avatars;
}
