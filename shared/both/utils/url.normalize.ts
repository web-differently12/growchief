import type { Options as NormalizeUrlOptions } from 'normalize-url';
import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class URLService implements OnModuleInit {
  normalizeUrl!: (typeof import('normalize-url'))['default'];

  async onModuleInit() {
    // Ensure the dynamic import is loaded when the module initializes
    if (!this.normalizeUrl) {
      this.normalizeUrl = (await import('normalize-url')).default;
    }
  }

  normalizeUrlSafe(
    value: unknown,
    opts: NormalizeUrlOptions = {
      defaultProtocol: 'https',
      forceHttps: true,
      removeTrailingSlash: true,
      removeQueryParameters: true,
      stripTextFragment: true,
    },
  ) {
    if (value == null) return value;
    if (Array.isArray(value))
      return value.map((v) => this.normalizeUrlSafe(v, opts));
    if (typeof value !== 'string') return value;

    const trimmed = value.trim();
    if (!trimmed) return trimmed;
    try {
      return this.normalizeUrl(trimmed, opts);
    } catch {
      // If it's truly not normalizable, just return the original string
      return value;
    }
  }
}
