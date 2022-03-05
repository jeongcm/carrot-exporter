import { cleanEnv, port, str } from 'envalid';
/**
 * @method  validate a particular env.
 */
function validateEnv() {
  cleanEnv(process.env, {
    NODE_ENV: str(),
    NC_NODE_PORT: port(),
  });
}

export default validateEnv;
