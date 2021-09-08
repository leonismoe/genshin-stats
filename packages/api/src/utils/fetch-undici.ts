// @ts-nocheck

import undici from 'undici';

const undiciFetch = undici.fetch as typeof fetch;
const undiciHeaders = undici.Headers as typeof Headers;
const undiciRequest = undici.Request as typeof Request;
const undiciResponse = undici.Response as typeof Response;
const undiciFormData = undici.FormData as typeof FormData;
const undiciFile = undici.File as typeof File;

export default undiciFetch;
export {
  undiciFetch as fetch,
  undiciHeaders as Headers,
  undiciRequest as Request,
  undiciResponse as Response,
  undiciFormData as FormData,
  undiciFile as File,
};

export { AbortController, AbortSignal } from 'abort-controller';
