import { Injectable } from '@nestjs/common';
import { PlugsRepository } from '@growchief/shared-backend/database/plugs/plugs.repository';
import { CreatePlugDto } from '@growchief/shared-both/dto/plugs/create.plug.dto';
import { UpdatePlugDto } from '@growchief/shared-both/dto/plugs/update.plug.dto';

@Injectable()
export class PlugsService {
  constructor(private _plugsRepository: PlugsRepository) {}

  async getPlugsByBotId(botId: string, organizationId: string) {
    return this._plugsRepository.getPlugsByBotId(botId, organizationId);
  }

  async getPlugById(id: string, organizationId: string) {
    return this._plugsRepository.getPlugById(id, organizationId);
  }

  async createPlug(botId: string, organizationId: string, data: CreatePlugDto) {
    return this._plugsRepository.createPlug(botId, organizationId, data);
  }

  async updatePlug(id: string, organizationId: string, data: UpdatePlugDto) {
    const result = await this._plugsRepository.updatePlug(
      id,
      organizationId,
      data,
    );
    if (result.count === 0) {
      throw new Error('Plug not found or access denied');
    }
    return result;
  }

  async deletePlug(id: string, organizationId: string) {
    const result = await this._plugsRepository.deletePlug(id, organizationId);
    if (result.count === 0) {
      throw new Error('Plug not found or access denied');
    }
    return result;
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
