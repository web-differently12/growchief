import { Controller, HttpCode, Post, Req } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { BillingProvider } from '@growchief/shared-backend/billing/billing.provider';

@Controller('/webhook')
export class WebhookController {
  constructor(private readonly _billingProvider: BillingProvider) {}

  @HttpCode(200)
  @Post('/billing')
  async process(@Req() req: RawBodyRequest<Request>) {
    try {
      return await this._billingProvider.processWebhook(req);
    } catch (e) {}
  }
}
