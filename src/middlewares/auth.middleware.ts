import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import DB from '@databases';
import { HttpException } from '@exceptions/HttpException';
import { DataStoredInToken } from '@interfaces/auth.interface';
import config from 'config';

/**
 * Middleware to be used to authenticate a particular request.
 * @param  {} req
 * @param  {Response} res
 * @param  {NextFunction} next
 */
const authMiddleware = async (req, res: Response, next: NextFunction) => {
  try {
    if (req.isAuthenticated()) {
      return next();
    }
    const Authorization =
      req.cookies['X-AUTHORIZATION'] || (req.header('x-authorization') && req.header('x-authorization').split('Bearer ')[1]) || null;
    if (Authorization) {
      const secretKey: string = config.auth.jwtSecretKey;
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
      next(new HttpException(401, 'Authentication token missing'));
    }
  } catch (error) {
    console.log(error)
    next(new HttpException(401, 'Wrong authentication token'));
  }
};

export default authMiddleware;
