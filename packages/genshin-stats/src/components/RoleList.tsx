import type { VirtualElement } from '@popperjs/core';
import { createEffect, createSignal, For, on, Show } from 'solid-js';
import { Portal } from 'solid-js/web';
import RoleItem from './RoleItem';
import RoleDetail from './RoleDetail';
import { store as globalStore, submitSignal } from '../store/global';
import roleStore from '../store/roles';
import store from '../store/stats';
import '../styles/roles.scss';

export default () => {
  const [activeRoleItem, setActiveRoleItem] = createSignal<HTMLElement>();
  const virtualElement: VirtualElement = {
    getBoundingClientRect() {
      return activeRoleItem()!.getBoundingClientRect();
    },
  };

  const delegateRoleClick = (e: MouseEvent) => {
    const el = e.target as HTMLElement;
    if (el.className === 'avatar' && el.parentElement?.classList.contains('role-item')) {
      e.stopPropagation();
      if (activeRoleItem() === el.parentElement || el.parentElement.classList.contains('not-owned')) {
        setActiveRoleItem();
      } else if (store.details && store.detailMap[el.parentElement!.dataset.id!]) {
        setActiveRoleItem(el.parentElement);
      }
    }
  };

  on(() => [submitSignal()], () => {
    setActiveRoleItem();
  });

  createEffect(() => {
    window.addEventListener('click', e => {
      const el = e.target as HTMLElement;
      if (!el.closest || el.closest('.close-button') || (!el.closest('.role-item .avatar') && !el.closest('.role-details.Box'))) {
        setActiveRoleItem();
      }
    });
  });

  return (
    <div
      class="role-list-wrapper"
      classList={{
        'grouping-enabled': !!roleStore.grouping,
        'group-sticky-enabled': globalStore.stick_group_banner,
        'no-details': !store.details,
      }}
      onClick={delegateRoleClick}
    >
      <Show when={store.roles.length}>
        <For each={store.groups}>{group => (
          <div class="role-group" data-type={roleStore.grouping} data-value={group.value}>
            <Show when={group.name}>
              <div class="group-banner">
                <div class="Subhead container">
                  <div class="Subhead-heading">{group.name}</div>
                </div>
              </div>
            </Show>

            <div class="container role-list">
              <For each={group.roles}>{item => (
                <RoleItem
                  id={item.id}
                  rarity={item.special_rarity || item.rarity}
                  level={item.level}
                  fetter={item.fetter}
                  element={item.element}
                  fateLevel={item.actived_constellation_num}
                  name={item.name}
                  avatar={item.image}
                />
              )}</For>
            </div>
          </div>
        )}
        </For>
      </Show>

      <Portal>
        <Show when={activeRoleItem()}>
          <RoleDetail target={virtualElement} detail={store.detailMap[activeRoleItem()!.dataset.id!]!} />
        </Show>
      </Portal>
    </div>
  );
}
