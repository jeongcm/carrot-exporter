import { cleanEnv, port, str } from 'envalid';

function validateEnv() {
  cleanEnv(process.env, {
    NODE_ENV: str(),
    NC_NODE_PORT: port(),
  });
}

export default validateEnv;
