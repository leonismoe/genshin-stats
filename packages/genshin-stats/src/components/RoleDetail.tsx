import type { CharacterDetail, Reliquary } from '@mihoyo-kit/genshin-api/lib/typings';
import { createEffect, createMemo, For, onCleanup, onMount, PropsWithChildren, Show } from 'solid-js';
import { popperGenerator, defaultModifiers, VirtualElement } from '@popperjs/core/lib/popper-lite';
import flip from '@popperjs/core/lib/modifiers/flip';
import offset, { OffsetModifier } from '@popperjs/core/lib/modifiers/offset';
import arrow from '@popperjs/core/lib/modifiers/arrow';
import '../styles/role-details.scss';

const WEAPON_PROMOTE_LEVEL = [0, 20, 40, 50, 60, 70, 80];

const createPopper = popperGenerator({
  defaultModifiers: [
    ...defaultModifiers,
    offset,
    flip,
    arrow,
  ],
});

export default (props: PropsWithChildren<{ detail: CharacterDetail, target: HTMLElement | VirtualElement }>) => {
  let $box: HTMLDivElement | undefined;
  let popper: ReturnType<typeof createPopper>;

  onMount(() => {
    popper = createPopper(props.target, $box!, {
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: ({ placement, reference, popper }) => {
              if (placement.startsWith('bottom')) {
                return [0, 38];
              } else {
                return [0, 12];
              }
            },
          },
        } as OffsetModifier,
      ],
    });
  });

  createEffect(() => {
    popper.forceUpdate();
  });

  onCleanup(() => {
    popper.destroy();
  });

  const reliquaries = createMemo(() => {
    const result: Reliquary[] = new Array(5);
    for (const item of props.detail.reliquaries) {
      result[item.pos - 1] = item;
    }
    return result;
  });

  const weapon = props.detail.weapon;

  return (
    <div ref={$box} class="Box role-details">
      <div data-popper-arrow></div>

      <button class="close-button">
        <svg width="12" height="16" viewBox="0 0 12 16" class="octicon" aria-hidden="true">
          <path fill-rule="evenodd" d="M7.48 8l3.75 3.75-1.48 1.48L6 9.48l-3.75 3.75-1.48-1.48L4.52 8 .77 4.25l1.48-1.48L6 6.52l3.75-3.75 1.48 1.48L7.48 8z"></path>
        </svg>
      </button>

      <Show when={props.detail.costumes.length > 0}>
        <div class="costumes">
          <svg viewBox="0 0 640 512" aria-hidden="true">
            <path fill="currentColor" d="M631.2 96.5L436.5 0C416.4 27.8 371.9 47.2 320 47.2S223.6 27.8 203.5 0L8.8 96.5c-7.9 4-11.1 13.6-7.2 21.5l57.2 114.5c4 7.9 13.6 11.1 21.5 7.2l56.6-27.7c10.6-5.2 23 2.5 23 14.4V480c0 17.7 14.3 32 32 32h256c17.7 0 32-14.3 32-32V226.3c0-11.8 12.4-19.6 23-14.4l56.6 27.7c7.9 4 17.5.8 21.5-7.2L638.3 118c4-7.9.8-17.6-7.1-21.5z"></path>
          </svg>
          {props.detail.costumes.length}
        </div>
      </Show>

      <div class={`weapon rarity-${props.detail.weapon.rarity} clearfix`}>
        <img src={props.detail.weapon.icon} alt={props.detail.weapon.name} />
        <span class={`star rarity-${props.detail.weapon.rarity}`}></span>
        <span class="name">{props.detail.weapon.name}</span>
        <span class="affix">精炼{props.detail.weapon.affix_level}阶</span>
        <span class="level">Lv.{props.detail.weapon.level}{WEAPON_PROMOTE_LEVEL[props.detail.weapon.promote_level] === props.detail.weapon.level && '+'}</span>
      </div>

      <ol class="reliquaries">
        <For each={reliquaries()}>{item => {
          if (!item) {
            return (<li></li>);
          }

          return (
            <li class={`rarity-${item.rarity}`} title={item.name}>
              <img src={item.icon} alt={item.name} />
              <span class={`star rarity-${item.rarity}`}></span>
              <span class="level">Lv.{item.level}</span>
            </li>
          );
        }}</For>
      </ol>
    </div>
  );
}
