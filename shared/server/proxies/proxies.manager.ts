import { Injectable } from '@nestjs/common';
import { ProxiesService } from '@growchief/shared-backend/database/proxies/proxies.service';
import { proxyList } from '@growchief/shared-backend/proxies/proxy.list';

@Injectable()
export class ProxiesManager {
  constructor(private _proxiesService: ProxiesService) {}

  async createProxy(identifier: string, org: string, country: string) {
    const findProvider = proxyList.find((p) => p.identifier === identifier)!;
    if (!findProvider) {
      return;
    }
    const data = await findProvider.createProxy(country);
    return this._proxiesService.createProxy(
      identifier,
      org,
      data.ip,
      data.username,
      data.password,
      data.data,
      country,
      findProvider.connectURL(),
    );
  }

  async deleteProxy(identifier: string, ip: string, organizationId: string) {
    const findProvider = proxyList.find((p) => p.identifier === identifier)!;
    if (!findProvider) {
      return;
    }
    const proxy = await this._proxiesService.getProxyByOrgIp(
      organizationId,
      ip,
    );
    if (!proxy) {
      return;
    }
    try {
      await findProvider.deleteProxy(ip, JSON.parse(proxy.data));
    } catch (err) {}
    return this._proxiesService.deleteProxy(organizationId, ip);
  }

  async getCountryList(identifier: string) {
    const findProvider = proxyList.find((p) => p.identifier === identifier)!;
    return findProvider.countryList();
  }

  proxiesList() {
    return proxyList.map((p) => ({
      label: p.label,
      identifier: p.identifier,
    }));
  }
}
