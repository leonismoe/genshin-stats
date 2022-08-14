/// <reference lib="DOM" />

export function uuid(): string {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  } else {
    // @see https://stackoverflow.com/a/2117523
    return (([1e7] as unknown as string) + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c: any) =>
      (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
    );
  }
}
