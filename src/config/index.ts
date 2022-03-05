/*
How to add config:
1. define a config here using the right nested object
2. add the environment variable in .env.sample file
3. define the type of the environment variable in validateEnv, IF the variable is required
*/

// RYAN: we still need to use config to control all the environment variables
// 1. For organization using nested objects
// 2. For value control (default, computed)
// 3. For security
import validateEnv from './validateEnv';

validateEnv();

export default {
  appPort: process.env.NC_LARI_PORT || 5000,
  nodeEnv: process.env.NC_LARI_ENV || 'development',
  logFormat: process.env.NC_LARI_LOG_FORMAT,
  cors: {
    allowAnyOrigin: process.env.NC_LARI_CORS_ORIGIN === 'true' ? Boolean(process.env.NC_LARI_CORS_ORIGIN) : process.env.NC_LARI_CORS_ORIGIN,
    credentials: process.env.NC_LARI_CORS_CREDENTIALS === 'true',
  },
  email: {
    defaultFrom: process.env.NC_LARI_EMAIL_DEFAULT_FROM || 'info@nexclipper.io',
    verification: {
      verityPageURL: process.env.NC_LARI_EMAIL_VERIFICATION_PAGE_URL,
    },
    invitation: {
      from: process.env.NC_LARI_EMAIL_DEFAULT_FROM || 'info@nexclipper.io',
    },
    passwordReset: {
      resetPageURL: process.env.NC_LARI_EMAIL_PASSWORD_RESET_PAGE_URL,
    },
    mailgun: {
      apiKey: process.env.NC_LARI_MAILGUN_API_KEY,
      domain: process.env.NC_LARI_MAILGUN_DOMAIN,
    },
  },
  db: {
    mariadb: {
      host: process.env.NC_LARI_DB_CONFIG_HOST,
      user: process.env.NC_LARI_DB_CONFIG_USER,
      password: process.env.NC_LARI_DB_CONFIG_PASSWORD,
      dbName: process.env.NC_LARI_DB_CONFIG_DB_NAME,
      poolMin: Number(process.env.NC_LARI_DB_CONFIG_POOL_MIN),
      poolMax: Number(process.env.NC_LARI_DB_CONFIG_POOL_MAX),
    },
  },
  auth: {
    jwtSecretKey: process.env.NC_LARI_JWT_SECRET_KEY,
  },
  socialKey: {
    github: {
      clientID: process.env.NC_LARI_SOCIALKEY_GITHUB_CLIENT_ID,
      clientSecret: process.env.NC_LARI_SOCIALKEY_GITHUB_CLIENT_SECRET,
      callbackUrl: process.env.NC_LARI_SOCIALKEY_GITHUB_CALLBACK_URL,
    },
    google: {
      clientID: process.env.NC_LARI_SOCIALKEY_GOOGLE_CLIENT_ID,
      clientSecret: process.env.NC_LARI_SOCIALKEY_GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.NC_LARI_SOCIALKEY_GOOGLE_CALLBACK_URL,
    },
  },
};
