import jwt, { JwtPayload } from 'jsonwebtoken';
import { CurrentUser } from '@/interfaces/users.interface';
/**
 * @param  {} req
 * @returns payload
 */
export const currentUser = (req): CurrentUser => {
  const currentCookie = req.cookies['X-AUTHORIZATION'];
  if (currentCookie) {
    const secretKey: string = process.env.NC_NODE_SECRET_KEY;
    const payload = jwt.verify(currentCookie, secretKey) as JwtPayload;
    const currentUser: CurrentUser = {
      id: payload?.id,
      iat: payload?.iat,
      exp: payload?.exp,
    };
    return currentUser;
  }
};
