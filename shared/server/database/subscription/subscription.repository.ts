import { Injectable } from '@nestjs/common';
import { PrismaRepository } from '@growchief/shared-backend/database/prisma';
import { Plans } from '@growchief/shared-both/billing/billing.interface';

@Injectable()
export class SubscriptionRepository {
  constructor(
    private _subscription: PrismaRepository<'subscription'>,
    private _organization: PrismaRepository<'organization'>,
  ) {}

  updateCustomerId(orgId: string, customerId: string) {
    return this._organization.model.organization.update({
      where: { id: orgId },
      data: { paymentId: customerId },
    });
  }

  async changeSubscription(
    orgId: string,
    plan: Plans,
    interval: 'year' | 'month',
    isTrial?: boolean,
    total?: number,
  ) {
    if (typeof isTrial !== 'undefined') {
      await this._organization.model.organization.update({
        where: {
          id: orgId,
        },
        data: {
          allowTrial: isTrial,
        },
      });
    }

    return this._subscription.model.subscription.upsert({
      where: {
        organizationId: orgId,
      },
      create: {
        interval,
        identifier: plan.identifier,
        organizationId: orgId,
        total: total || 1,
      },
      update: {
        interval,
        identifier: plan.identifier,
        total: total || 1,
      },
    });
  }

  updateSubscriptionStatus(orgId: string, date?: Date) {
    return this._subscription.model.subscription.update({
      where: {
        organizationId: orgId,
      },
      data: {
        cancel_at: date,
      },
    });
  }

  async deleteSubscription(orgId: string) {
    await this._organization.model.organization.update({
      where: {
        id: orgId,
      },
      data: {
        allowTrial: false,
      },
    });

    return this._subscription.model.subscription.delete({
      where: {
        organizationId: orgId,
      },
    });
  }
}
