import { cleanEnv, email, host, num, port, str } from 'envalid';
/**
 * @method  validate a particular env.
 */
function validateEnv() {
  if (process.env.NC_LARI_ENV === 'production') {
    cleanEnv(process.env, {
      NC_LARI_PORT: port(),
      NC_LARI_ENV: str(),
      NC_LARI_DB_CONFIG_HOST: str(),
      NC_LARI_DB_CONFIG_PORT: num(),
      NC_LARI_DB_CONFIG_USER: str(),
      NC_LARI_DB_CONFIG_PASSWORD: str(),
      NC_LARI_DB_CONFIG_DB_NAME: str(),
      NC_LARI_DB_CONFIG_POOL_MIN: num(),
      NC_LARI_DB_CONFIG_POOL_MAX: num(),
      NC_LARI_EMAIL_DEFAULT_FROM: email(),
      NC_LARI_MAILGUN_API_KEY: str(),
      NC_LARI_MAILGUN_DOMAIN: host(),
      NC_LARI_SOCIALKEY_GOOGLE_CLIENT_ID: str(),
      NC_LARI_SOCIALKEY_GOOGLE_CLIENT_SECRET: str(),
      NC_LARI_SOCIALKEY_GOOGLE_CALLBACK_URL: str(),
      NC_LARI_SOCIALKEY_GITHUB_CLIENT_ID: str(),
      NC_LARI_SOCIALKEY_GITHUB_CLIENT_SECRET: str(),
      NC_LARI_SOCIALKEY_GITHUB_CALLBACK_URL: str(),
      NC_LARI_JWT_SECRET_KEY: str(),
      NC_LARI_LOG_FORMAT: str(),
      NC_LARI_CORS_ORIGIN: str(),
      NC_LARI_CORS_CREDENTIALS: str(),
      NC_LARI_EMAIL_PASSWORD_RESET_PAGE_URL: str(),
    });
  } else {
    cleanEnv(process.env, {
      NC_LARI_PORT: port(),
      NC_LARI_ENV: str(),
      NC_LARI_DB_CONFIG_HOST: str(),
      NC_LARI_DB_CONFIG_USER: str(),
      NC_LARI_DB_CONFIG_PASSWORD: str(),
      NC_LARI_DB_CONFIG_DB_NAME: str(),
      NC_LARI_DB_CONFIG_POOL_MIN: num(),
      NC_LARI_DB_CONFIG_POOL_MAX: num(),
      NC_LARI_EMAIL_DEFAULT_FROM: email(),
      NC_LARI_JWT_SECRET_KEY: str(),
      NC_LARI_LOG_FORMAT: str(),
      NC_LARI_CORS_ORIGIN: str(),
      NC_LARI_CORS_CREDENTIALS: str(),
      NC_LARI_EMAIL_PASSWORD_RESET_PAGE_URL: str(),
    });
  }
}

export default validateEnv;
