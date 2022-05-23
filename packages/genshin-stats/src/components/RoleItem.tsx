import { ParentProps, Show } from 'solid-js';
import { isPlayer } from '@mihoyo-kit/genshin-data';
import '../styles/roles.scss';

interface RoleItemProps {
  id: number | string;
  rarity: number;
  level: number;
  fetter: number;
  fateLevel: number;
  element: string;
  name: string;
  avatar: string;
}

export default (props: ParentProps<RoleItemProps>) => {
  return (
    <div
      class={`role-item rarity-${props.rarity}`}
      classList={{ 'not-owned': isNaN(props.fateLevel) || props.fateLevel < 0 }}
      data-id={props.id}
      data-rarity={props.rarity}
    >
      <div class="avatar" style={{ 'background-image': `url(${props.avatar})` }}></div>
      <div class="meta">
        <Show when={props.fateLevel >= 0} fallback={'-'}>
          <div class="level">Lv.{props.level}</div>
          <Show when={!isPlayer(props.id)}>
            <div class="fetter">{props.fetter}</div>
          </Show>
        </Show>
      </div>

      <div class={`star rarity-${props.rarity}`}></div>
      <div class={`element element-${props.element.toLowerCase()}`}></div>
      <div class="name">{props.name}</div>

      <Show when={props.fateLevel > 0}>
        <div class="fate-level">{props.fateLevel}</div>
      </Show>
    </div>
  );
}
