import DB from '@/database';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';

import { HttpException } from '@/common/exceptions/HttpException';
import { isEmpty } from '@/common/utils/util';

import { PartyModel } from '@/modules/Party/models/party.model';
import { PartyUserModel } from '../models/partyUser.model';

import tableIdService from '@/modules/CommonService/services/tableId.service';

import {
  IDataStoredInToken,
  IParty,
  IPartyRelation,
  IPartyResource,
  IPartyResponse,
  IPartyUser,
  IPartyUserResponse,
  ITokenData,
} from '@/common/interfaces/party.interface';

import {
  CreateUserDto,
  UpdateUserDto,
  CreateAccessGroupDto,
  AddUserAccessGroupDto,
  LoginDto,
  AddResourceToAccessGroupDto,
} from '@/modules/Party/dtos/party.dto';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';

import config from 'config';
import { ResourceModel } from '@/modules/Resources/models/resource.model';
import { PartyResourceModel } from '../models/partyResource.model';

/**
 * @memberof Party
 */
class PartyService {
  public party = DB.Party;
  public partyUser = DB.PartyUser;
  public partyRelation = DB.PartyRelation;
  public resource = DB.Resource;
  public partyResource = DB.PartyResource;

  public tableIdService = new tableIdService();

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

  public async createUser(createPartyUserData: CreateUserDto, customerAccountKey: number, systemId: string): Promise<IPartyUserResponse> {
    const tableIdTableName = 'PartyUser';
    
    //const tableId = await this.tableIdService.getTableIdByTableName(tableIdTableName);
    //if (!tableId) {
    //  return;
    //}

    try {
      const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(tableIdTableName);

      return await DB.sequelize.transaction(async t => {
        let hashedPassword;
        if(createPartyUserData && createPartyUserData.password){
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
            createdBy: systemId,
          },
          { transaction: t },
        );

        const createdPartyUser: IPartyUser = await this.partyUser.create(
          {
            partyUserId: responseTableIdData.tableIdFinalIssued,
            partyKey: createdParty.partyKey,
            createdBy: systemId,
            firstName: createPartyUserData.firstName,
            lastName: createPartyUserData.lastName,
            userId: createPartyUserData.userId,
            mobile: createPartyUserData?.mobile,
            password: hashedPassword,
            email: createPartyUserData.email,
            isEmailValidated: false,
            partyUserStatus:createPartyUserData.partyUserStatus
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
          partyUserStatus:createPartyUserData.partyUserStatus
        };
      });
    } catch (error) {
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
    } catch (error) {}

    return await this.getUser(customerAccountKey, updateUserId);
  }

  public async createAccessGroup(customerAccountKey: number, logginedUserId: string, createData: CreateAccessGroupDto): Promise<IPartyResponse> {
    const { partyName, partyDescription, parentPartyId } = createData;

    const tableIdTableName = 'Party';
    const tableId = await this.tableIdService.getTableIdByTableName(tableIdTableName);
    if (!tableId) {
      return;
    }

    try {
      const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(tableIdTableName);

      const createdAccessGroup: IParty = await this.party.create({
        partyId: responseTableIdData.tableIdFinalIssued,
        partyName,
        partyDescription,
        parentPartyId,
        partyType: 'AG',
        customerAccountKey,
        createdBy: logginedUserId,
      });

      const responseData: IPartyResponse = {
        partyId: createdAccessGroup.partyId,
        partyName: createdAccessGroup.partyName,
        partyDescription: createdAccessGroup.partyDescription,
        partyType: createdAccessGroup.partyType,
        createdBy: createdAccessGroup.createdBy,
        updatedBy: createdAccessGroup?.updatedBy,
        createdAt: createdAccessGroup.createdAt,
        updatedAt: createdAccessGroup?.updatedAt,
        parentPartyId: createdAccessGroup?.parentPartyId,
      };

      return responseData;
    } catch (error) {}
  }

  public async getAccessGroups(customerAccountKey: number): Promise<IParty[]> {
    const accessGroups: IParty[] = await this.party.findAll({
      where: { customerAccountKey, partyType: 'AG', deletedAt: null },
      attributes: { exclude: ['partyKey', 'deletedAt', 'customerAccountKey'] },
    });

    return accessGroups;
  }

  public async getAccessGroup(customerAccountKey: number, partyId: string): Promise<IParty> {
    const accessGroup: IParty = await this.party.findOne({
      where: { customerAccountKey, partyId, deletedAt: null },
      attributes: { exclude: ['partyKey', 'deletedAt', 'customerAccountKey'] },
    });

    return accessGroup;
  }

  public async updateAccessGroup(
    customerAccountKey: number,
    logginedUserId: string,
    updatePartyId: string,
    updateData: CreateAccessGroupDto,
  ): Promise<IParty> {
    try {
      await this.party.update(
        {
          partyName: updateData?.partyName,
          partyDescription: updateData?.partyDescription,
          parentPartyId: updateData?.parentPartyId,
          updatedBy: logginedUserId,
        },
        { where: { customerAccountKey, partyId: updatePartyId, partyType: 'AG' } },
      );
    } catch (error) {}

    return await this.getAccessGroup(customerAccountKey, updatePartyId);
  }

  public async addUserToAccessGroup(
    customerAccountKey: number,
    logginedUserId: string,
    partyParentId: string,
    addingPartyChildData: AddUserAccessGroupDto,
  ): Promise<any> {
    return await DB.sequelize.transaction(async t => {
      const partyParent: IParty = await this.party.findOne({ where: { customerAccountKey, partyId: partyParentId }, transaction: t });

      if (!partyParent) {
        return [];
      }

      const partyParentKey = partyParent.partyKey;

      const partyChildAll = await this.party.findAll({
        where: { partyId: { [Op.in]: addingPartyChildData.partyIds } },
        attributes: ['partyKey'],
        transaction: t,
      });

      const partyChildKeys = partyChildAll.map(party => party.partyKey);

      let insertDataList = [];

      for (const partyChildKey of partyChildKeys) {
        const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId('partyRelation');
        const currentTime = new Date();

        insertDataList.push({
          partyRelationId: responseTableIdData.tableIdFinalIssued,
          partyParentKey,
          partyChildKey,
          createdBy: logginedUserId,
          partyRelationType: 'AU',
          partyRelationFrom: currentTime,
          partyRelationTo: currentTime,
        });
      }

      return await this.partyRelation.bulkCreate(insertDataList, { returning: true });
    });
  }

  public async getUserOfAccessGroup(partyParentId: string): Promise<IPartyRelation[]> {
    const partyParent: IParty = await this.party.findOne({
      where: { partyId: partyParentId },
      attributes: ['partyKey'],
    });

    const partyRelations = await this.partyRelation.findAll({
      where: { partyParentKey: partyParent.partyKey, deletedAt: null },
      attributes: { exclude: ['partyRelationKey', 'deletedAt', 'partyParentKey', 'partyChildKey'] },
      include: {
        model: PartyModel,
        attributes: ['partyId', 'partyName', 'partyDescription', 'partyType'],
        as: 'partyChild',
        include: [
          {
            model: PartyUserModel,
            attributes: ['partyUserId', 'firstName', 'lastName', 'userId', 'mobile', 'email', 'lastAccessAt'],
          },
        ],
      },
    });

    return partyRelations;
  }

  public async removeUserFromAccessGroup(
    customerAccountKey: number,
    logginedUserId: string,
    partyParentId: string,
    removingPartyChildData: AddUserAccessGroupDto,
  ): Promise<void> {
    const partyParent: IParty = await this.party.findOne({
      where: { partyId: partyParentId },
      attributes: ['partyKey'],
    });

    const partyParentKey = partyParent.partyKey;

    const partyChildAll = await this.party.findAll({
      where: { partyId: { [Op.in]: removingPartyChildData.partyIds } },
      attributes: ['partyKey'],
    });

    const partyChildKeyList = partyChildAll.map(party => party.partyKey);

    await this.partyRelation.update(
      { deletedAt: new Date() },
      {
        where: {
          partyParentKey,
          partyChildKey: { [Op.in]: partyChildKeyList },
        },
      },
    );
  }

  public async addResourceToAccessGroup(
    customerAccountKey: number,
    logginedUserId: string,
    partyId: string,
    addingResourceData: AddResourceToAccessGroupDto,
  ): Promise<IPartyResource[]> {
    const party: IParty = await this.party.findOne({
      where: { partyId },
      attributes: ['partyKey'],
    });

    const resourceAll = await this.resource.findAll({
      where: { resourceId: { [Op.in]: addingResourceData.resourceIds } },
      attributes: ['resourceKey'],
    });

    const resourceKeyList = resourceAll.map(resource => resource.resourceKey);

    let insertDataList = [];

    for (let resourceKey of resourceKeyList) {
      const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId('PartyResource');

      insertDataList.push({
        partyResourceId: responseTableIdData.tableIdFinalIssued,
        partyKey: party.partyKey,
        resourceKey,
        createdBy: logginedUserId,
      });
    }

    // for (let i = 0; i < resourceKeyList.length; i++) {
    //   const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId('PartyResource');

    //   insertDataList.push({
    //     partyResourceId: responseTableIdData.tableIdFinalIssued,
    //     partyKey: party.partyKey,
    //     resourceKey: resourceKeyList[i],
    //     createdBy: logginedUserId,
    //   });
    // }

    return await this.partyResource.bulkCreate(insertDataList, { ignoreDuplicates: true });
  }

  public async getResourceOfAccessGroup(customerAccountKey: number, partyId: string): Promise<any> {
    const party: IParty = await this.party.findOne({
      where: { partyId },
      attributes: ['partyKey'],
    });

    const partyResource = await this.partyResource.findAll({
      where: { partyKey: party.partyKey, deletedAt: null },
      include: {
        model: ResourceModel,
        attributes: { exclude: ['resourceKey', 'customerAccountKey', 'resourceGroupKey'] },
      },
    });

    let resourceOfAccessGroup = [];

    partyResource.map(resource => {
      //@ts-expect-error
      resourceOfAccessGroup.push(resource.Resource);
    });

    return resourceOfAccessGroup;
  }

  public async removeResourceFromAccessGroup(
    customerAccountKey: number,
    logginedUserId: string,
    partyId: string,
    removingResourceData: AddResourceToAccessGroupDto,
  ): Promise<[number, PartyResourceModel[]]> {
    const party: IParty = await this.party.findOne({
      where: { partyId },
      attributes: ['partyKey'],
    });

    const resourceAll = await this.resource.findAll({
      where: { resourceId: { [Op.in]: removingResourceData.resourceIds } },
      attributes: ['resourceKey'],
    });

    const resourceKeyList = resourceAll.map(resource => resource.resourceKey);

    const updated: [number, PartyResourceModel[]] = await this.partyResource.update(
      { deletedAt: new Date() },
      {
        where: {
          partyKey: party.partyKey,
          resourceKey: { [Op.in]: resourceKeyList },
        },
      },
    );

    return updated;
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
