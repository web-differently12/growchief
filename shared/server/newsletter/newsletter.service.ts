import { Injectable, OnModuleInit } from '@nestjs/common';
import { BeehiivProvider } from '@growchief/shared-backend/newsletter/providers/beehiiv.provider';
import { NewsletterInterface } from '@growchief/shared-backend/newsletter/newsletter.interface';

const providers = [
  new BeehiivProvider(),
] satisfies NewsletterInterface[] as NewsletterInterface[];

@Injectable()
export class NewsletterService implements OnModuleInit {
  private _provider: NewsletterInterface;

  onModuleInit(): any {
    this._provider = providers.find(
      (provider) => provider.identifier === process.env.NEWSLETTER_PROVIDER,
    )!;
  }

  register(email: string): Promise<void> {
    return this._provider.register(email);
  }
}
