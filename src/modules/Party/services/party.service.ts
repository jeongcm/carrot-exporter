import { UpdateUserDto } from './../dtos/party.dto';
import { PartyModel } from '@/modules/Party/models/party.model';
import DB from '@/database';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { HttpException } from '@/common/exceptions/HttpException';
import { isEmpty } from '@/common/utils/util';

import { CreateUserDto, LoginDto } from '@/modules/Party/dtos/party.dto';

import { ICustomerAccount } from '@/common/interfaces/customerAccount.interface';

import tableIdService from '@/modules/CommonService/services/tableId.service';
import CustomerAccountService from '@/modules/CustomerAccount/services/customerAccount.service';
import { IDataStoredInToken, IParty, IPartyUser, IPartyUserResponse, ITokenData } from '@/common/interfaces/party.interface';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
import config from 'config';
import { PartyUserModel } from '../models/partyUser.model';

/**
 * @memberof Party
 */
class PartyService {
  public party = DB.Party;
  public partyUser = DB.PartyUser;
  public partyRelation = DB.PartyRelation;
  public tableIdService = new tableIdService();

  public async getUsers(customerAccountKey: number): Promise<IParty[]> {
    const users: any = await this.party.findAll({
      where: { customerAccountKey, partyType: 'US', isDeleted: false },
      attributes: { exclude: ['partyKey', 'isDeleted', 'isDeleted', 'customerAccountKey'] },
      include: [
        {
          model: PartyUserModel,
          attributes: { exclude: ['partyUserKey', 'partyKey', 'isDeleted', 'password'] },
        },
      ],
    });

    return users;
  }

  public async getUser(customerAccountKey: number, partyUserId: string): Promise<IParty> {
    const users: any = await this.party.findOne({
      where: { customerAccountKey, partyId: partyUserId, isDeleted: false },
      attributes: { exclude: ['partyKey', 'isDeleted', 'isDeleted', 'customerAccountKey'] },
      include: [
        {
          model: PartyUserModel,
          attributes: { exclude: ['partyUserKey', 'partyKey', 'isDeleted', 'password'] },
        },
      ],
    });

    return users;
  }

  public async createUser(createPartyUserData: CreateUserDto, customerAccountKey: number): Promise<IPartyUserResponse> {
    const tableIdTableName = 'partyUser';
    const tableId = await this.tableIdService.getTableIdByTableName(tableIdTableName);
    if (!tableId) {
      return;
    }

    const IA_KEY: number = await this.party.min('partyKey');
    const IA: IParty = await this.party.findByPk(IA_KEY, { raw: true });

    try {
      const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(tableIdTableName);

      return await DB.sequelize.transaction(async t => {
        const hashedPassword = await bcrypt.hash(createPartyUserData.password, 10);

        const createdParty: IParty = await this.party.create(
          {
            partyId: responseTableIdData.tableIdFinalIssued,
            partyName: createPartyUserData.partyName,
            partyDescription: createPartyUserData?.partyDescription,
            parentPartyId: createPartyUserData?.parentPartyId,
            partyType: 'US',
            customerAccountKey,
            createdBy: IA ? IA.partyId : 'SYSTEM',
          },
          { transaction: t },
        );

        const createdPartyUser: IPartyUser = await this.partyUser.create(
          {
            partyUserId: responseTableIdData.tableIdFinalIssued,
            partyKey: createdParty.partyKey,
            createdBy: IA ? IA.partyId : 'SYSTEM',
            firstName: createPartyUserData.firstName,
            lastName: createPartyUserData.lastName,
            userId: createPartyUserData.userId,
            mobile: createPartyUserData?.mobile,
            password: hashedPassword,
            email: createPartyUserData.email,
            isEmailValidated: false,
          },
          { transaction: t },
        );

        return {
          partyId: responseTableIdData.tableIdFinalIssued,
          partyName: createPartyUserData.partyName,
          partyDescription: createPartyUserData?.partyDescription,
          parentPartyId: createPartyUserData?.parentPartyId,
          partyType: 'US',
          createdBy: IA ? IA.partyId : 'SYSTEM',
          partyUserId: responseTableIdData.tableIdFinalIssued,
          firstName: createPartyUserData.firstName,
          lastName: createPartyUserData.lastName,
          userId: createPartyUserData.userId,
          mobile: createPartyUserData?.mobile,
          email: createPartyUserData.email,
          isEmailValidated: false,
        };
      });
    } catch (error) {}
  }

  public async updateUser(updateUserData: UpdateUserDto, updateUserId: string, customerAccountKey: number, logginedUser: IParty): Promise<IParty> {
    const { partyName, partyDescription, parentPartyId, firstName, lastName, mobile, email } = updateUserData;

    try {
      await DB.sequelize.transaction(async t => {
        await this.party.update(
          { partyName, partyDescription, parentPartyId, updatedBy: logginedUser.partyId },
          { where: { customerAccountKey, partyId: updateUserId, partyType: 'US' }, transaction: t },
        );

        await this.partyUser.update(
          { firstName, lastName, mobile, email, updatedBy: logginedUser.partyId },
          { where: { partyUserId: updateUserId }, transaction: t },
        );
      });
    } catch (error) {}

    return await this.getUser(customerAccountKey, updateUserId);
  }

  public async login(loginData: LoginDto): Promise<{ cookie: string; findUser: IPartyUser; token: string }> {
    if (isEmpty(loginData)) throw new Error('LoginData must not be empty');

    const findUser: IPartyUser = await this.partyUser.findOne({ where: { userId: loginData.userId } });
    if (!findUser) throw new HttpException(409, `You're userId ${loginData.userId} not found`);

    const isPasswordMatching: boolean = await bcrypt.compare(loginData.password, findUser.password);

    if (!isPasswordMatching) throw new HttpException(409, "You're password not matching");

    const tokenData = this.createToken(findUser);
    const cookie = this.createCookie(tokenData);

    await this.partyUser.update({ lastAccessAt: new Date() }, { where: { userId: loginData.userId } });

    return { cookie, findUser, token: tokenData.token };
  }

  public createToken(user: IPartyUser): ITokenData {
    const dataStoredInToken: IDataStoredInToken = { partyUserKey: user.partyUserKey };
    const secretKey: string = config.auth.jwtSecretKey;
    const expiresIn: number = 60 * 60;

    return { expiresIn, token: jwt.sign(dataStoredInToken, secretKey, { expiresIn }) };
  }

  public createCookie(tokenData: ITokenData): string {
    return `X-AUTHORIZATION=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn};`;
  }
}

export default PartyService;
