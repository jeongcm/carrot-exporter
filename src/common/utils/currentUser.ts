import jwt, { JwtPayload } from 'jsonwebtoken';
import { CurrentUser } from '@/common/interfaces/users.interface';
import config from '@/config';
/**
 * @param  {} req
 * @returns payload
 */
export const currentUser = (req): CurrentUser => {
  const currentCookie = req.cookies['X-AUTHORIZATION'];
  if (currentCookie) {
    const secretKey: string = config.auth.jwtSecretKey;
    const payload = jwt.verify(currentCookie, secretKey) as JwtPayload;
    const currentUser: CurrentUser = {
      id: payload?.id,
      iat: payload?.iat,
      exp: payload?.exp,
    };
    return currentUser;
  }
};
