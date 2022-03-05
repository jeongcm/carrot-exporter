// RYAN: we still need to use config to control all the environment variables
// 1. For organization using nested objects
// 2. For value control (default, computed)
// 3. For security
import validateEnv from './validateEnv';

validateEnv();

export default {
  appPort: process.env.NC_NODE_PORT || 5000,
  nodeEnv: process.env.NC_NODE_ENV || 'development',
  logFormat: process.env.NC_NODE_LOG_FORMAT,
  cors: {
    allowAnyOrigin: Boolean(process.env.NC_NODE_CORS_ORIGIN) || false,
    credentials: Boolean(process.env.NC_NODE_CORS_CREDENTIALS),
  },
  email: {
    defaultFrom: process.env.NC_NODE_EMAIL_DEFAULT_FROM || 'info@nexclipper.io',
    invitation: {
      from: process.env.NC_NODE_EMAIL_DEFAULT_FROM || 'info@nexclipper.io',
    },
    passwordReset: {
      resetPageURL: process.env.NC_NODE_EMAIL_PASSWORD_RESET_PAGE_URL,
    },
    mailgun: {
      apiKey: process.env.NC_NODE_MAILGUN_API_KEY,
      domain: process.env.NC_NODE_MAILGUN_DOMAIN,
    },
  },
  db: {
    mariadb: {
      host: process.env.NC_NODE_DB_CONFIG_HOST,
      user: process.env.NC_NODE_DB_CONFIG_USER,
      password: process.env.NC_NODE_DB_CONFIG_PASSWORD,
      dbName: process.env.NC_NODE_DB_CONFIG_DB_NAME,
      poolMin: Number(process.env.NC_NODE_DB_CONFIG_POOL_MIN),
      poolMax: Number(process.env.NC_NODE_DB_CONFIG_POOL_MAX),
    },
  },
  auth: {
    jwtSecretKey: process.env.NC_NODE_JWT_SECRET_KEY,
  },
  socialKey: {
    github: {
      clientID: process.env.NC_NODE_SOCIALKEY_GITHUB_CLIENT_ID,
      clientSecret: process.env.NC_NODE_SOCIALKEY_GITHUB_CLIENT_SECRET,
      callbackUrl: process.env.NC_NODE_SOCIALKEY_GITHUB_CALLBACK_URL,
    },
    google: {
      clientID: process.env.NC_NODE_SOCIALKEY_GOOGLE_CLIENT_ID,
      clientSecret: process.env.NC_NODE_SOCIALKEY_GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.NC_NODE_SOCIALKEY_GOOGLE_CALLBACK_URL,
    },
  },
};
