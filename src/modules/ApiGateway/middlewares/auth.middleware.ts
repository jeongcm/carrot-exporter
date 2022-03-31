import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import DB from '@/database';
import { HttpException } from '@/common/exceptions/HttpException';

import config from 'config';
import { IDataStoredInToken, IRequestWithUser } from '@/common/interfaces/party.interface';
import { PartyUserModel } from '@/modules/Party/models/partyUser.model';

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
      const verificationResponse = jwt.verify(Authorization, secretKey) as IDataStoredInToken;
      const partyUserKey = verificationResponse.partyUserKey;
      const findPartyUser = await DB.PartyUser.findByPk(partyUserKey);

      const findPartyIncludePartyUser = await DB.Party.findOne({
        where: { partyId: findPartyUser.partyUserId },
        include: [
          {
            model: PartyUserModel,
            attributes: { exclude: ['password'] },
          },
        ],
        // raw: true,
      });

      if (findPartyIncludePartyUser) {
        req.user = findPartyIncludePartyUser;
        req.customerAccountKey = (req.headers.customerAccountKey as string) || findPartyIncludePartyUser.customerAccountKey;

        next();
      } else {
        next(new HttpException(401, 'Wrong authentication token'));
      }
    } else {
      next(new HttpException(401, 'Authentication token missing'));
    }
  } catch (error) {
    console.log(error);
    next(new HttpException(401, 'Wrong authentication token'));
  }
};

export default authMiddleware;
