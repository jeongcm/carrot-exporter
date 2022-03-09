import { Request } from 'express';
import { User } from '@/common/interfaces/users.interface';

export interface DataStoredInToken {
  pk: number;
}

export interface TokenData {
  token: string;
  expiresIn: number;
}

export interface RequestWithUser extends Request {
  user: User;
  tenancyPk: String;
}
