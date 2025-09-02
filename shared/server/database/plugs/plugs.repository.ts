import { Injectable } from '@nestjs/common';
import { PrismaRepository } from '@growchief/shared-backend/database/prisma';
import { CreatePlugDto } from '@growchief/shared-both/dto/plugs/create.plug.dto';
import { UpdatePlugDto } from '@growchief/shared-both/dto/plugs/update.plug.dto';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

@Injectable()
export class PlugsRepository {
  constructor(private _plugs: PrismaRepository<'plugs'>) {}

  async getPlugsByBotId(botId: string, organizationId: string) {
    return this._plugs.model.plugs.findMany({
      where: {
        botId,
        organizationId,
        deletedAt: null,
      },
      select: {
        id: true,
        identifier: true,
        active: true,
        createdAt: true,
        updatedAt: true,
        data: true,
        bot: {
          select: {
            platform: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getPlugById(id: string, organizationId: string) {
    return this._plugs.model.plugs.findFirst({
      where: {
        id,
        organizationId,
        deletedAt: null,
      },
    });
  }

  async createPlug(botId: string, organizationId: string, data: CreatePlugDto) {
    return this._plugs.model.plugs.create({
      data: {
        botId,
        organizationId,
        identifier: data.identifier,
        active: data.active,
        data: data.data || '[]',
      },
      select: {
        id: true,
        identifier: true,
        active: true,
        data: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updatePlug(id: string, organizationId: string, data: UpdatePlugDto) {
    return this._plugs.model.plugs.update({
      where: {
        id,
        organizationId,
        deletedAt: null,
      },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      select: {
        botId: true,
      },
    });
  }

  async getPlugByBotAndIdentifier(
    botId: string,
    organizationId: string,
    identifier: string,
  ) {
    return this._plugs.model.plugs.findFirst({
      where: {
        botId,
        organizationId,
        identifier,
        deletedAt: null,
      },
    });
  }

  async upsertPlug(botId: string, organizationId: string, data: CreatePlugDto) {
    return this._plugs.model.plugs.upsert({
      where: {
        botId_identifier: {
          botId,
          identifier: data.identifier,
        },
      },
      create: {
        botId,
        organizationId,
        identifier: data.identifier,
        active: data.active,
        data: data.data || '[]',
      },
      update: {
        active: data.active,
        data: data.data || '[]',
        updatedAt: new Date(),
        deletedAt: null, // In case it was soft deleted
      },
      select: {
        id: true,
        identifier: true,
        active: true,
        data: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
