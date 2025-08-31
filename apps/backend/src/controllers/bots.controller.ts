import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { BotsService } from '@growchief/shared-backend/database/bots/bots.service';
import { GetOrganizationFromRequest } from '@growchief/backend/services/auth/org.from.request';
import type { Organization } from '@prisma/client';
import { botList } from '@growchief/shared-backend/bots/bot.list';
import { SubscriptionRequired } from '@growchief/shared-backend/billing/billing.guard';
import { AddAccountsPermission } from '@growchief/shared-backend/billing/permissions/add.accounts.permission';
import { Permission } from '@growchief/shared-backend/billing/permission.interface';

@SubscriptionRequired()
@Controller('/bots')
export class BotsController {
  constructor(private _botsService: BotsService) {}

  @Get('/groups-bots')
  async botsGroups(@GetOrganizationFromRequest() organization: Organization) {
    return this._botsService.getGroupsAndBotsByOrganization(organization.id);
  }

  @Permission(AddAccountsPermission)
  @Get('/can-add-account')
  async allowed() {
    return true;
  }

  @Put('/:id/assign-proxy')
  async assignProxy(
    @Param('id') id: string,
    @Body() body: { proxyId: string },
    @GetOrganizationFromRequest() organization: Organization,
  ) {
    return this._botsService.assignProxy(id, organization.id, body.proxyId);
  }

  @Get('/platforms')
  getPlatforms() {
    return botList.map((p) => ({
      name: p.label,
      identifier: p.identifier,
    }));
  }

  @Get('/tools')
  getTools() {
    return botList.map((p) => ({
      name: p.label,
      identifier: p.identifier,
      tools: this._botsService.getToolsByIdentifier(p.identifier)?.tools || [],
    }));
  }

  @Get('/groups')
  async getBotGroups(@GetOrganizationFromRequest() organization: Organization) {
    return this._botsService.getBotGroups(organization.id);
  }

  @Get('/groups/:id')
  async getBotGroup(
    @Param('id') id: string,
    @GetOrganizationFromRequest() organization: Organization,
  ) {
    return this._botsService.getBotGroup(id, organization.id);
  }

  @Post('/groups')
  async createBotGroup(
    @Body('name') name: string,
    @GetOrganizationFromRequest() organization: Organization,
  ) {
    return this._botsService.createBotGroup(organization.id, name);
  }

  @Delete('/groups/:id')
  async deleteBotGroup(
    @Param('id') id: string,
    @GetOrganizationFromRequest() organization: Organization,
  ) {
    return this._botsService.deleteBotGroup(id, organization.id);
  }

  // Bot endpoints
  @Get('/groups/:groupId/bots')
  async getBotsByGroup(
    @Param('groupId') groupId: string,
    @GetOrganizationFromRequest() organization: Organization,
  ) {
    return this._botsService.getBotsByGroup(groupId, organization.id);
  }

  @Get('/all')
  async getAllBots(@GetOrganizationFromRequest() organization: Organization) {
    return this._botsService.getAllBots(organization.id);
  }

  @Get('/:id')
  async getBot(
    @Param('id') id: string,
    @GetOrganizationFromRequest() organization: Organization,
  ) {
    return this._botsService.getBot(id, organization.id);
  }

  @Delete('/:id')
  async deleteBot(
    @Param('id') id: string,
    @GetOrganizationFromRequest() organization: Organization,
  ) {
    return this._botsService.deleteBot(id, organization.id);
  }

  @Put('/:id/working-hours')
  async updateBotWorkingHours(
    @Param('id') id: string,
    @Body() body: { timezone: number; workingHours: string },
    @GetOrganizationFromRequest() organization: Organization,
  ) {
    return this._botsService.updateBotWorkingHours(
      id,
      organization.id,
      body.timezone,
      body.workingHours,
    );
  }

  @Put('/:id/move-group')
  async moveBotToGroup(
    @Param('id') id: string,
    @Body() body: { groupId: string },
    @GetOrganizationFromRequest() organization: Organization,
  ) {
    return this._botsService.moveBotToGroup(id, organization.id, body.groupId);
  }

  @Put('/:id/status')
  async updateBotStatus(
    @Param('id') id: string,
    @Body() body: { status: 'ACTIVE' | 'PAUSED' },
    @GetOrganizationFromRequest() organization: Organization,
  ) {
    return this._botsService.updateBotStatus(id, organization.id, body.status);
  }

  @Put('/:id/remove-proxy')
  async removeProxy(
    @Param('id') id: string,
    @GetOrganizationFromRequest() organization: Organization,
  ) {
    return this._botsService.removeProxy(id, organization.id);
  }

  // Statistics endpoints
  @Get('/stats/dashboard')
  async getDashboardStats(
    @GetOrganizationFromRequest() organization: Organization,
  ) {
    return this._botsService.getDashboardStats(organization.id);
  }

  @Get('/stats/groups-count')
  async getBotGroupsCount(
    @GetOrganizationFromRequest() organization: Organization,
  ) {
    return {
      count: await this._botsService.getBotGroupsCount(organization.id),
    };
  }

  @Get('/stats/bots-count')
  async getBotsCount(@GetOrganizationFromRequest() organization: Organization) {
    return {
      count: await this._botsService.getBotsCount(organization.id),
    };
  }

  @Get('/stats/active-bots-count')
  async getActiveBotsCount(
    @GetOrganizationFromRequest() organization: Organization,
  ) {
    return {
      count: await this._botsService.getActiveBotsCount(organization.id),
    };
  }

  @Get('/status/:id')
  status(
    @Param('id') id: string,
    @GetOrganizationFromRequest() organization: Organization,
  ) {
    return this._botsService.getBotStatus(organization.id, id);
  }
}
