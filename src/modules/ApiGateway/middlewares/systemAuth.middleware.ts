import { NextFunction, Request, Response } from 'express';

import DB from '@/database';
import { HttpException } from '@/common/exceptions/HttpException';

import { IParty } from '@/common/interfaces/party.interface';
import config from 'config';

/**
 * Middleware to be used to authenticate a particular request.
 * @param  {} req
 * @param  {Response} res
 * @param  {NextFunction} next
 */
const systemAuthMiddleware = async (req, res: Response, next: NextFunction) => {
  try {
    if (req.systemId) {
      return next();
    }

    const internalAccountParty: IParty = await DB.Party.findOne({ where: { partyName: config.auth.systemVerifyKey } });

    if (internalAccountParty) {
      req.systemId = internalAccountParty.partyId;

      next();
    } else {
      next(new HttpException(404, 'System account does not exist'));
    }
  } catch (error) {
    console.log(error);
    next(new HttpException(401, 'Wrong authentication token'));
  }
};

export default systemAuthMiddleware;
