import { StripeProvider } from '@growchief/shared-backend/billing/providers/stripe.provider';
import { BillingInterface } from '@growchief/shared-both/billing/billing.interface';

export const providerList = [new StripeProvider()] as BillingInterface[];
