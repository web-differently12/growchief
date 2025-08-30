import { Injectable } from '@nestjs/common';
import { Activity, ActivityMethod } from 'nestjs-temporal-core';
import type { SendEmailQueue } from '@growchief/orchestrator/workflows/workflow.email';
import { EmailService } from '@growchief/shared-backend/email/email.service';

@Injectable()
@Activity()
export class EmailActivity {
  constructor(private _emailService: EmailService) {}
  @ActivityMethod()
  async sendEmailSync(body: SendEmailQueue) {
    return this._emailService.sendEmailSync(
      body.to,
      body.subject,
      body.html,
      body.replyTo,
      body.buffer,
    );
  }
}
