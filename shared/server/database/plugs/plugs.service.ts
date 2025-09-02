import { Injectable } from '@nestjs/common';
import { PlugsRepository } from '@growchief/shared-backend/database/plugs/plugs.repository';
import { CreatePlugDto } from '@growchief/shared-both/dto/plugs/create.plug.dto';
import { UpdatePlugDto } from '@growchief/shared-both/dto/plugs/update.plug.dto';
import { TemporalService } from 'nestjs-temporal-core';
import { workflowPlugs } from '@growchief/orchestrator/workflows';
import { TypedSearchAttributes } from '@temporalio/common';
import {
  botId as typedBotId,
  organizationId,
} from '@growchief/shared-backend/temporal/temporal.search.attribute';

@Injectable()
export class PlugsService {
  constructor(
    private _plugsRepository: PlugsRepository,
    private _temporalService: TemporalService,
  ) {}

  async getPlugsByBotId(botId: string, organizationId: string) {
    return this._plugsRepository.getPlugsByBotId(botId, organizationId);
  }

  async getPlugById(id: string, organizationId: string) {
    return this._plugsRepository.getPlugById(id, organizationId);
  }

  async startPlugs(botId: string, orgId: string) {
    try {
      await this._temporalService
        ?.getClient()
        ?.getRawClient()
        ?.workflow?.start('workflowPlugs', {
          args: [{ botId, orgId }],
          workflowId: `plugs-${botId}`,
          taskQueue: 'main',
          typedSearchAttributes: new TypedSearchAttributes([
            {
              key: typedBotId,
              value: botId,
            },
            {
              key: organizationId,
              value: orgId,
            },
          ]),
        });
    } catch (err) {}
  }

  async createPlug(botId: string, organizationId: string, data: CreatePlugDto) {
    const plug = await this._plugsRepository.createPlug(
      botId,
      organizationId,
      data,
    );
    await this.startPlugs(botId, organizationId);
    return plug;
  }

  async updatePlug(id: string, organizationId: string, data: UpdatePlugDto) {
    const result = await this._plugsRepository.updatePlug(
      id,
      organizationId,
      data,
    );
    if (!result) {
      throw new Error('Plug not found or access denied');
    }
    await this.startPlugs(result.botId, organizationId);
    return [result];
  }

  async upsertPlug(botId: string, organizationId: string, data: CreatePlugDto) {
    return this._plugsRepository.upsertPlug(botId, organizationId, data);
  }

  async getPlugByBotAndIdentifier(
    botId: string,
    organizationId: string,
    identifier: string,
  ) {
    return this._plugsRepository.getPlugByBotAndIdentifier(
      botId,
      organizationId,
      identifier,
    );
  }
}
