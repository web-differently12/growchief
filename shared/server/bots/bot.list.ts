import { BotAbstract } from '@growchief/shared-backend/bots/bots.interface';
import { LinkedinProvider } from '@growchief/shared-backend/bots/providers/linkedin/linkedin.provider';
import { XProvider } from '@growchief/shared-backend/bots/providers/x/x.provider';

export const botList: BotAbstract[] = [new LinkedinProvider(), new XProvider()];
