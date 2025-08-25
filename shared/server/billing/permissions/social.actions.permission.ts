import { Organization, Role } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import {
  Definition,
  PermissionInterface,
} from '@growchief/shared-backend/billing/permission.interface';
import { identifier } from '@growchief/shared-both/billing/billing.plans';

@Injectable()
export class SocialActionsPermission implements PermissionInterface {
  identifier = 'social_actions';
  level = [Role.USER, Role.SUPERADMIN, Role.ADMIN];
  definitions: Definition[] = [
    {
      identifier: identifier.normal,
      enabled: true,
      total: 10000,
    },
  ];

  pricing = true;

  permissionDescription = 'Social media actions';
  permissionName = 'Social media actions';

  async check(
    organization: Organization,
    definition: Definition,
  ): Promise<true | string> {
    return true;
  }

  async downgrade() {
    return true as const;
  }
}
