declare module '*.html?minify' {
  const value: string;
  export default value;
}

declare module '*.html?dom' {
  export default function createElement(): HTMLElement | DocumentFragment;
}

declare module '*.html?dom&element' {
  export default function createElement(): HTMLElement;
}

declare module '*.html?dom&fragment' {
  export default function createFragment(): DocumentFragment;
}

declare module '*.html?dom&*' {
  export default function createElement(): HTMLElement | DocumentFragment;
}
