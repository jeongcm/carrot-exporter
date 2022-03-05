import { cleanEnv, email, host, num, port, str } from 'envalid';
/**
 * @method  validate a particular env.
 */
function validateEnv() {
  cleanEnv(process.env, {
    NC_NODE_PORT: port(),
    NC_NODE_ENV: str(),
    NC_NODE_DB_CONFIG_HOST: host(),
    NC_NODE_DB_CONFIG_USER: str(),
    NC_NODE_DB_CONFIG_PASSWORD: str(),
    NC_NODE_DB_CONFIG_DB_NAME: str(),
    NC_NODE_DB_CONFIG_POOL_MIN: num(),
    NC_NODE_DB_CONFIG_POOL_MAX: num(),
    NC_NODE_EMAIL_DEFAULT_FROM: email(),
    NC_NODE_MAILGUN_API_KEY: str(),
    NC_NODE_MAILGUN_DOMAIN: host(),
    NC_NODE_SOCIALKEY_GOOGLE_CLIENT_ID: str(),
    NC_NODE_SOCIALKEY_GOOGLE_CLIENT_SECRET: str(),
    NC_NODE_SOCIALKEY_GOOGLE_CALLBACK_URL: host(),
    NC_NODE_SOCIALKEY_GITHUB_CLIENT_ID: str(),
    NC_NODE_SOCIALKEY_GITHUB_CLIENT_SECRET: str(),
    NC_NODE_SOCIALKEY_GITHUB_CALLBACK_URL: host(),
    NC_NODE_JWT_SECRET_KEY: str(),
    NC_NODE_LOG_FORMAT: str(),
    NC_NODE_CORS_ORIGIN: str(),
    NC_NODE_CORS_CREDENTIALS: str(),
    NC_NODE_EMAIL_PASSWORD_RESET_PAGE_URL: host(),
  });
}

export default validateEnv;
