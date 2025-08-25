import { identifier } from '@growchief/shared-both/billing/billing.plans';
import { SetMetadata } from '@nestjs/common';
import {
  Organization,
  Role,
  Subscription,
  UserOrganization,
} from '@prisma/client';

export interface Definition {
  identifier: identifier;
  enabled: boolean;
  total: number;
}
export interface PermissionInterface {
  pricing: boolean;
  identifier: string;
  level: Role[];
  permissionName: string;
  permissionDescription: string;
  definitions: Definition[];
  check(
    organization: Organization & {
      subscription?: Subscription;
      users: UserOrganization[];
    },
    definition: Definition,
  ): Promise<true | string>;

  downgrade(
    organization: Organization & {
      subscription?: Subscription;
      users: UserOrganization[];
    },
    definition: Definition,
  ): Promise<true | { downgrade: string; denied: string }>;
}

export type PermissionClass = { new (...args: any[]): PermissionInterface };

export const Permission = (...permissions: PermissionClass[]) => {
  return SetMetadata('permissions', permissions);
};
