export interface ProvidersInterface {
  generateLink(website: string, query?: any): Promise<string> | string;
  getToken(code: string, website: string): Promise<string>;
  getUser(
    providerToken: string,
    website: string,
  ): Promise<{ email: string; id: string }> | false;
}
