import { APIClientType } from '@mihoyo-kit/api';
import { getLatestReleaseCN } from '@mihoyo-kit/api/lib/hoyolab';

console.log(await getLatestReleaseCN(APIClientType.ANDROID));
