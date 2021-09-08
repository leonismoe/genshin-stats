interface HTMLScriptAttributes {
  async?: boolean;
  crossOrigin?: string;
  defer?: boolean;
  integrity?: string;
  noModule?: boolean;
  referrerPolicy?: string;
  type?: string;
}

export default function loadJS(url: string, attributes?: HTMLScriptAttributes): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    if (attributes) {
      for (const name in attributes) {
        // @ts-ignore
        script[name] = attributes[name];
      }
    }

    const cleanup = () => {
      script.remove();
    };

    script.onload = () => {
      cleanup();
      resolve();
    };

    script.onerror = (e) => {
      cleanup();
      reject(e);
    };

    script.src = url;
    document.head.appendChild(script);
  });
}
