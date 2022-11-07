import dotenv from 'dotenv';
import path from 'path';

// Please change this type acccording to your own branch
// for eg. mig_develope brach can be "mig"
// so it will load mig.env
const APP_DEV_TYPE = '.mig';

const envPath = path.resolve(__dirname, '..', `.env${APP_DEV_TYPE || ''}`);

dotenv.config({
  path: path.resolve(envPath),
});
