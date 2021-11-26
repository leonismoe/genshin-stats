import type { SpiralAbyssRankItem } from '@mihoyo-kit/genshin-api/lib/typings';
import { createMemo, For, Show } from 'solid-js';
import { store as globalStore } from '../store/global';
import { store, setState } from '../store/stats';
import '../styles/spiral-abyss.scss';

function formatDate(time: number): string {
  const date = new Date(time * 1000);
  return `${date.getFullYear()}.${('0' + (date.getMonth() + 1)).slice(-2)}.${('0' + date.getDate()).slice(-2)}`;
}

function formatDateTime(time: number): string {
  const date = new Date(time * 1000);
  return `${date.getFullYear()}.${('0' + (date.getMonth() + 1)).slice(-2)}.${('0' + date.getDate()).slice(-2)}`
    + ` ${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}`;
}

const CARDINAL_CHN = ['零', '一', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];

export function SpiralAbyssHeader() {
  const switchAbyssTab = (e: KeyboardEvent) => {
    if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && !e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey) {
      setState({ abyssIndex: store.abyssIndex ? 0 : 1 });

      if (e.target) {
        const another = (e.target as HTMLElement).previousElementSibling || (e.target as HTMLElement).nextElementSibling;
        if (another) {
          (another as HTMLElement).focus();
        }
      }
    }
  };

  return (
    <div class="spiral-abyss-header">
      <h3>深境螺旋战绩</h3>

      <div class="BtnGroup sprial-abyss-selector" onKeyDown={switchAbyssTab}>
        <button type="button" class="BtnGroup-item btn" classList={{ selected: store.abyssIndex == 0 }} onClick={() => setState({ abyssIndex: 0 })}>本期</button>
        <button type="button" class="BtnGroup-item btn" classList={{ selected: store.abyssIndex == 1 }} onClick={() => setState({ abyssIndex: 1 })}>上期</button>
      </div>

      <Show when={store.activeAbyss}>
        <small>统计周期: {formatDate(+store.activeAbyss!.start_time)} - {formatDate(+store.activeAbyss!.end_time)}</small>
      </Show>
    </div>
  );
}


export default () => {
  const hasRankData = createMemo(() => {
    const d = store.activeAbyss;
    const ne = (arr: unknown[]) => arr.length;
    return d && (ne(d.damage_rank) || ne(d.defeat_rank) || ne(d.energy_skill_rank) || ne(d.normal_skill_rank) || ne(d.reveal_rank) || ne(d.take_damage_rank));
  });
  const hasBattleData = createMemo(() => store.activeAbyss && store.activeAbyss.floors.length > 0);
  const hasData = createMemo(() => hasRankData() || hasBattleData());

  return (
    <div
      class="spiral-abyss"
      classList={{
        full: !hasData(),
        'group-sticky-enabled': globalStore.stick_group_banner,
      }}
    >
      <Show when={hasData()}>
        <div class="group abyss-summary">
          <div class="group-banner">
            <div class="Subhead container">
              <div class="Subhead-heading">挑战回顾</div>
              <ul>
                <li>最深抵达: {store.activeAbyss!.max_floor}</li>
                <li>战斗次数: {store.activeAbyss!.total_battle_times}</li>
                <li class="with-abyss-star"><i class="abyss-star"></i>{store.activeAbyss!.total_star}</li>
                <li class="abyss-time">统计周期: {formatDate(+store.activeAbyss!.start_time)} - {formatDate(+store.activeAbyss!.end_time)}</li>
              </ul>
            </div>
          </div>

          <div class="abyss-section container">
            <h4>出战次数</h4>
            <ul class="role-list">
              <For each={store.activeAbyss!.reveal_rank}>{item => (
                <li class={`role-item rarity-${item.rarity}`} data-id={item.avatar_id} data-rarity={item.rarity}>
                  <div class="avatar" style={{ 'background-image': `url(${item.avatar_icon})` }}></div>
                  <div class="meta">{item.value}</div>
                </li>
              )}</For>
            </ul>
          </div>

          <div class="abyss-section container">
            <h4>击破数</h4>
            {renderRankList(store.activeAbyss!.defeat_rank)}
          </div>

          <div class="abyss-section container">
            <h4>最强一击</h4>
            {renderRankList(store.activeAbyss!.damage_rank)}
          </div>

          <div class="abyss-section container">
            <h4>承受伤害</h4>
            {renderRankList(store.activeAbyss!.take_damage_rank)}
          </div>

          <div class="abyss-section container">
            <h4>元素爆发次数</h4>
            {renderRankList(store.activeAbyss!.energy_skill_rank)}
          </div>

          <div class="abyss-section container">
            <h4>元素战技释放数</h4>
            {renderRankList(store.activeAbyss!.normal_skill_rank)}
          </div>
        </div>
      </Show>

      <Show when={hasBattleData()}>
        <For each={store.activeAbyss!.floors}>{floor => (
          <div class="group abyss-floor">
            <div class="group-banner">
              <div class="Subhead container">
                <div class="Subhead-heading">深境螺旋 第{CARDINAL_CHN[floor.index - 1]}层</div>
                <div class="with-abyss-star"><i class="abyss-star"></i>{floor.star} / {floor.max_star}</div>
              </div>
            </div>

            <ul class="role-list container">
              <li class="separator separator-1"></li>
              <li class="separator separator-2"></li>
              <li class="separator separator-3"></li>

              <For each={floor.levels}>{level => (
                <>
                  <li class="level-header" data-level={level.index}>
                    <div class="level-name">{floor.index}-{level.index}</div>
                    <div class="abyss-star"></div>
                    <div class="level-star">{level.star} / {level.max_star}</div>
                  </li>

                  <For each={level.battles}>{battle => (
                    <>
                      <li class="abyss-battle" data-battle={battle.index}>{formatDateTime(+battle.timestamp)}</li>
                      <For each={battle.avatars}>{(role, index) => (
                        <li class={`role-item rarity-${role.rarity}`} data-battle={battle.index} data-index={index() + 1} data-id={role.id} data-rarity={role.rarity}>
                          <div class="avatar" style={{ 'background-image': `url(${role.icon})` }}></div>
                          <div class="meta">Lv.{role.level}</div>
                        </li>
                      )}</For>
                    </>
                  )}</For>
                </>
              )}</For>
            </ul>
          </div>
        )}</For>
      </Show>

      <Show when={!hasData()}>
        <div class="no-data">
          <img src="/assets/images/placeholder.png" draggable={false} />
          <p>暂无挑战数据</p>
        </div>
      </Show>
    </div>
  );
}

function renderRankList(list: readonly SpiralAbyssRankItem[]) {
  return (
    <ul class="role-rank-list">
      <For each={list}>{item => (
        <li class={`role-rank-item rarity-${item.rarity}`} data-id={item.avatar_id} data-rarity={item.rarity}>
          <div class="avatar" style={{ 'background-image': `url(${item.avatar_icon})` }}></div>
          <div class="value">{item.value}</div>
        </li>
      )}</For>
    </ul>
  );
}
