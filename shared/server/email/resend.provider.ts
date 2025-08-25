import { Resend } from 'resend';
import { EmailInterface } from '@growchief/shared-backend/email/email.interface';

const resend = new Resend(process.env.RESEND_API_KEY || 're_132');

export class ResendProvider implements EmailInterface {
  name = 'resend';
  validateEnvKeys = ['RESEND_API_KEY'];
  async sendEmail(
    to: string,
    subject: string,
    html: string,
    emailFromName: string,
    emailFromAddress: string,
    replyTo?: string,
    buffer?: Buffer,
  ) {
    const sends = await resend.emails.send({
      ...(buffer && {
        attachments: [
          {
            content: buffer,
            filename: 'recording.zip',
            contentType: 'application/zip',
          },
        ],
      }),
      from: `${emailFromName} <${emailFromAddress}>`,
      to,
      subject,
      html,
      ...(replyTo && { reply_to: replyTo }),
    });

    return sends;
  }
}
