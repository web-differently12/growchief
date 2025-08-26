import {
  EnrichmentInterface,
  EnrichmentReturn,
} from '@growchief/shared-backend/enrichment/enrichment.interface';
import { EnrichmentDto } from '@growchief/shared-both/dto/enrichment/enrichment.dto';

export class RocketReachEnrichment implements EnrichmentInterface {
  name = 'Rocket Reach';
  priority = 1;
  supportedIdentifiers = ['linkedin'];
  // @ts-ignore
  apiKey: !!process.env.ROCKETREACH_API_KEY;

  async enrich(
    platform: string,
    { email }: EnrichmentDto,
  ): Promise<EnrichmentReturn | false> {
    const listQuery = {
      ...(email ? { email } : {}),
    };

    if (Object.keys(listQuery).length === 0) {
      return false;
    }

    const list = new URLSearchParams(listQuery).toString();
    const value = await (
      await fetch(`https://api.rocketreach.co/api/v2/person/lookup?${list}`, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json',
          'x-api-key': process.env.ROCKETREACH_API_KEY!,
        },
      })
    ).json();

    if (!value?.id || !value.linkedin_url || platform !== 'linkedin') {
      return false;
    }

    const [firstName, ...lastName] = value.name || '';

    return {
      firstName: firstName || '',
      lastName: lastName.join(' ') || '',
      url: value.linkedin_url,
      picture: value.profile_pic,
    };
  }
}
