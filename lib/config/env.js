import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  DATABASE_URL: z.string().min(1).optional(),
  GOOGLE_SHEETS_SPREADSHEET_ID: z.string().min(1).optional(),
  GOOGLE_SERVICE_ACCOUNT_EMAIL: z.string().email().optional(),
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: z.string().min(1).optional(),
  JOYBUNDLE_VALIDATE_ENV: z.enum(['true', 'false']).default('false'),
  CATALOG_DATA_SOURCE: z.enum(['fixture', 'google-sheets']).optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  JOYBUNDLE_VERSION: z.string().min(1).default('0.1.0'),
});

export function validateServerEnv({ requireProduction = false } = {}) {
  const result = schema.safeParse(process.env);
  if (!result.success) throw new Error(`Invalid JoyBundle environment configuration: ${result.error.issues.map((issue) => issue.path.join('.') + ' ' + issue.message).join('; ')}`);
  const env = result.data;
  if (requireProduction) {
    const missing = ['GOOGLE_SHEETS_SPREADSHEET_ID', 'GOOGLE_SERVICE_ACCOUNT_EMAIL', 'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY'].filter((key) => !env[key]);
    if (missing.length) throw new Error(`Missing required JoyBundle production configuration: ${missing.join(', ')}. Secret values are intentionally not displayed.`);
  }
  return env;
}
