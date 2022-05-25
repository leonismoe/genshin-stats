let currentElement: EventTarget | null = null;

export function setTarget(target: EventTarget | null): void {
  currentElement = target;
}

export function onPointerUp(e: PointerEvent, onClick: (e: PointerEvent) => void): void {
  if (currentElement && currentElement === e.currentTarget) {
    onClick(e);
  }
}

function reset() {
  currentElement = null;
}

window.addEventListener('pointerdown', reset, { passive: true, capture: true });
window.addEventListener('pointerup', reset);
