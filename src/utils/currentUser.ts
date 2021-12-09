import jwt, { JwtPayload } from 'jsonwebtoken';
import config from 'config';
import { CurrentUser } from '@/interfaces/users.interface';

export const currentUser = (req): CurrentUser => {
  let currentCookie = req.cookies['X-AUTHORIZATION'];
  if (currentCookie) {
    const secretKey: string = config.get('secretKey');
    const payload = jwt.verify(currentCookie, secretKey) as JwtPayload;
    const currentUser: CurrentUser = {
      id: payload?.id,
      iat: payload?.iat,
      exp: payload?.exp,
    };
    return currentUser;
  }
};
