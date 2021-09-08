import type { JSX } from 'solid-js';
import type DetailsDialogElement from '@github/details-dialog-element';

declare module 'solid-js' {
  namespace JSX {
    interface IntrinsicElements {
      'details-dialog': DetailsDialogElementAttributes<HTMLElement>;
    }

    interface DetailsHtmlAttributes<T> extends HTMLAttributes<T> {
      onToggle?: EventHandlerUnion<T, Event>;
    }

    interface DetailsDialogElementAttributes<T> extends HTMLAttributes<T> {
      src?: string;
      preload?: boolean;
      'on:details-dialog-close'?: EventHandlerUnion<DetailsDialogElement, CustomEvent<null>>;
    }
  }
}
