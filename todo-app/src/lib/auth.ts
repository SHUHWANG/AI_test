import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/db';
import * as schema from '@/db/schema';

const LOCALHOST_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
];

const parseCsv = (value?: string): string[] => {
  if (!value) return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const pickFirstHeader = (value: string | null): string | undefined => {
  if (!value) return undefined;
  return value.split(',')[0]?.trim() || undefined;
};

const getRequestOrigin = (request?: Request): string | undefined => {
  if (!request) return undefined;

  const forwardedHost = pickFirstHeader(request.headers.get('x-forwarded-host'));
  const host = forwardedHost || pickFirstHeader(request.headers.get('host'));

  let protocol = pickFirstHeader(request.headers.get('x-forwarded-proto'));
  if (!protocol) {
    try {
      protocol = new URL(request.url).protocol.replace(':', '');
    } catch {
      protocol = undefined;
    }
  }

  if (host && protocol) return `${protocol}://${host}`;

  try {
    return new URL(request.url).origin;
  } catch {
    return undefined;
  }
};

const getSameHostOriginHeader = (
  request?: Request,
  currentOrigin?: string,
): string | undefined => {
  if (!request || !currentOrigin) return undefined;
  const originHeader = request.headers.get('origin');
  if (!originHeader) return undefined;

  try {
    if (new URL(originHeader).host === new URL(currentOrigin).host) {
      return originHeader;
    }
  } catch {
    return undefined;
  }

  return undefined;
};

const envTrustedOrigins = parseCsv(process.env.TRUSTED_ORIGINS);

const trustedOrigins = async (request?: Request): Promise<string[]> => {
  const currentOrigin = getRequestOrigin(request);
  const sameHostOrigin = getSameHostOriginHeader(request, currentOrigin);

  return Array.from(
    new Set(
      [
        ...(process.env.NODE_ENV !== 'production' ? LOCALHOST_ORIGINS : []),
        ...envTrustedOrigins,
        currentOrigin,
        sameHostOrigin,
      ].filter(Boolean) as string[],
    ),
  );
};

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  secret: process.env.BETTER_AUTH_SECRET!,
  // In production, derive auth URL from each request host so preview domains work automatically.
  baseURL: process.env.NODE_ENV !== 'production' ? process.env.BETTER_AUTH_URL : undefined,
  trustedOrigins,
});
