import { z } from 'zod';

// Load .env file if it exists
try {
  require('dotenv').config();
} catch {
  // dotenv not available, fall back to process.env
}

const envSchema = z.object({
  DATABASE_URL: z.string().default('postgresql://coxbeach:coxbeach_dev@localhost:5432/coxbeach'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  JWT_SECRET: z.string().min(16).default('dev_jwt_secret_change_in_production_16chars'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  SMS_API_KEY: z.string().default('sandbox'),
  SMS_SENDER_ID: z.string().default('COXBEACH'),
  BKASH_APP_KEY: z.string().default('sandbox'),
  BKASH_APP_SECRET: z.string().default('sandbox'),
  BKASH_USERNAME: z.string().default('sandbox'),
  BKASH_PASSWORD: z.string().default('sandbox'),
  BKASH_BASE_URL: z.string().default('https://tokenized.sandbox.bka.sh/v1.2.0-beta'),
  NAGAD_MERCHANT_ID: z.string().default('sandbox'),
  NAGAD_MERCHANT_PRIVATE_KEY: z.string().default('sandbox'),
  NAGAD_BASE_URL: z.string().default('https://api.mynagad.com'),
  SSLCOMMERZ_STORE_ID: z.string().default('sandbox'),
  SSLCOMMERZ_STORE_PASSWORD: z.string().default('sandbox'),
  SSLCOMMERZ_IS_LIVE: z.coerce.boolean().default(false),
  SMTP_HOST: z.string().default('smtp.mailtrap.io'),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().default(''),
  SMTP_PASS: z.string().default(''),
  EMAIL_FROM: z.string().default('noreply@coxbeach.com.bd'),
  ENCRYPTION_KEY: z.string().default('32charencryptionkeychangeinprod0'),
});

export const env = envSchema.parse(process.env);
