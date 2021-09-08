let root: CSSStyleRule;

export function set(name: string, value: string | number): void {
  if (!root) {
    let style = document.querySelector('link[rel=stylesheet], style') as HTMLLinkElement | HTMLStyleElement;
    if (!style || !style.sheet) {
      style = document.createElement('style');
      document.head.appendChild(style);
    }

    const sheet = style.sheet!;
    sheet.addRule(':root', '');
    root = sheet.cssRules[sheet.cssRules.length - 1] as CSSStyleRule;
  }

  root.style.setProperty(name, value as string);
}

export function get(name: string): string {
  return root ? root.style.getPropertyValue(name) : '';
}
