import { ProxyProviderInterface } from '@growchief/shared-backend/proxies/proxy.provider.interface';
import { BrightDataProvider } from '@growchief/shared-backend/proxies/providers/brightdata.provider';

export const proxyList: ProxyProviderInterface<any>[] = [
  new BrightDataProvider(),
];
