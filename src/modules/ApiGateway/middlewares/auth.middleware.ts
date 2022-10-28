import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import DB from '@/database';
import { HttpException } from '@/common/exceptions/HttpException';

import config from '@config/index';
import { IDataStoredInToken, IRequestWithUser } from '@/common/interfaces/party.interface';
import { PartyUserModel } from '@/modules/Party/models/partyUser.model';

/**
 * Middleware to be used to authenticate a particular request.
 * @param  {} req
 * @param  {Response} res
 * @param  {NextFunction} next
 */

const noAuthList = [
  'POST/login',
  'GET/logout',
  'POST/party/user',
  'POST/customerAccount',
  'GET/customerAccount',
  'GET/customerAccount/:customerAccountId',
];

const checkNoAuth = (method: string, path: string): boolean => {
  // if (url.startsWith('/customerAccount/CA') && url.split('/customerAccount/CA')[1].length === 14 && method === 'GET') {
  //   return true;
  // }

  const request = method.concat(path);

  if (noAuthList.includes(request)) {
    return true;
  } else {
    return false;
  }
};

const authMiddleware = async (req, res: Response, next: NextFunction) => {
  if (checkNoAuth(req.method, req.route.path)) {
    return next();
  }

  try {
    if (req.isAuthenticated && req.isAuthenticated()) {
      return next();
    }

    const Authorization =
      req.cookies['X-AUTHORIZATION'] || (req.header('x-authorization') && req.header('x-authorization').split('Bearer ')[1]) || null;
    if (Authorization) {
      const secretKey: string = config.auth.jwtSecretKey;
      const verificationResponse = jwt.verify(Authorization, secretKey) as IDataStoredInToken;

      let searchKey;
      if (verificationResponse.customerAccountKey === 0) {
        searchKey = verificationResponse.partyUserKey;
        const findPartyUser = await DB.PartyUser.findByPk(searchKey);
        if (findPartyUser) {
          const findPartyIncludePartyUser = await DB.Party.findOne({
            where: { partyId: findPartyUser.partyUserId, deletedAt: null },
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
          } else next(new HttpException(401, 'Wrong authentication token I'));
        } else next(new HttpException(401, 'Wrong authentication token II'));
      }
      //this is for external party API access
      else {
        searchKey = verificationResponse.customerAccountKey;
        const findCustomerAccount = await DB.CustomerAccount.findOne({
          where: { customerAccountKey: searchKey, deletedAt: null },
        });
        if (findCustomerAccount) {
          const findParty = await DB.Party.findOne({
            where: { customerAccountKey: searchKey, deletedAt: null },
            include: [
              {
                model: PartyUserModel,
                attributes: { exclude: ['password'] },
                where: { systemYn: true },
              },
            ],
          });
          if (findParty) {
            req.user = findParty;
            req.customerAccountKey = searchKey;
            next();
          } else next(new HttpException(401, 'Wrong authentication token III'));
        } else next(new HttpException(401, 'Wrong authentication token IV'));
      }
    }
    else next(new HttpException(401, 'No authentication token'));
  } catch (error) {
    console.log(error);
    next(new HttpException(401, 'Wrong authentication token'));
  }
};

export default authMiddleware;
