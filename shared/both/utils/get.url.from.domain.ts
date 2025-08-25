import { parse } from 'tldts';

export function getUrlFromDomain(domain: string) {
  const url = parse(domain);
  return url.domain! ? '.' + url.domain : url.hostname!;
}
