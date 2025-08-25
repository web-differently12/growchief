import { Injectable } from '@nestjs/common';
import {
  PrismaRepository,
  PrismaService,
} from '@growchief/shared-backend/database/prisma';
import { Status } from '@prisma/client';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

@Injectable()
export class BotsRepository {
  constructor(
    private _botGroup: PrismaRepository<'botGroup'>,
    private _bot: PrismaRepository<'bot'>,
    private _activity: PrismaRepository<'activity'>,
    private _workflows: PrismaRepository<'workflows'>,
    private _restrictions: PrismaRepository<'restrictions'>,
    private _prisma: PrismaService,
  ) {}

  async getGroupsAndBotsByOrganization(organizationId: string) {
    return this._botGroup.model.botGroup.findMany({
      where: {
        organizationId,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        bots: {
          where: {
            deletedAt: null,
          },
          select: {
            id: true,
            name: true,
            profilePicture: true,
            platform: true,
            proxyId: true,
            status: true,
            logged: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // BotGroup operations
  async getBotGroupsByOrganization(organizationId: string) {
    return this._botGroup.model.botGroup.findMany({
      where: {
        organizationId,
        deletedAt: null,
      },
      include: {
        _count: {
          select: {
            bots: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getBotGroupById(id: string, organizationId: string) {
    return this._botGroup.model.botGroup.findFirst({
      where: {
        id,
        organizationId,
        deletedAt: null,
      },
      include: {
        bots: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
  }

  async createBotGroup(organizationId: string, name: string) {
    return this._botGroup.model.botGroup.create({
      data: {
        name,
        organizationId,
        active: true,
      },
      select: {
        id: true,
        name: true,
        active: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            bots: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },
    });
  }

  async deleteBotGroup(id: string, organizationId: string) {
    return this._botGroup.model.botGroup.updateMany({
      where: {
        id,
        organizationId,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  // Bot operations
  async getBotsByGroup(botGroupId: string, organizationId: string) {
    return this._bot.model.bot.findMany({
      where: {
        botGroupId,
        organizationId,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        profilePicture: true,
        platform: true,
        proxyId: true,
        status: true,
        logged: true,
        timezone: true,
        workingHours: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getBotsByOrganization(organizationId: string) {
    return this._bot.model.bot.findMany({
      where: {
        organizationId,
        deletedAt: null,
      },
      include: {
        botGroup: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getBotById(id: string, organizationId?: string) {
    return this._bot.model.bot.findFirst({
      where: {
        id,
        ...(organizationId ? { organizationId } : {}),
      },
      include: {
        proxy: true,
        organization: {
          select: {
            id: true,
          },
        },
        botGroup: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async deleteBot(id: string, organizationId: string) {
    return this._bot.model.bot.updateMany({
      where: {
        id,
        organizationId,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async updateBotWorkingHours(
    id: string,
    organizationId: string,
    timezone: number,
    workingHours: string,
  ) {
    return this._bot.model.bot.updateMany({
      where: {
        id,
        organizationId,
        deletedAt: null,
      },
      data: {
        timezone,
        workingHours,
        updatedAt: new Date(),
      },
    });
  }

  async moveBotToGroup(id: string, organizationId: string, groupId: string) {
    return this._bot.model.bot.updateMany({
      where: {
        id,
        organizationId,
        deletedAt: null,
      },
      data: {
        botGroupId: groupId,
        updatedAt: new Date(),
      },
    });
  }

  async updateBotStatus(
    id: string,
    organizationId: string,
    status: 'ACTIVE' | 'PAUSED',
  ) {
    return this._bot.model.bot.updateMany({
      where: {
        id,
        organizationId,
        deletedAt: null,
      },
      data: {
        status,
        updatedAt: new Date(),
      },
    });
  }

  async assignProxy(id: string, organizationId: string, proxyId: string) {
    return this._bot.model.bot.updateMany({
      where: {
        id,
        organizationId,
        deletedAt: null,
      },
      data: {
        proxyId,
        updatedAt: new Date(),
      },
    });
  }

  async removeProxy(id: string, organizationId: string) {
    return this._bot.model.bot.updateMany({
      where: {
        id,
        organizationId,
        deletedAt: null,
      },
      data: {
        proxyId: null,
        updatedAt: new Date(),
      },
    });
  }

  async getBotGroupsCount(organizationId: string) {
    return this._botGroup.model.botGroup.count({
      where: {
        organizationId,
        deletedAt: null,
      },
    });
  }

  async getBotsCount(organizationId: string) {
    return this._bot.model.bot.count({
      where: {
        organizationId,
        deletedAt: null,
      },
    });
  }

  async getActiveBotsCount(organizationId: string) {
    return this._bot.model.bot.count({
      where: {
        organizationId,
        status: Status.ACTIVE,
        deletedAt: null,
      },
    });
  }

  async saveActivity(
    leadId: string,
    organizationId: string,
    type: string,
    botId: string,
    stepId: string,
    workflowId: string,
  ) {
    return this._activity.model.activity.upsert({
      where: {
        leadId_organizationId_type_botId_stepId_workflowId: {
          botId,
          leadId,
          organizationId,
          type,
          stepId,
          workflowId,
        },
      },
      create: {
        leadId,
        organizationId,
        type,
        botId,
        stepId,
        workflowId,
      },
      update: {},
    });
  }

  async saveStorageAndActions(
    orgId: string,
    platform: string,
    name: string,
    picture: string,
    internalId: string,
    botGroup: string,
    bot: string,
    storage: object,
    loggedIn: boolean,
  ) {
    // This might happen if two bots trying to update the context at the same time, better be careful
    const { logged, id } = await this._prisma.$transaction(async (prism) => {
      if (!bot && name && platform && internalId && orgId) {
        const { id } = await prism.bot.upsert({
          where: {
            organizationId_platform_internalId: {
              organizationId: orgId,
              platform,
              internalId,
            },
          },
          create: {
            internalId,
            name,
            platform,
            botGroupId: botGroup,
            organizationId: orgId,
            storage: JSON.stringify(storage),
            status: 'ACTIVE',
            profilePicture: picture,
          },
          update: {
            internalId,
            name,
            platform,
            botGroupId: botGroup,
            organizationId: orgId,
            storage: JSON.stringify(storage),
            status: 'ACTIVE',
            profilePicture: picture,
            deletedAt: null,
          },
        });

        return { organizationId: orgId, id, logged: loggedIn };
      }

      if (!bot) {
        return { id: null, organizationId: orgId, logged: loggedIn };
      }

      const { organizationId } = await prism.bot.update({
        where: {
          id: bot,
        },
        data: {
          storage: JSON.stringify(storage),
          status: 'ACTIVE',
        },
      });

      const { logged } = await prism.bot.update({
        where: {
          id: bot,
        },
        data: {
          logged: loggedIn,
        },
      });

      return { id: bot, organizationId, logged };
    });

    return { logged, id };
  }

  async disableAll(organizationId: string) {
    await this._workflows.model.workflows.updateMany({
      where: {
        organizationId,
      },
      data: {
        active: false,
        deletedAt: new Date(),
      },
    });

    await this._bot.model.bot.updateMany({
      where: {
        organizationId,
      },
      data: {
        deletedAt: new Date(),
        status: 'PAUSED',
        proxyId: null,
      },
    });
  }

  async canAddBot(organizationId: string, currentTotal: number) {
    const totalBots = await this._bot.model.bot.count({
      where: {
        organizationId,
        deletedAt: null,
      },
    });

    return totalBots < currentTotal;
  }

  totalBots(organizationId: string) {
    return this._bot.model.bot.count({
      where: {
        organizationId,
        deletedAt: null,
      },
    });
  }

  async getStepRestrictions(botId: string, methodName: string) {
    return this._restrictions.model.restrictions.findFirst({
      where: {
        botId,
        methodName,
        until: {
          gt: dayjs().utc().toDate(),
        },
      },
      select: {
        until: true,
      },
    });
  }

  saveRestriction(botId: string, methodName: string, date: Date) {
    return this._restrictions.model.restrictions.create({
      data: {
        botId,
        methodName,
        until: date,
      },
    });
  }
}
