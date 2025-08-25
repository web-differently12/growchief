import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UseGuards,
} from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';
import { PermissionInterface } from '@growchief/shared-backend/billing/permission.interface';
import { Organization, Subscription, UserOrganization } from '@prisma/client';
import { PermissionException } from '@growchief/shared-backend/billing/permission.exception';
import { PermissionList } from '@growchief/shared-backend/billing/permissions.list';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    if (request?.user?.isSuperAdmin || !process.env.BILLING_PROVIDER) {
      return true;
    }

    const organization: Organization & {
      subscription: Subscription;
      users: UserOrganization[];
    } = request?.org;

    const subscription: Subscription = organization?.subscription;
    return !!subscription;
  }
}

export const SubscriptionRequired = () => UseGuards(SubscriptionGuard);

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private _moduleRef: ModuleRef,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    if (request?.user?.isSuperAdmin || !process.env.BILLING_PROVIDER) {
      return true;
    }

    const permissions =
      this.reflector.get<Array<{ new (): PermissionInterface }> | undefined>(
        'permissions',
        context.getHandler(),
      ) ||
      this.reflector.get<Array<{ new (): PermissionInterface }> | undefined>(
        'permissions',
        context.getClass(),
      );

    if (!permissions || !permissions?.length) {
      return true;
    }

    const organization: Organization & {
      subscription: Subscription;
      users: UserOrganization[];
    } = request?.org;

    if (permissions?.length) {
      for (const provider of permissions) {
        const load = this._moduleRef.get<PermissionInterface>(provider, {
          strict: false,
        });
        const value = await load.check(organization, request);
        if (value !== true) {
          throw new PermissionException(value);
        }
      }
    }

    return true;
  }
}
