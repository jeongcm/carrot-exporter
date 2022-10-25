import DB from '@/database';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
//import NodeMailer from 'nodemailer';
//import Mg from 'nodemailer-mailgun-transport';

import { HttpException } from '@/common/exceptions/HttpException';
import { isEmpty } from '@/common/utils/util';
import { PartyUserModel } from '../models/partyUser.model';
import tableIdService from '@/modules/CommonService/services/tableId.service';
import { IDataStoredInToken, IParty, IPartyUser, IPartyUserAPILog, IPartyUserResponse, ITokenData } from '@/common/interfaces/party.interface';
import { CreateUserDto, UpdateUserDto, LoginApiDto } from '@/modules/Party/dtos/party.dto';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';

import config from '@config/index';
import urlJoin from 'url-join';

import { logger } from '@/common/utils/logger';
import { ApiModel } from '@/modules/Api/models/api.models';
import TokenService from '@/modules/Token/token.service';
import { ICustomerAccount } from '@/common/interfaces/customerAccount.interface';
//import { ICustomerAccount } from '@/common/interfaces/customerAccount.interface';
//import moment from 'moment-timezone';

const nodeMailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

/**
 * @memberof Party
 */
class ExternalPartyService {
  public party = DB.Party;
  public partyUser = DB.PartyUser;
  public partyRelation = DB.PartyRelation;
  public resource = DB.Resource;
  public partyResource = DB.PartyResource;
  public partyUserLogs = DB.PartyUserLogs;
  public customerAccount = DB.CustomerAccount;
  public api = DB.Api;

  public tableIdService = new tableIdService();
  public tokenService = new TokenService();

  public async apiLogin(loginData: LoginApiDto): Promise<{ cookie: string; findCustomerAccount: ICustomerAccount; token: string }> {
    if (isEmpty(loginData)) throw new Error('LoginData must not be empty');

    const apiKeyBuff = Buffer.from(loginData.apiKey);
    const encodedApiKey = apiKeyBuff.toString('base64');

    const findCustomerAccount: ICustomerAccount = await this.customerAccount.findOne({ where: { customerAccountApiKey: encodedApiKey } });
    if (!findCustomerAccount) throw new HttpException(401, `APIKEY AUTHENTICATION FAIL`);

    const tokenData = this.createApiToken(findCustomerAccount);
    const cookie = this.createApiCookie(tokenData);

    //await this.partyUser.update({ lastAccessAt: new Date() }, { where: { userId: loginData.userId } });

    return { cookie, findCustomerAccount, token: tokenData.token };
  }

  public createApiToken(customerAccount: ICustomerAccount): ITokenData {
    const dataStoredInToken: IDataStoredInToken = { customerAccountKey: customerAccount.customerAccountKey, partyUserKey: 0 };
    const secretKey: string = config.auth.jwtSecretKey;
    const expiresIn: number = config.auth.authTokenApiExpirySecond; // 60 * 60 * 24;

    return { expiresIn, token: jwt.sign(dataStoredInToken, secretKey, { expiresIn }) };
  }

  public createApiCookie(tokenData: ITokenData): string {
    return `X-AUTHORIZATION=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn};`;
  }
}

export default ExternalPartyService;
