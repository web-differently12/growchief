import Stripe from 'stripe';
import {
  BillingInterface,
  Plans,
} from '@growchief/shared-both/billing/billing.interface';
import { billingPlans } from '@growchief/shared-both/billing/billing.plans';
import { capitalize } from 'lodash';
import { RawBodyRequest } from '@nestjs/common';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_', {
  apiVersion: '2025-07-30.basil',
});

export class StripeProvider implements BillingInterface {
  identifier = 'stripe';
  trialLength = 7;
  planList = billingPlans;

  async getCustomer(id?: string, email?: string): Promise<string> {
    const customers = !id ? { id: '' } : await stripe.customers.retrieve(id);

    if (customers.id) {
      return customers.id;
    }

    return (await stripe.customers.create(email ? { email } : {})).id;
  }

  async getSubscription(customerId: string): Promise<string> {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
    });

    if (subscriptions.data.length > 0) {
      return subscriptions.data[0].id;
    }

    return '';
  }

  async getPlan(plan: Plans, interval: 'year' | 'month'): Promise<string> {
    const allProducts = await stripe.products.list({
      active: true,
      expand: ['data.prices'],
    });

    const findProduct =
      allProducts.data.find((product) => product.name === plan.name) ||
      (await stripe.products.create({
        active: true,
        name: plan.name,
        metadata: {
          identifier: plan.identifier,
        },
      }));

    const pricesList = await stripe.prices.list({
      active: true,
      product: findProduct.id,
    });

    const findPrice =
      pricesList.data.find(
        (p) =>
          p?.recurring?.interval?.toLowerCase() === interval &&
          p?.unit_amount === plan[interval].price * 100,
      ) ||
      (await stripe.prices.create({
        active: true,
        product: findProduct.id,
        metadata: {
          interval,
          identifier: plan.identifier,
        },
        currency: 'usd',
        nickname: plan.name + ' ' + capitalize(interval),
        unit_amount: plan[interval].price * 100,
        recurring: {
          interval: interval,
        },
      }));

    return findPrice.id;
  }

  async checkoutPage(
    customerId: string,
    plan: Plans,
    interval: 'month' | 'year',
    trial: boolean,
    quantity: number = 1,
  ): Promise<string> {
    const customerSubscription = await this.getSubscription(customerId);
    if (customerSubscription) {
      return '';
    }

    const getPlan = await this.getPlan(plan, interval);

    const { url } = await stripe.checkout.sessions.create({
      customer: customerId,
      cancel_url: process.env['FRONTEND_URL'] + `/billing?cancel=true`,
      success_url: process.env['FRONTEND_URL'] + `/workflows?onboarding=true`,
      mode: 'subscription',
      subscription_data: {
        ...(trial ? { trial_period_days: this.trialLength } : {}),
      },
      allow_promotion_codes: true,
      line_items: [
        {
          price: getPlan,
          quantity: quantity,
        },
      ],
    });

    return url as string;
  }

  async changeSubscription(
    customerId: string,
    type: 'cancel' | 'enable',
  ): Promise<Date | null> {
    const subscription = await this.getSubscription(customerId);
    const { cancel_at } = await stripe.subscriptions.update(subscription, {
      cancel_at_period_end: type === 'cancel',
    });

    if (type == 'enable') {
      return null;
    }

    return new Date(cancel_at! * 1000);
  }

  async updateSubscriptionPlan(
    customerId: string,
    plan: Plans,
    interval: 'month' | 'year',
    quantity: number = 1,
  ): Promise<string> {
    const subscription = await this.getSubscription(customerId);
    const getPlan = await this.getPlan(plan, interval);
    const items = await stripe.subscriptionItems.list({
      subscription,
    });

    await stripe.subscriptions.update(subscription, {
      proration_behavior: 'always_invoice',
      cancel_at_period_end: false,
      items: [
        {
          id: items.data[0].id,
          price: getPlan,
          quantity: quantity,
        },
      ],
    });

    return subscription;
  }

  async checkBilling(customerId: string): Promise<string> {
    return (
      await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: process.env['FRONTEND_URL'] + '/modify-billing',
      })
    ).url;
  }

  async processWebhook(req: RawBodyRequest<Request>): Promise<{
    customer: string;
    plan: Plans;
    interval: 'year' | 'month';
    total: number;
    type: 'create' | 'update' | 'delete';
    isTrial: boolean;
  }> {
    // @ts-ignore
    const event = stripe.webhooks.constructEvent(
      // @ts-ignore
      req.rawBody,
      // @ts-ignore
      req.headers['stripe-signature'],
      process.env.STRIPE_SIGNING_KEY,
    );

    const prices = await stripe.prices.list({});

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const price = event.data.object.items.data[0].price.id;
        const findPrice = prices.data.find((p) => p.id === price);
        const plan = this.planList.find(
          (p) => p.identifier === findPrice?.metadata?.identifier!,
        );
        const interval = findPrice?.metadata?.interval!;
        return {
          customer: event.data.object.customer as string,
          plan: plan!,
          isTrial: event.data.object.status === 'trialing',
          interval: interval as 'year' | 'month',
          total: event.data.object.items.data[0].quantity || 1,
          type:
            event.type === 'customer.subscription.created'
              ? 'create'
              : event.type === 'customer.subscription.updated'
                ? 'update'
                : 'delete',
        };
    }

    return {
      customer: '',
      plan: this.planList[0],
      isTrial: true,
      interval: 'month',
      total: 1,
      type: 'create',
    };
  }
}
