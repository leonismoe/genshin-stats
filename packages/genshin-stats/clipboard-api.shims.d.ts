import type { Clipboard } from 'typescript/lib/lib.dom';

declare global {
  interface Clipboard extends EventTarget {
    write(data: ClipboardItem[]): Promise<void>;
  }

  declare class ClipboardItem {
    readonly types: readonly string[];
    readonly presentationStyle: 'unspecified' | 'inline' | 'attachment';

    constructor(items: ClipboardItemData, options?: ClipboardItemOptions);
    getType(mimeType: string): Promise<Blob>;
  }

  interface ClipboardItemData {
    [mimeType: string]: Blob | string | Promise<Blob | string>;
  }

  interface ClipboardItemOptions {
    presentationStyle?: 'unspecified' | 'inline' | 'attachment';
  }
}
