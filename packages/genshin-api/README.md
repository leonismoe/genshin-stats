@mihoyo-kit/genshin-api
=======================
This package provides some encapsulated utilities function for querying Genshin Impact game record.

Currently only CN server is supported.

``` ts
/**
 * 获取原神游戏数据总览
 * Fetch game record data (what you see in HoYoLab's Game Record, except Spiral Abyss) for given uid.
 * @param role_id UID
 */
function getGenshinGameStats(role_id: number | string, options?: RequestOptions): Promise<GameStats>;

/**
 * 获取原神深境螺旋数据
 * Fetch Spiral Abyss statistics data
 * @param role_id UID
 * @param schedule_type 本期或上期 (Current or previous)
 */
function getSpiralAbyssData(role_id: number | string, schedule_type?: SpiralAbyssScheduleType, options?: RequestOptions): Promise<SpiralAbyssData>;

/**
 * 获取角色装备详情
 * Fetch details of a player's characters, including weapon and reliquaries.
 */
function getPlayerCharacterDetails(role_id: number | string, characters: Character[], options?: RequestOptions): Promise<readonly CharacterDetail[]>;
function getPlayerCharacterDetails(role_id: number | string, character_ids: number[], options?: RequestOptions): Promise<readonly CharacterDetail[]>;
function getPlayerCharacterDetails(role_id: number | string, data: GameStats, options?: RequestOptions): Promise<readonly CharacterDetail[]>;
```

In Node.js, you should provide `options.headers.cookie` or `options.cookieJar`, the required cookies are `ltuid` and `ltoken`.
