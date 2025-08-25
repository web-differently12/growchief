import { Injectable } from '@nestjs/common';
import { ProxiesRepository } from '@growchief/shared-backend/database/proxies/proxies.repository';

@Injectable()
export class ProxiesService {
  constructor(private _proxiesRepository: ProxiesRepository) {}

  async getProxiesByOrganization(organizationId: string) {
    return this._proxiesRepository.getProxiesByOrganization(organizationId);
  }

  async getProxyById(id: string, organizationId: string) {
    return this._proxiesRepository.getProxyById(id, organizationId);
  }

  async getProxiesCount(organizationId: string) {
    return this._proxiesRepository.getProxiesCount(organizationId);
  }

  async createCustomProxy(
    organizationId: string,
    serverAddress: string,
    username: string,
    password: string,
  ) {
    return this._proxiesRepository.createCustomProxy(
      organizationId,
      serverAddress,
      username,
      password,
    );
  }

  createProxy(
    identifier: string,
    org: string,
    ip: string,
    username: string,
    password: string,
    data: any,
    country: string,
    server: string,
  ) {
    return this._proxiesRepository.createProxy(
      identifier,
      org,
      ip,
      username,
      password,
      data,
      country,
      server,
    );
  }

  getProxyByOrgIp(organizationId: string, ip: string) {
    return this._proxiesRepository.getProxyByOrgIp(organizationId, ip);
  }

  async deleteProxy(organizationId: string, ip: string) {
    return this._proxiesRepository.deleteProxy(organizationId, ip);
  }

  getAllProxiesByOrganization(organizationId: string) {
    return this._proxiesRepository.getAllProxiesByOrganization(organizationId);
  }

  canAddProxy(organizationId: string, currentTotal: number) {
    return this._proxiesRepository.canAddProxy(organizationId, currentTotal);
  }

  totalProxies(organizationId: string) {
    return this._proxiesRepository.totalProxies(organizationId);
  }
}
