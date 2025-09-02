import { Injectable } from '@nestjs/common';
import { Activity, ActivityMethod } from 'nestjs-temporal-core';
import { PlugsService } from '@growchief/shared-backend/database/plugs/plugs.service';
import { BotsService } from '@growchief/shared-backend/database/bots/bots.service';

@Injectable()
@Activity()
export class PlugsActivity {
  constructor(
    private _plugsService: PlugsService,
    private _botsService: BotsService,
  ) {}

  @ActivityMethod()
  async getPlugs(botId: string, organizationId: string) {
    return (
      await this._plugsService.getPlugsByBotId(botId, organizationId)
    ).filter((f) => f.active);
  }

  @ActivityMethod()
  async getPlugsDescription(platform: string) {
    return this._botsService.getToolsPluginsByIdentifier(platform);
  }
}
