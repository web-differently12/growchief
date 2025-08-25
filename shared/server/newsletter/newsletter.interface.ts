export interface NewsletterInterface {
  identifier: string;
  register(email: string): Promise<void>;
}
