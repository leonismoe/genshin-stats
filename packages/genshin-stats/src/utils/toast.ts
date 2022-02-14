import createToastElement from './toast.tpl.html?dom&element';
import '../styles/toast.scss';

export interface ToastOptions {
  type?: 'info' | 'success' | 'warning' | 'error' | 'loading';
  html?: boolean;
  sticky?: boolean;
  timeout?: number;
  dismissable?: boolean;
  className?: string;
}

const SVG = {
  info: '<svg width="14" height="16" viewBox="0 0 14 16" class="octicon octicon-info" aria-hidden="true"><path fill-rule="evenodd" d="M6.3 5.69a.942.942 0 0 1-.28-.7c0-.28.09-.52.28-.7.19-.18.42-.28.7-.28.28 0 .52.09.7.28.18.19.28.42.28.7 0 .28-.09.52-.28.7a1 1 0 0 1-.7.3c-.28 0-.52-.11-.7-.3zM8 7.99c-.02-.25-.11-.48-.31-.69-.2-.19-.42-.3-.69-.31H6c-.27.02-.48.13-.69.31-.2.2-.3.44-.31.69h1v3c.02.27.11.5.31.69.2.2.42.31.69.31h1c.27 0 .48-.11.69-.31.2-.19.3-.42.31-.69H8V7.98v.01zM7 2.3c-3.14 0-5.7 2.54-5.7 5.68 0 3.14 2.56 5.7 5.7 5.7s5.7-2.55 5.7-5.7c0-3.15-2.56-5.69-5.7-5.69v.01zM7 .98c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.12-7-7 3.14-7 7-7z" /></svg>',
  error: '<svg width="14" height="16" viewBox="0 0 14 16" class="octicon octicon-stop" aria-hidden="true"><path fill-rule="evenodd" d="M10 1H4L0 5v6l4 4h6l4-4V5l-4-4zm3 9.5L9.5 14h-5L1 10.5v-5L4.5 2h5L13 5.5v5zM6 4h2v5H6V4zm0 6h2v2H6v-2z"/></svg>',
  success: '<svg width="12" height="16" viewBox="0 0 12 16" class="octicon octicon-check" aria-hidden="true"><path fill-rule="evenodd" d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5L12 5z" /></svg>',
  warning: '<svg width="16" height="16" viewBox="0 0 16 16" class="octicon octicon-alert" aria-hidden="true"><path fill-rule="evenodd" d="M8.893 1.5c-.183-.31-.52-.5-.887-.5s-.703.19-.886.5L.138 13.499a.98.98 0 0 0 0 1.001c.193.31.53.501.886.501h13.964c.367 0 .704-.19.877-.5a1.03 1.03 0 0 0 .01-1.002L8.893 1.5zm.133 11.497H6.987v-2.003h2.039v2.003zm0-3.004H6.987V5.987h2.039v4.006z"/></svg>',
  loading: '<svg class="Toast--spinner" viewBox="0 0 32 32" width="18" height="18"><path fill="#959da5" d="M16 0 A16 16 0 0 0 16 32 A16 16 0 0 0 16 0 M16 4 A12 12 0 0 1 16 28 A12 12 0 0 1 16 4"/><path fill="#ffffff" d="M16 0 A16 16 0 0 1 32 16 L28 16 A12 12 0 0 0 16 4z"></path></svg>',
};

let $container: HTMLElement;

export function show(message: string | Node | DocumentFragment, options?: ToastOptions): () => void {
  if (!$container) {
    $container = document.createElement('div');
    $container.className = 'toast-wrapper';
    document.body.appendChild($container);
  }

  const type = options?.type || 'info';
  const el = createToastElement();
  el.classList.add(`Toast--${type}`);
  el.querySelector('.Toast-icon')!.innerHTML = SVG[type];

  if (options?.className) {
    el.className += options.className;
  }

  if (options?.dismissable === false) {
    el.querySelector('.Toast-dismissButton')!.remove();
  }

  const $content = el.querySelector('.Toast-content')!;
  if (typeof message === 'string') {
    if (options?.html) {
      $content.innerHTML = message;
    } else {
      $content.textContent = message;
    }
  } else {
    $content.appendChild(message);
  }

  let closed = false;
  function close() {
    if (!closed) {
      closed = true;
      el.style.pointerEvents = 'none';
      el.classList.add('Toast--animateOut');
      setTimeout(() => el.remove(), 200);
    }
  }

  el.addEventListener('click', e => {
    if ((e.target as HTMLElement).closest('[data-dismiss=toast]')) {
      if ((e.target as HTMLElement).tagName === 'A' && (e.target as HTMLAnchorElement).getAttribute('href') === '#') {
        e.preventDefault();
      }
      close();
    }
  }, false);

  $container.appendChild(el);
  setTimeout(() => {
    el.classList.remove('Toast--animateIn');
  }, 200);

  if (!options?.sticky) {
    const timeout = options?.timeout || 3000;
    if (timeout) {
      setTimeout(close, timeout);
    }
  }

  return close;
}
