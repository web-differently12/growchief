import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { GetOrganizationFromRequest } from '@growchief/backend/services/auth/org.from.request';
import type { Organization } from '@prisma/client';
import { ProxiesService } from '@growchief/shared-backend/database/proxies/proxies.service';
import { ProxiesManager } from '@growchief/shared-backend/proxies/proxies.manager';
import { CreateProxyDto } from '@growchief/shared-both/dto/proxies/create.proxy.dto';
import { DeleteProxyDto } from '@growchief/shared-both/dto/proxies/delete.proxy.dto';
import { SubscriptionRequired } from '@growchief/shared-backend/billing/billing.guard';
import { Permission } from '@growchief/shared-backend/billing/permission.interface';
import { AddProxiesPermission } from '@growchief/shared-backend/billing/permissions/add.proxies.permission';

@SubscriptionRequired()
@Controller('/proxies')
export class ProxiesController {
  constructor(
    private _proxiesService: ProxiesService,
    private _proxiesManager: ProxiesManager,
  ) {}

  @Post('/custom')
  async createCustomProxy(
    @Body() body: { serverAddress: string; username: string; password: string },
    @GetOrganizationFromRequest() organization: Organization,
  ) {
    const proxy = await this._proxiesService.createCustomProxy(
      organization.id,
      body.serverAddress,
      body.username,
      body.password,
    );

    // Remove sensitive data before sending to frontend
    return {
      id: proxy.id,
      ip: proxy.ip,
      provider: proxy.provider,
      country: proxy.country,
      createdAt: proxy.createdAt,
      updatedAt: proxy.updatedAt,
    };
  }

  @Get('/types')
  async types() {
    return this._proxiesManager.proxiesList();
  }

  @Get('/:identifier/countries')
  async countryList(@Param('identifier') identifier: string) {
    return this._proxiesManager.getCountryList(identifier);
  }

  @Permission(AddProxiesPermission)
  @Post('/:identifier')
  async createProxy(
    @GetOrganizationFromRequest() org: Organization,
    @Param('identifier') identifier: string,
    @Body() body: CreateProxyDto,
  ) {
    return this._proxiesManager.createProxy(identifier, org.id, body.country);
  }

  @Delete('/:identifier')
  async deleteProxy(
    @GetOrganizationFromRequest() org: Organization,
    @Param('identifier') identifier: string,
    @Body() body: DeleteProxyDto,
  ) {
    return this._proxiesManager.deleteProxy(identifier, body.ip, org.id);
  }

  @Get('/')
  async getProxies(@GetOrganizationFromRequest() organization: Organization) {
    const proxies = await this._proxiesService.getProxiesByOrganization(
      organization.id,
    );

    // Remove sensitive data before sending to frontend
    return proxies.map((proxy) => ({
      id: proxy.id,
      ip: proxy.ip,
      provider: proxy.provider,
      country: proxy.country,
      createdAt: proxy.createdAt,
      updatedAt: proxy.updatedAt,
      botsCount: proxy._count.bots,
    }));
  }

  @Get('/:id')
  async getProxy(
    @Param('id') id: string,
    @GetOrganizationFromRequest() organization: Organization,
  ) {
    const proxy = await this._proxiesService.getProxyById(id, organization.id);

    if (!proxy) {
      return null;
    }

    // Remove sensitive data before sending to frontend
    return {
      id: proxy.id,
      ip: proxy.ip,
      provider: proxy.provider,
      country: proxy.country,
      createdAt: proxy.createdAt,
      updatedAt: proxy.updatedAt,
      bots: proxy.bots,
    };
  }

  @Delete('/custom/:id')
  async deleteCustomProxy(
    @Param('id') id: string,
    @GetOrganizationFromRequest() organization: Organization,
  ) {
    const proxy = await this._proxiesService.getProxyById(id, organization.id);

    if (!proxy) {
      return { error: 'Proxy not found' };
    }

    if (proxy.provider !== 'custom') {
      return { error: 'This endpoint is only for custom proxies' };
    }

    await this._proxiesService.deleteProxy(organization.id, proxy.ip);
    return { success: true };
  }

  @Get('/stats/count')
  async getProxiesCount(
    @GetOrganizationFromRequest() organization: Organization,
  ) {
    return {
      count: await this._proxiesService.getProxiesCount(organization.id),
    };
  }
}
