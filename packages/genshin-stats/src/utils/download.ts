export function download(data: Blob, filename: string): void;
export function download(data: BlobPart, filename: string, options?: string | BlobPropertyBag): void;
export function download(data: Blob | BlobPart | BlobPart[], filename: string, options?: string | BlobPropertyBag): void {
  let blob: Blob;
  if (data instanceof Blob) {
    blob = data;
  } else {
    blob = new Blob(Array.isArray(data) ? data : [data], typeof options == 'string' ? { type: options } : options);
  }

  const url = URL.createObjectURL(blob);
  const el = document.createElement('a');
  el.style.display = 'none';
  el.download = filename;
  el.href = url;

  document.body.appendChild(el);
  el.click();

  setTimeout(() => {
    URL.revokeObjectURL(url);
    document.body.removeChild(el);
  }, 2000);
}

export default download;
