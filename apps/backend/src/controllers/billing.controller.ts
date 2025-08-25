import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import type {
  Organization,
  User,
  Subscription,
  UserOrganization,
} from '@prisma/client';
import { BillingProvider } from '@growchief/shared-backend/billing/billing.provider';
import { ModuleRef } from '@nestjs/core';
import { permissionsList } from '@growchief/shared-backend/billing/permissions.list';
// import { IsSuperAdminPermission } from '@growchief/shared-backend/billing/permission-body/admin/is.super.admin.permission';
import { SubscriptionService } from '@growchief/shared-backend/database/subscription/subscription.service';
import { GetOrganizationFromRequest } from '../services/auth/org.from.request';
import { GetUserFromRequest } from '@growchief/backend/services/auth/user.from.request';
import { PackageDto } from '@growchief/shared-both/dto/billing/package.dto';
import { PackageCancelDto } from '@growchief/shared-both/dto/billing/package.cancel.dto';

@Controller('/billing')
export class BillingController {
  constructor(
    private _billingProvider: BillingProvider,
    private _subscriptionService: SubscriptionService,
    private _moduleRef: ModuleRef,
  ) {}
  // @PermissionBody(IsSuperAdminPermission)
  @Post('/assign-package')
  assignPermission(
    @GetOrganizationFromRequest() organization: Organization,
    @Body('plan') plan: string,
    @Body('total') total: number = 1,
  ) {
    const loadPlan = this._billingProvider
      .packages()
      .find((p) => p.identifier === plan)!;
    return this._subscriptionService.changeSubscription(
      organization.id,
      loadPlan,
      'month',
      false,
      total,
    );
  }

  @Post('/checkout')
  async checkoutPage(
    @GetUserFromRequest() user: User,
    @GetOrganizationFromRequest()
    organization: Organization & { subscription: Subscription },
    @Body() body: PackageDto,
  ) {
    if (organization.subscription) {
      return '';
    }
    return {
      url: await this._billingProvider.checkoutPage(
        user,
        organization,
        body.plan,
        body.interval,
        body.total,
      ),
    };
  }
  @Get('/portal')
  async portal(
    @GetOrganizationFromRequest()
    organization: Organization & { subscription: Subscription },
  ) {
    if (!organization.subscription) {
      return '';
    }

    return { url: await this._billingProvider.billingPortal(organization) };
  }

  @Post('/subscription')
  async updateSubscription(
    @GetOrganizationFromRequest()
    organization: Organization & {
      subscription?: Subscription;
      users: UserOrganization[];
    },
    @Body() body: PackageDto,
  ) {
    const permissions = permissionsList.map((p) =>
      this._moduleRef.get(p, { strict: false }),
    );

    const errors: any[] = [];
    for (const permission of permissions) {
      const check = await permission.downgrade(
        organization,
        permission.definitions
          .map((p) => ({ ...p, total: body.total }))
          .find((p) => p.identifier === body.plan)!,
      );
      if (typeof check === 'object') {
        errors.push(check.downgrade);
      }
    }

    if (errors.length) {
      return {
        errors,
      };
    }

    return {
      subscription: await this._billingProvider.updateSubscription(
        organization,
        body.plan,
        body.interval,
        body.total,
      ),
    };
  }

  @Put('/subscription/cancel')
  cancelSubscription(
    @GetOrganizationFromRequest() organization: Organization,
    @Body() body: PackageCancelDto,
  ) {
    return this._billingProvider.changeSubscription(organization, body.type);
  }

  @Get('/pricing')
  getPricing() {
    const allModules = permissionsList
      .map((p) => this._moduleRef.get(p, { strict: false }))
      .filter((p) => p.pricing);

    return this._billingProvider.packages().map((p) => ({
      ...p,
      features: allModules
        .flatMap((f) =>
          f.definitions.map((p) => ({
            ...p,
            name: f.permissionName,
            description: f.permissionDescription,
          })),
        )
        .filter((f) => f.enabled && f.identifier === p.identifier)
        .map(({ identifier, enabled, ...all }) => ({
          ...all,
          total: all.total > 500 ? 'Unlimited' : all.total,
        })),
    }));
  }
}
