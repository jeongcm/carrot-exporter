import { NextFunction, Response } from 'express';
import config from 'config';
import jwt from 'jsonwebtoken';
import DB from '@databases';
import { HttpException } from '@exceptions/HttpException';
import { DataStoredInToken, RequestWithUser } from '@interfaces/auth.interface';

const authMiddleware = async (req, res: Response, next: NextFunction) => {
  try {
    console.log("req,", req.isAuthenticated(), req.isAuthorized())
    if (req.isAuthenticated()) {
       next();
    }
    const Authorization = req.cookies['X-AUTHORIZATION'] || req.header('x-authorization').split('Bearer ')[1] || null;
    if (Authorization) {
      const secretKey: string = config.get('secretKey');
      const verificationResponse = jwt.verify(Authorization, secretKey) as DataStoredInToken;
      const userId = verificationResponse.id;
      const findUser = await DB.Users.findByPk(userId);

      if (findUser) {
        req.user = findUser;
        req.tenancyId = (req.headers.tenancyid as string) || findUser.currentTenancy;

        next();
      } else {
        next(new HttpException(401, 'Wrong authentication token'));
      }
    } else {
      next(new HttpException(404, 'Authentication token missing'));
    }
  } catch (error) {
    next(new HttpException(401, 'Wrong authentication token'));
  }
};

export default authMiddleware;
