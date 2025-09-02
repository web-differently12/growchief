import { Controller, Get, Param } from '@nestjs/common';
import { SubscriptionRequired } from '@growchief/shared-backend/billing/billing.guard';
import { BotsService } from '@growchief/shared-backend/database/bots/bots.service';
import { PlugsService } from '@growchief/shared-backend/database/plugs/plugs.service';

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
}
