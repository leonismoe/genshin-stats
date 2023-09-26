import * as undici from 'undici';
import * as AbortControllerPonyFill from 'abort-controller';

const undiciFetch = undici.fetch as unknown as typeof fetch;
const undiciHeaders = undici.Headers as typeof Headers;
const undiciRequest = undici.Request as unknown as typeof Request;
const undiciResponse = undici.Response as unknown as typeof Response;
const undiciFormData = undici.FormData as typeof FormData;
const undiciFile = undici.File as unknown as typeof File;

const actualAbortController = typeof AbortController !== 'undefined' ? AbortController : AbortControllerPonyFill.AbortController;
const actualAbortSignal = typeof AbortSignal !== 'undefined' ? AbortSignal : AbortControllerPonyFill.AbortSignal;

export default undiciFetch;
export {
  undiciFetch as fetch,
  undiciHeaders as Headers,
  undiciRequest as Request,
  undiciResponse as Response,
  undiciFormData as FormData,
  undiciFile as File,

  actualAbortController as AbortController,
  actualAbortSignal as AbortSignal,
};

