import { Injectable, OnModuleInit, RawBodyRequest } from '@nestjs/common';
import { providerList } from '@growchief/shared-backend/billing/provider.list';
import { SubscriptionService } from '@growchief/shared-backend/database/subscription/subscription.service';
import { Organization, User } from '@prisma/client';
import { billingPlans } from '@growchief/shared-both/billing/billing.plans';
import { OrganizationService } from '@growchief/shared-backend/database/organizations/organization.service';
import {
  BillingInterface,
  Plans,
} from '@growchief/shared-both/billing/billing.interface';
import { v4 } from 'uuid';
import { TemporalService } from 'nestjs-temporal-core';

@Injectable()
export class BillingProvider implements OnModuleInit {
  private _provider: BillingInterface;
  constructor(
    private _subscriptionService: SubscriptionService,
    private _organizationService: OrganizationService,
    private _temporalService: TemporalService,
  ) {}

  onModuleInit(): any {
    this._provider = providerList.find(
      (provider) => provider.identifier === process.env.BILLING_PROVIDER,
    )!;
  }

  async checkoutPage(
    user: User,
    organization: Organization,
    identifier: string,
    interval: 'year' | 'month',
    quantity: number = 1,
  ) {
    const customer = await this._provider.getCustomer(
      organization.paymentId!,
      user.email,
    );

    if (!organization.paymentId) {
      await this._subscriptionService.updateCustomerId(
        organization.id,
        customer,
      );
    }

    const plans = this.packages().find((p) => p.identifier === identifier);
    return this._provider.checkoutPage(
      customer,
      plans!,
      interval,
      organization.allowTrial,
      quantity,
    );
  }

  async updateSubscription(
    org: Organization,
    identifier: string,
    interval: 'year' | 'month',
    quantity: number = 1,
  ) {
    const customer = await this._provider.getCustomer(org.paymentId!);
    const plans = this.packages().find((p) => p.identifier === identifier);
    const sub = await this._provider.updateSubscriptionPlan(
      customer,
      plans!,
      interval,
      quantity,
    );
    await this._subscriptionService.changeSubscription(
      org.id,
      plans!,
      interval,
      false,
      quantity,
    );
    return sub;
  }

  async changeSubscription(org: Organization, type: 'cancel' | 'enable') {
    const customer = await this._provider.getCustomer(org.paymentId!);
    const date = await this._provider.changeSubscription(customer, type);
    return this._subscriptionService.updateSubscriptionStatus(org.id, date);
  }

  async billingPortal(org: Organization) {
    const customer = await this._provider.getCustomer(org.paymentId!);
    return this._provider.checkBilling(customer);
  }

  async processWebhook(req: RawBodyRequest<Request>) {
    const res = await this._provider.processWebhook(req);
    if (!res) {
      return '';
    }

    const getOrganizationByCustomer =
      await this._organizationService.getOrganizationByPaymentId(res.customer);

    switch (res.type) {
      case 'update':
      case 'create':
        return this._subscriptionService.changeSubscription(
          getOrganizationByCustomer?.id!,
          res.plan,
          res.interval,
          res.isTrial,
          res.total || 1,
        );
      case 'delete':
        await this._temporalService.signalWorkflow(
          'subscription-deactivate',
          'cancelSubscription',
          [{ organizationId: getOrganizationByCustomer?.id! }],
        );
        return true;
      default:
        return true;
    }
  }

  packages(): Plans[] {
    return billingPlans.map((p) => ({ ...p }));
  }
}
