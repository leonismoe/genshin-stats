declare module '@tauri-apps/api/tauri' {
  export interface InvokeArgs {
    [key: string]: unknown;
  }

  export function invoke<T>(cmd: string, args?: InvokeArgs): Promise<T>;
}
