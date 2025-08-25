import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library/build/src/auth/oauth2client';
import { ProvidersInterface } from '@growchief/backend/services/auth/providers.interface';
import { makeId } from '@growchief/shared-both/utils/make.id';

const clientAndYoutube = (website: string) => {
  const client = new google.auth.OAuth2({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: `${website}/auth/continue?provider=GOOGLE&website=${website}`,
  });
  const oauth2 = (newClient: OAuth2Client) =>
    google.oauth2({
      version: 'v2',
      auth: newClient,
    });

  return { client, oauth2 };
};

export class GoogleProvider implements ProvidersInterface {
  generateLink(website: string) {
    const state = makeId(7);
    const { client } = clientAndYoutube(website);
    return client.generateAuthUrl({
      access_type: 'online',
      prompt: 'consent',
      state,
      redirect_uri: `${website}/auth/continue?provider=GOOGLE&website=${website}`,
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
    });
  }

  async getToken(code: string, website: string) {
    const { client } = clientAndYoutube(website);
    const { tokens } = await client.getToken(code);
    return tokens.access_token as string;
  }

  async getUser(providerToken: string, website: string) {
    const { client, oauth2 } = clientAndYoutube(website);
    client.setCredentials({ access_token: providerToken });
    const user = oauth2(client);
    const { data } = await user.userinfo.get();

    return {
      id: data.id!,
      email: data.email!,
    };
  }
}
