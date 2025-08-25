import {
  Organization,
  Role,
  Subscription,
  UserOrganization,
} from '@prisma/client';
import { Request } from 'express';
import { Injectable } from '@nestjs/common';
import { BotsService } from '@growchief/shared-backend/database/bots/bots.service';
import {
  Definition,
  PermissionInterface,
} from '@growchief/shared-backend/billing/permission.interface';
import { identifier } from '@growchief/shared-both/billing/billing.plans';

@Injectable()
export class AddAccountsPermission implements PermissionInterface {
  identifier = 'add_accounts';
  level = [Role.SUPERADMIN, Role.ADMIN];
  definitions: Definition[] = [
    {
      identifier: identifier.normal,
      enabled: true,
      total: 10000,
    },
  ];

  pricing = false;

  permissionDescription = 'Add an account';
  permissionName = 'Add an account';

  constructor(private _botsService: BotsService) {}
  async check(
    organization: Organization & {
      subscription?: Subscription;
      users: UserOrganization[];
    },
    definition: Definition,
  ): Promise<true | string> {
    const addBot = await this._botsService.canAddBot(
      organization.id,
      organization?.subscription?.total || 0,
    );

    if (addBot) {
      return true;
    }

    return `You have reached the maximum number of accounts allowed for your plan.
    Please upgrade your plan to add more accounts.`;
  }

  async downgrade(
    organization: Organization & {
      subscription?: Subscription;
      users: UserOrganization[];
    },
    definition: Definition,
  ) {
    const totalBots = await this._botsService.totalBots(organization.id);
    if (totalBots <= definition.total) {
      return true;
    }

    return {
      downgrade: `You have to remove ${totalBots - definition.total} accounts before downgrading your plan.`,
      denied: 'You cannot add more bots at this time.',
    };
  }
}
