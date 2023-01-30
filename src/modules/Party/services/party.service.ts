import DB from '@/database';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
//import NodeMailer from 'nodemailer';
//import Mg from 'nodemailer-mailgun-transport';

import { HttpException } from '@/common/exceptions/HttpException';
import { isEmpty } from '@/common/utils/util';
import { PartyUserModel } from '../models/partyUser.model';
import tableIdService from '@/modules/CommonService/services/tableId.service';
//import HealthService from '@/modules/CommonService/services/health.service';
import { IDataStoredInToken, IParty, IPartyUser, IPartyUserAPILog, IPartyUserResponse, ITokenData } from '@/common/interfaces/party.interface';
import { CreateUserDto, UpdateUserDto, LoginDto } from '@/modules/Party/dtos/party.dto';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';

import config from '@config/index';
import urlJoin from 'url-join';

import { logger } from '@/common/utils/logger';
import { ApiModel } from '@/modules/Api/models/api.models';
import TokenService from '@/modules/Token/token.service';
import { validatePassword } from '@/common/utils/passwordValidation';
import { ICustomerAccount } from '@/common/interfaces/customerAccount.interface';
//import { ICustomerAccount } from '@/common/interfaces/customerAccount.interface';
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
class PartyService {
  public party = DB.Party;
  public partyUser = DB.PartyUser;
  public partyRelation = DB.PartyRelation;
  public resource = DB.Resource;
  public partyResource = DB.PartyResource;
  public partyChannel = DB.PartyChannel;

  public partyUserLogs = DB.PartyUserLogs;
  public partyUserPassword = DB.PartyUserPassword;
  public customerAccount = DB.CustomerAccount;
  public api = DB.Api;

  public tableIdService = new tableIdService();
  public tokenService = new TokenService();
  //public healthSerivce = new HealthService();

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

  public async createUser(createPartyUserData: CreateUserDto, systemId: string, socialProviderId?: string): Promise<IPartyUserResponse> {
    const findCustomerAccount: ICustomerAccount = await this.customerAccount.findOne({
      where: { customerAccountId: createPartyUserData.customerAccountId },
    });
    if (!findCustomerAccount) throw new HttpException(404, `couldn't find existing customer account information`);
    const customerAccountKey = findCustomerAccount.customerAccountKey;

    const validatedPassword = await validatePassword(createPartyUserData.password, createPartyUserData);
    console.log('validatedPassword in creating user', validatedPassword);
    if (typeof validatedPassword !== 'boolean')
      throw new HttpException(
        500,
        `cound't pass password validation logic - don't include first/last name, old password and must include one capitcal letter, number `,
      );

    const tableIdTableName = 'PartyUser';
    const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(tableIdTableName);
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    //const tz = moment.tz.guess();

    try {
      return await DB.sequelize.transaction(async t => {
        let hashedPassword: string;
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
            createdBy: systemId || 'SYSTEM',
            firstName: createPartyUserData.firstName,
            lastName: createPartyUserData.lastName,
            userId: createPartyUserData.userId,
            mobile: createPartyUserData?.mobile,
            password: hashedPassword,
            email: createPartyUserData.email,
            language: createPartyUserData.language || 'EN',
            timezone: tz,
            socialProviderId: socialProviderId,
            isEmailValidated: false,
            systemYn: false,
            adminYn: false,
            partyUserStatus: createPartyUserData.partyUserStatus,
            oldPassword: [hashedPassword],
          },
          { transaction: t },
        );
        return {
          partyId: createdParty.partyId,
          partyName: createdParty.partyName,
          partyDescription: createdParty?.partyDescription,
          parentPartyId: createdParty?.parentPartyId,
          partyType: 'US',
          createdBy: createdPartyUser.createdBy,
          partyUserId: createdPartyUser.partyUserId,
          firstName: createdPartyUser.firstName,
          lastName: createdPartyUser.lastName,
          userId: createdPartyUser.userId,
          mobile: createdPartyUser?.mobile,
          email: createdPartyUser.email,
          language: createdPartyUser.language,
          timezone: createdPartyUser.timezone,
          isEmailValidated: createdPartyUser.isEmailValidated,
          adminYn: createdPartyUser.adminYn,
          systemYn: createdPartyUser.systemYn,
          partyUserStatus: createdPartyUser.partyUserStatus,
          errors: [],
        };
      });
    } catch (error) {
      return error;
      console.log(error);
    }
  }

  public async updateUser(customerAccountKey: number, logginedUserId: string, updateUserId: string, updateUserData: UpdateUserDto): Promise<IParty> {
    const { partyName, partyDescription, parentPartyId, firstName, lastName, mobile, email, timezone, language } = updateUserData;
    try {
      await DB.sequelize.transaction(async t => {
        await this.party.update(
          { partyName, partyDescription, parentPartyId, updatedBy: logginedUserId },
          { where: { customerAccountKey, partyId: updateUserId, partyType: 'US' }, transaction: t },
        );

        await this.partyUser.update(
          { firstName, lastName, mobile, email, timezone, updatedBy: logginedUserId, language },
          { where: { partyUserId: updateUserId }, transaction: t },
        );
      });
      return this.getUser(customerAccountKey, updateUserId);
    } catch (error) {}

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

    if (loginData.password === config.defaultPassword) {
      throw new HttpException(401, `Please Reset your password before login`);
    }

    const tokenData = this.createToken(findUser);
    const cookie = this.createCookie(tokenData);

    await this.partyUser.update({ lastAccessAt: new Date() }, { where: { userId: loginData.userId } });
    //const findCustoemrAccount: ICustomerAccount = await this.customerAccount.findOne({ where: { customerAccountKey, deletedAt: null } });
    //const customerAccountId = findCustoemrAccount.customerAccountId;
    //const scheduleHealthService = await this.healthService.checkHealthByCustomerAccountId(customerAccountId);
    //console.log('operation schedules setup:', scheduleHealthService);

    return { cookie, findUser, token: tokenData.token };
  }

  public async loginInSystem(loginData: LoginDto): Promise<{ cookie: string; findUser: IPartyUser; token: string }> {
    if (isEmpty(loginData)) throw new Error('LoginData must not be empty');

    const findUser: IPartyUser = await this.partyUser.findOne({ where: { userId: loginData.userId } });
    if (!findUser) throw new HttpException(401, `LOGIN_FAILED`);

    const tokenData = this.createToken(findUser);
    const cookie = this.createCookie(tokenData);

    await this.partyUser.update({ lastAccessAt: new Date() }, { where: { userId: loginData.userId } });
    //const findCustoemrAccount: ICustomerAccount = await this.customerAccount.findOne({ where: { customerAccountKey, deletedAt: null } });
    //const customerAccountId = findCustoemrAccount.customerAccountId;
    //const scheduleHealthService = await this.healthService.checkHealthByCustomerAccountId(customerAccountId);
    //console.log('operation schedules setup:', scheduleHealthService);

    return { cookie, findUser, token: tokenData.token };
  }

  public async requestPasswordReset(email: string) {
    //1. check email if exist. Send exception if there is no email account.
    if (isEmpty(email)) throw new HttpException(400, 'No email address provided');
    const findUser: IPartyUser = await this.partyUser.findOne({ where: { email: email } });
    if (!findUser) throw new HttpException(401, `No user information found with the provided email address`);

    //2. create a token
    const tokenData = this.createToken(findUser);
    const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId('Tokens');
    //create token detail in Tokens table
    const obj = {
      partyUserKey: findUser.partyUserKey,
      tokenId: responseTableIdData.tableIdFinalIssued,
      token: tokenData.token,
    };
    const tokenResult = await this.tokenService.createTokenDetail(obj);
    //3. send email with the token to user with the link to reset password
    const emailTemplateSource = fs.readFileSync(path.join(__dirname, '../../Messaging/templates/emails/email-body/forgotPassword.hbs'), 'utf8');
    const template = handlebars.compile(emailTemplateSource);
    const name = findUser.firstName;
    const url = urlJoin(config.email.passwordReset.resetPageURL, `reset/password/?token=${tokenData.token}&email=${findUser.email}`);
    const htmlToSend = template({ url, name });
    const mailOptions = {
      to: findUser.email,
      from: 'service@nexclipper.io',
      subject: 'Password Reset - NexClipper',
      html: htmlToSend,
    };
    await sendMail(findUser, mailOptions);

    const resultEmail = {
      to: findUser.email,
      from: 'service@nexclipper.io',
      subject: 'Password Reset - NexClipper',
    };

    return resultEmail;
  }

  public async resetPassword(
    email: string,
    password: string,
    resetToken?: any,
    oldPassword?: any,
  ): Promise<{ cookie: string; findUser: IPartyUser; token: string }> {
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
    if (isEmpty(email)) throw new HttpException(400, 'No email address provided');
    const findUser: IPartyUser = await this.partyUser.findOne({ where: { email: email } });
    if (!findUser) throw new HttpException(401, `No user information found with the provided email address`);
    //validate password
    const validatedPassword = await validatePassword(password, findUser);

    if (typeof validatedPassword !== 'boolean') {
      throw new HttpException(500, validatedPassword);
    }

    if (oldPassword) {
      const oldHashedPassword = await bcrypt.compare(oldPassword, findUser.password);
      if (!oldHashedPassword) {
        throw new HttpException(500, `Old password entered is wrong .Please check`);
      }
    }
    //1. validate the password rule
    let hashedPassword: string;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
      const oldPassArr = findUser.oldPassword.concat(hashedPassword);
      await this.partyUser.update({ password: hashedPassword, oldPassword: oldPassArr }, { where: { email } });
    }

    //2.send mail of password reset
    const emailTemplateSource = fs.readFileSync(path.join(__dirname, '../../Messaging/templates/emails/email-body/passwordReset.hbs'), 'utf8');
    const template = handlebars.compile(emailTemplateSource);
    const name = findUser.firstName;
    const url = urlJoin(config.email.passwordReset.resetPageURL, 'login');
    const htmlToSend = template({ url, name });
    const mailOptions = {
      to: findUser.email,
      from: 'service@nexclipper.io',
      subject: 'Password Reset - NexClipper',
      html: htmlToSend,
    };
    await sendMail(findUser, mailOptions);
    const loginData = {
      userId: findUser.userId,
      password: password,
    };
    const loggedIn = await this.login(loginData);
    return loggedIn;
  }

  public async resetPasswordByAdmin(userId: string, password: string, adminCode: string): Promise<string> {
    if (adminCode == config.defaultPassword) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await this.partyUser.update({ password: hashedPassword }, { where: { userId: userId } });
      console.log('password updated');
      return 'success';
    } else return 'failed';
  }

  public async deleteParty(partyId: string): Promise<string> {
    const findParty: IParty = await this.party.findOne({ where: { partyId, deletedAt: null } });
    if (!findParty) throw new HttpException(404, 'Cannot find customerAccount');
    const partyKey = findParty.partyKey;
    const partyType = findParty.partyType;

    try {
      await DB.sequelize.transaction(async t => {
        if (partyType === 'US') {
          const findPartyUser: IPartyUser = await this.partyUser.findOne({ where: { partyKey, deletedAt: null } });
          const partyUserKey = findPartyUser.partyUserKey;
          await this.partyUser.update({ deletedAt: new Date(), partyUserStatus: 'CA' }, { where: { partyUserKey }, transaction: t });
          await this.partyUserLogs.update({ deletedAt: new Date() }, { where: { partyUserKey }, transaction: t });
          await this.partyUserPassword.update({ deletedAt: new Date() }, { where: { partyUserKey }, transaction: t });
          await this.partyRelation.update(
            { deletedAt: new Date(), partyRelationTo: new Date() },
            { where: { partyChildKey: partyKey }, transaction: t },
          );
        } else if (partyType === 'AG') {
          await this.partyRelation.update(
            { deletedAt: new Date(), partyRelationTo: new Date() },
            { where: { partyParentKey: partyKey }, transaction: t },
          );
          await this.partyResource.update({ deletedAt: new Date() }, { where: { partyKey }, transaction: t });
          await this.partyChannel.update({ deletedAt: new Date(), partyChannelTo: new Date() }, { where: { partyKey }, transaction: t });
        }
        await this.party.update({ deletedAt: new Date() }, { where: { partyKey }, transaction: t });
      });
    } catch (err) {
      console.log(err);
      throw new HttpException(500, 'Unknown error while deleting party');
    }

    return 'success to delete party';
  }

  public createToken(user: IPartyUser): ITokenData {
    const dataStoredInToken: IDataStoredInToken = { partyUserKey: user.partyUserKey, customerAccountKey: 0 };
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
    console.log('#EMAIL Auth---', auth);
    const smtpTransport = nodeMailer.createTransport(mg(mailgunAuth));
    smtpTransport.sendMail(mailOptions, function (error: {}, response: any) {
      if (error && Object.keys(error).length) {
        console.log(`#EMAIL Error while sending mail`, error);
      } else {
        console.log(`#EMAIL Successfully sent email.`, response);
      }
    });
  } catch (err) {
    return { message: '#EMAIl Error while sending mail', error: err };
  }
};

export default PartyService;
