const crypto = require('crypto');

export default (len?: number): string => {
  if (!len) {
    len = 48;
  }
  return crypto.randomBytes(len).toString('base64').slice(0, len);
};
