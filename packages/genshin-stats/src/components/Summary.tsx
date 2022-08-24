import { For, Show } from 'solid-js';
import { store as globalStore } from '../store/global';
import store from '../store/stats';
import '../styles/summary.scss';

export default () => {
  return (
    <div
      class="genshin-summary"
      classList={{
        'group-sticky-enabled': globalStore.stick_group_banner,
      }}
    >
      <Show when={store.stats}>
        <div class="group">
          <div class="group-banner">
            <div class="Subhead container">
              <div class="Subhead-heading">数据总览</div>
            </div>
          </div>

          <ul class="container stat-data-list">
            <li>
              <p class="stat-value">{store.stats!.stats.active_day_number}</p>
              <p class="stat-title">活跃天数</p>
            </li>
            <li>
              <p class="stat-value">{store.stats!.stats.achievement_number}</p>
              <p class="stat-title">成就达成数</p>
            </li>
            <li>
              <p class="stat-value">{store.stats!.stats.avatar_number}</p>
              <p class="stat-title">获得角色数</p>
            </li>
            <li>
              <p class="stat-value">{store.stats!.stats.way_point_number}</p>
              <p class="stat-title">解锁传送点</p>
            </li>
            <li>
              <p class="stat-value">{store.stats!.stats.domain_number}</p>
              <p class="stat-title">解锁秘境</p>
            </li>
            <li>
              <p class="stat-value">{store.stats!.stats.spiral_abyss}</p>
              <p class="stat-title">深境螺旋</p>
            </li>

            <li style="grid-row: 2">
              <p class="stat-value">{store.stats!.stats.anemoculus_number}</p>
              <p class="stat-title">风神瞳</p>
            </li>
            <li style="grid-row: 2">
              <p class="stat-value">{store.stats!.stats.geoculus_number}</p>
              <p class="stat-title">岩神瞳</p>
            </li>
            <li style="grid-row: 2">
              <p class="stat-value">{store.stats!.stats.electroculus_number}</p>
              <p class="stat-title">雷神瞳</p>
            </li>
            <li style="grid-row: 2">
              <p class="stat-value">{store.stats!.stats.dendroculus_number}</p>
              <p class="stat-title">草神瞳</p>
            </li>

            <li style="grid-row: 3">
              <p class="stat-value">{store.stats!.stats.luxurious_chest_number}</p>
              <p class="stat-title">华丽宝箱数</p>
            </li>
            <li style="grid-row: 3">
              <p class="stat-value">{store.stats!.stats.precious_chest_number}</p>
              <p class="stat-title">珍贵宝箱数</p>
            </li>
            <li style="grid-row: 3">
              <p class="stat-value">{store.stats!.stats.exquisite_chest_number}</p>
              <p class="stat-title">精致宝箱数</p>
            </li>
            <li style="grid-row: 3">
              <p class="stat-value">{store.stats!.stats.common_chest_number}</p>
              <p class="stat-title">普通宝箱数</p>
            </li>
            <li style="grid-row: 3">
              <p class="stat-value">{store.stats!.stats.magic_chest_number}</p>
              <p class="stat-title">奇馈宝箱数</p>
            </li>
          </ul>
        </div>

        <div class="group">
          <div class="group-banner">
            <div class="Subhead container">
              <div class="Subhead-heading">世界探索</div>
            </div>
          </div>

          <ul class="container exploration-list">
            <For each={store.stats!.world_explorations}>{item => (
              <li data-id={item.id} data-type={item.type} data-percentage={item.exploration_percentage}>
                <img class="icon" src={item.icon} />
                <div class="content">
                  <p class="name">{item.name}</p>
                  <div class="progress">
                    <div class="value">{item.exploration_percentage / 10}%</div>
                    <div class="bar" style={{ width: `${item.exploration_percentage / 10}%` }}></div>
                  </div>
                  <Show when={item.type === 'Reputation'}>
                    <p>声望：{item.level}</p>
                  </Show>
                  <For each={item.offerings}>{offering => (
                    <p>{offering.name}：{offering.level}</p>
                  )}</For>
                </div>
              </li>
            )}</For>
          </ul>
        </div>

        <div class="group">
          <div class="group-banner">
            <div class="Subhead container">
              <div class="Subhead-heading">尘歌壶</div>
            </div>
          </div>

          <ul class="container home-list">
            <For each={store.stats!.homes}>{item => (
              <li style={{ 'background-image': `url(${item.icon})` }}>
                <div class="mask"></div>

                <div class="meta">
                  <div class="comfort">
                    <img class="icon" src={item.comfort_level_icon} />
                    <p class="name">{item.comfort_level_name}</p>
                  </div>
                  <div class="name">{item.name}</div>
                </div>

                <div class="content-wrapper">
                  <ul class="content">
                    <li><p class="value">{item.level}</p><p class="title">信任等阶</p></li>
                    <li><p class="value">{item.comfort_num}</p><p class="title">最高洞天仙力</p></li>
                    <li><p class="value">{item.item_num}</p><p class="title">获得摆设数</p></li>
                    <li><p class="value">{item.visit_num}</p><p class="title">历史访客数</p></li>
                  </ul>
                </div>
              </li>
            )}</For>
          </ul>
        </div>
      </Show>

      <Show when={!store.stats}>
        <div class="no-data">
          <img src="/assets/images/placeholder.png" draggable={false} />
          <p>暂无数据</p>
        </div>
      </Show>
    </div>
  );
}
