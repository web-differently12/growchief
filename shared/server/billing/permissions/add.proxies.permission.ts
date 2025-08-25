import {
  Organization,
  Role,
  Subscription,
  UserOrganization,
} from '@prisma/client';
import { Injectable } from '@nestjs/common';
import {
  Definition,
  PermissionInterface,
} from '@growchief/shared-backend/billing/permission.interface';
import { identifier } from '@growchief/shared-both/billing/billing.plans';
import { ProxiesService } from '@growchief/shared-backend/database/proxies/proxies.service';

@Injectable()
export class AddProxiesPermission implements PermissionInterface {
  identifier = 'add_proxies';
  level = [Role.SUPERADMIN, Role.ADMIN];
  definitions: Definition[] = [
    {
      identifier: identifier.normal,
      enabled: true,
      total: 10000,
    },
  ];

  pricing = false;

  permissionDescription = 'Add an proxy';
  permissionName = 'Add a proxy';

  constructor(private _proxiesService: ProxiesService) {}
  async check(
    organization: Organization & {
      subscription?: Subscription;
      users: UserOrganization[];
    },
    definition: Definition,
  ): Promise<true | string> {
    const addProxy = await this._proxiesService.canAddProxy(
      organization.id,
      organization?.subscription?.total || 0,
    );

    if (addProxy) {
      return true;
    }

    return `You have reached the maximum number of custom proxies allowed for your plan.
    Please upgrade your plan to add more proxies.`;
  }

  async downgrade(
    organization: Organization & {
      subscription?: Subscription;
      users: UserOrganization[];
    },
    definition: Definition,
  ) {
    const addProxy = await this._proxiesService.totalProxies(organization.id);
    if (addProxy <= definition.total) {
      return true;
    }

    return {
      downgrade: `You have to remove ${addProxy - definition.total} proxies before downgrading your plan.`,
      denied: 'You cannot add more proxies at this time.',
    };
  }
}
