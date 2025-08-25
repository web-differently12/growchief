import { Injectable } from '@nestjs/common';
import { Activity, ActivityMethod } from 'nestjs-temporal-core';
import { BotManager } from '@growchief/shared-backend/bots/bot.manager';
import { ProgressResponse } from '@growchief/shared-backend/temporal/progress.response';

const GAP_MS = 10 * 60_000;

@Injectable()
@Activity()
export class AccountsStepActivity {
  constructor(private _botManager: BotManager) {}
  @ActivityMethod()
  async getGap() {
    return GAP_MS;
  }
  @ActivityMethod('progress')
  async progress(params: {
    botId: string;
    platform: string;
    url: string;
    settings: any;
    organizationId: string;
    deadLine: number;
    functionName: string;
    leadId: string;
    proxyId?: string;
  }): Promise<ProgressResponse> {
    return (await this._botManager.run(true, {
      bot: params.botId,
      functionName: params.functionName,
      platform: params.platform,
      groupId: '',
      organizationId: params.organizationId,
      url: params.url,
      data: params.settings,
      deadline: params.deadLine,
      leadId: params.leadId,
      proxyId: params.proxyId,
    })) as ProgressResponse;
  }
}
