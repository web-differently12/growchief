import { Provider } from '@prisma/client';
import { GoogleProvider } from '@growchief/backend/services/auth/providers/google.provider';
import type { ProvidersInterface } from '@growchief/backend/services/auth/providers.interface';

export class ProvidersFactory {
  static loadProvider(provider: Provider): ProvidersInterface {
    switch (provider) {
      default:
      case Provider.GOOGLE:
        return new GoogleProvider();
    }
  }
}
