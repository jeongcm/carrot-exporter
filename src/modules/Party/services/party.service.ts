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
import { CreateUserDto, UpdateUserDto, LoginDto } from '@/modules/Party/dtos/party.dto';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';

import config from '@config/index';
import urlJoin from 'url-join';

import { logger } from '@/common/utils/logger';
import { ApiModel } from '@/modules/Api/models/api.models';
import TokenService from '@/modules/Token/token.service';
import { ICustomerAccount } from '@/common/interfaces/customerAccount.interface';


const nodeMailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

/**
 * @memberof Party
 */
class PartyService {
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



  public async findPartyByEmail(email: string): Promise<IPartyUser> {
    if (isEmpty(email)) throw new HttpException(400, "User doen't exist");
    const findParty: IPartyUser = await this.partyUser.findOne({ where: { email } });
    return findParty;
  }

  public async getUsers(customerAccountKey: number): Promise<IParty[]> {
    const users: any = await this.party.findAll({
      where: { customerAccountKey, partyType: 'US', deletedAt: null },
      attributes: { exclude: ['partyKey', 'deletedAt', 'customerAccountKey'] },
      include: [
        {
          model: PartyUserModel,
          attributes: { exclude: ['partyUserKey', 'partyKey', 'deletedAt', 'password'] },
        },
      ],
    });

    return users;
  }

  public async getUser(customerAccountKey: number, partyUserId: string): Promise<IParty> {
    const users: IParty = await this.party.findOne({
      where: { customerAccountKey, partyId: partyUserId, deletedAt: null },
      attributes: { exclude: ['partyKey', 'deletedAt', 'customerAccountKey'] },
      include: [
        {
          model: PartyUserModel,
          attributes: { exclude: ['partyUserKey', 'partyKey', 'deletedAt', 'password'] },
        },
      ],
    });

    return users;
  }

  public async getUserKey(customerAccountKey: number, partyUserId: string): Promise<IParty> {
    const user: IParty = await this.party.findOne({
      where: { customerAccountKey, partyId: partyUserId, deletedAt: null },
      attributes: ['partyKey'],
    });

    return user;
  }

  public async getPartyKeyById(partyId: string): Promise<number> {
    const party: IParty = await this.party.findOne({
      where: { partyId },
      attributes: ['partyKey'],
    });

    return party.partyKey;
  }

  public async createUser(createPartyUserData: CreateUserDto, customerAccountKey: number, systemId: string, socialProviderId?: string): Promise<IPartyUserResponse> {
    const tableIdTableName = 'PartyUser';

    //const tableId = await this.tableIdService.getTableIdByTableName(tableIdTableName);
    //if (!tableId) {
    //  return;
    //}
    const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(tableIdTableName);

    try {
      return await DB.sequelize.transaction(async t => {
        let hashedPassword;
        if (createPartyUserData && createPartyUserData.password) {
          hashedPassword = await bcrypt.hash(createPartyUserData.password, 10);
        }

        const createdParty: IParty = await this.party.create(
          {
            partyId: responseTableIdData.tableIdFinalIssued,
            partyName: createPartyUserData.partyName,
            partyDescription: createPartyUserData?.partyDescription,
            parentPartyId: createPartyUserData?.parentPartyId,
            partyType: 'US',
            customerAccountKey,
            createdBy: systemId || 'SYSTEM',
          },
          { transaction: t },
        );
        const createdPartyUser: IPartyUser = await this.partyUser.create(
          {
            partyUserId: responseTableIdData.tableIdFinalIssued,
            partyKey: createdParty.partyKey,
            createdBy: systemId || "SYSTEM",
            firstName: createPartyUserData.firstName,
            lastName: createPartyUserData.lastName,
            userId: createPartyUserData.userId,
            mobile: createPartyUserData?.mobile,
            password: hashedPassword,
            email: createPartyUserData.email,
            socialProviderId: socialProviderId,
            isEmailValidated: false,
            partyUserStatus: createPartyUserData.partyUserStatus,
          },
          { transaction: t },
        );
        return {
          partyId: responseTableIdData.tableIdFinalIssued,
          partyName: createPartyUserData.partyName,
          partyDescription: createPartyUserData?.partyDescription,
          parentPartyId: createPartyUserData?.parentPartyId,
          partyType: 'US',
          createdBy: systemId,
          partyUserId: responseTableIdData.tableIdFinalIssued,
          firstName: createPartyUserData.firstName,
          lastName: createPartyUserData.lastName,
          userId: createPartyUserData.userId,
          mobile: createPartyUserData?.mobile,
          email: createPartyUserData.email,
          isEmailValidated: false,
          partyUserStatus: createPartyUserData.partyUserStatus,
        };
      });
    } catch (error) {
      console.log(error);
    }
  }

  public async updateUser(customerAccountKey: number, logginedUserId: string, updateUserId: string, updateUserData: UpdateUserDto): Promise<IParty> {
    const { partyName, partyDescription, parentPartyId, firstName, lastName, mobile, email } = updateUserData;
    try {
      await DB.sequelize.transaction(async t => {
        await this.party.update(
          { partyName, partyDescription, parentPartyId, updatedBy: logginedUserId },
          { where: { customerAccountKey, partyId: updateUserId, partyType: 'US' }, transaction: t },
        );

        await this.partyUser.update(
          { firstName, lastName, mobile, email, updatedBy: logginedUserId },
          { where: { partyUserId: updateUserId }, transaction: t },
        );
      });
      return this.getUser(customerAccountKey, updateUserId)
    } catch (error) { }

    return await this.getUser(customerAccountKey, updateUserId);
  }

  public async getEmailFromPartyUser(invitedByPartyKey: number): Promise<string> {
    try {
      const findUser: IPartyUser = await this.partyUser.findOne({ where: { partyKey: invitedByPartyKey } });
      return findUser.email;
    } catch (error) {
      logger.error(error);
      return '';
    }
  }

  public async getUserAPILog(partyId: string): Promise<IPartyUserAPILog[]> {
    const partyUser: IPartyUser = await this.partyUser.findOne({
      where: { partyUserId: partyId },
      attributes: ['partyUserKey'],
    });

    const partyUserAPILog: any = await this.partyUserLogs.findAll({
      where: { partyUserKey: partyUser.partyUserKey },
      attributes: { exclude: ['partyUserLogsKey', 'partyUserKey', 'apiKey'] },
      include: {
        model: ApiModel,
        attributes: { exclude: ['apiKey'] },
      },
    });

    return partyUserAPILog;
  }

  public async login(loginData: LoginDto): Promise<{ cookie: string; findUser: IPartyUser; token: string }> {
    if (isEmpty(loginData)) throw new Error('LoginData must not be empty');

    const findUser: IPartyUser = await this.partyUser.findOne({ where: { userId: loginData.userId } });
    if (!findUser) throw new HttpException(401, `LOGIN_FAILED`);

    const isPasswordMatching: boolean = await bcrypt.compare(loginData.password, findUser.password);

    if (!isPasswordMatching) throw new HttpException(401, `LOGIN_FAILED`);

    const tokenData = this.createToken(findUser);
    const cookie = this.createCookie(tokenData);

    // await this.partyUser.update({ lastAccessAt: new Date() }, { where: { userId: loginData.userId } });

    return { cookie, findUser, token: tokenData.token };
  }

  public async requestPasswordReset(email: string) {

    //1. check email if exist. Send exception if there is no email account. 
    if (isEmpty(email)) throw new HttpException(400, "No email address provided");
    const findUser: IPartyUser = await this.partyUser.findOne({ where: { email: email } });
    if (!findUser) throw new HttpException(401, `No user information found with the provided email address`);

    //2. create a token
    const tokenData = this.createToken(findUser);
    const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId('Tokens');
    //create token detail in Tokens table
    const obj = {
      partyUserKey: findUser.partyUserKey,
      tokenId: responseTableIdData.tableIdFinalIssued,
      token: tokenData.token
    };
    const tokenResult = await this.tokenService.createTokenDetail(obj)
    //3. send email with the token to user with the link to reset password
    const emailTemplateSource = fs.readFileSync(path.join(__dirname, '../../Messaging/templates/emails/email-body/forgotPassword.hbs'), 'utf8');
    const template = handlebars.compile(emailTemplateSource);
    let name = findUser.firstName
    const url = urlJoin(config.email.passwordReset.resetPageURL, `reset/password/?token=${tokenData.token}&email=${findUser.email}`);
    const htmlToSend = template({ url, name });
    const mailOptions = {
      to: findUser.email,
      from: "service@nexclipper.io",
      subject: 'Password Reset - NexClipper',
      html: htmlToSend
    }
    const a = await sendMail(findUser, mailOptions)
    const resultEmail = {
      to: findUser.email,
      from: "service@nexclipper.io",
      subject: 'Password Reset - NexClipper'
    };

    return resultEmail;
  }

  public async resetPassword(email: string, password: string, resetToken?: any, oldPassword?: any): Promise<{ cookie: string; findUser: IPartyUser; token: string }> {

    if (resetToken) {
      //check for token 
      const token = await this.tokenService.findTokenDetail(resetToken);
      if (!token) {
        throw new HttpException(401, `Invalid token`);
      }
      if (token.expiryTime - Date.now() < 0) {
        throw new HttpException(400, 'Token has been expired, Please try resetting again');
      }
    }
    //0. validate email address
    if (isEmpty(email)) throw new HttpException(400, "No email address provided");
    const findUser: IPartyUser = await this.partyUser.findOne({ where: { email: email } });
    if (!findUser) throw new HttpException(401, `No user information found with the provided email address`);
    if (oldPassword) {
      const oldHashedPassword = await bcrypt.compare(oldPassword, findUser.password);
      if (!oldHashedPassword) {
        throw new HttpException(500, `Old password entered is wrong .Please check`);
      };
    }

    //1. validate the password rule
    let hashedPassword;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }
    await this.partyUser.update({ password: hashedPassword }, { where: { email } });

    //2.send mail of password reset
    const emailTemplateSource = fs.readFileSync(path.join(__dirname, '../../Messaging/templates/emails/email-body/passwordReset.hbs'), 'utf8');
    const template = handlebars.compile(emailTemplateSource);
    let name = findUser.firstName
    const url = urlJoin(config.email.passwordReset.resetPageURL, 'login');
    const htmlToSend = template({ url, name });
    const mailOptions = {
      to: findUser.email,
      from: "service@nexclipper.io",
      subject: 'Password Reset - NexClipper',
      html: htmlToSend
    }
    const a = await sendMail(findUser, mailOptions);
    const loginData = {
      "userId": findUser.userId,
      "password": password
    }
    const loggedIn = await this.login(loginData);
    return loggedIn;
  }



  public createToken(user: IPartyUser): ITokenData {
    const dataStoredInToken: IDataStoredInToken = { partyUserKey: user.partyUserKey };
    const secretKey: string = config.auth.jwtSecretKey;
    const expiresIn: number = config.auth.authTokenExpirySecond; // 60 * 60;

    return { expiresIn, token: jwt.sign(dataStoredInToken, secretKey, { expiresIn }) };
  }

  public createCookie(tokenData: ITokenData): string {
    return `X-AUTHORIZATION=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn};`;
  }
}

const sendMail = async (user: any, mailOptions: any) => {
  try {
    const auth = {
      api_key: config.email.mailgun.apiKey,
      domain: config.email.mailgun.domain,
    };
    const mailgunAuth = { auth };
    const smtpTransport = nodeMailer.createTransport(mg(mailgunAuth));
    smtpTransport.sendMail(mailOptions, function (error, response) {
      if (error && Object.keys(error).length) {
        logger.error(`Error while sending mail`, error)
      } else {
        logger.info(`Successfully sent email.`)
      }
    });
  } catch (err) {
    return { message: 'Error while sending mail', error: err };
  }
}

export default PartyService;
