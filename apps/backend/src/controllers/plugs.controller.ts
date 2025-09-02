import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { SubscriptionRequired } from '@growchief/shared-backend/billing/billing.guard';
import { BotsService } from '@growchief/shared-backend/database/bots/bots.service';
import { PlugsService } from '@growchief/shared-backend/database/plugs/plugs.service';
import { GetOrganizationFromRequest } from '@growchief/backend/services/auth/org.from.request';
import type { CreatePlugDto } from '@growchief/shared-both/dto/plugs/create.plug.dto';
import type { UpdatePlugDto } from '@growchief/shared-both/dto/plugs/update.plug.dto';
import type { Organization } from '@prisma/client';

@SubscriptionRequired()
@Controller('/plugs')
export class PlugsController {
  constructor(
    private _botsService: BotsService,
    private _plugsService: PlugsService,
  ) {}

  @Get('/:platform')
  async getPlugsPerPlatform(@Param('platform') platform: string) {
    return this._botsService.getToolsPluginsByIdentifier(platform);
  }

  @Get('/bot/:botId')
  async getPlugsByBot(
    @Param('botId') botId: string,
    @GetOrganizationFromRequest() organization: Organization,
  ) {
    return this._plugsService.getPlugsByBotId(botId, organization.id);
  }

  @Post('/bot/:botId')
  async createPlug(
    @Param('botId') botId: string,
    @Body() data: CreatePlugDto,
    @GetOrganizationFromRequest() organization: Organization,
  ) {
    return this._plugsService.createPlug(botId, organization.id, data);
  }

  @Post('/bot/:botId/upsert')
  async upsertPlug(
    @Param('botId') botId: string,
    @Body() data: CreatePlugDto,
    @GetOrganizationFromRequest() organization: Organization,
  ) {
    return this._plugsService.upsertPlug(botId, organization.id, data);
  }

  @Put('/:id')
  async updatePlug(
    @Param('id') id: string,
    @Body() data: UpdatePlugDto,
    @GetOrganizationFromRequest() organization: Organization,
  ) {
    return this._plugsService.updatePlug(id, organization.id, data);
  }

  @Get('/check/:botId/:identifier')
  async getPlugByBotAndIdentifier(
    @Param('botId') botId: string,
    @Param('identifier') identifier: string,
    @GetOrganizationFromRequest() organization: Organization,
  ) {
    return this._plugsService.getPlugByBotAndIdentifier(
      botId,
      organization.id,
      identifier,
    );
  }
}
