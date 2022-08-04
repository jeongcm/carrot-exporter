import DB from '@/database';

import { Op } from 'sequelize';

import { PartyModel } from '@/modules/Party/models/party.model';
import { PartyUserModel } from '../models/partyUser.model';

import tableIdService from '@/modules/CommonService/services/tableId.service';

import { IParty, IPartyRelation, IPartyResource, IPartyResponse } from '@/common/interfaces/party.interface';

import { CreateAccessGroupDto, AddUserAccessGroupDto, AddResourceToAccessGroupDto } from '@/modules/Party/dtos/party.dto';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';

import { ResourceModel } from '@/modules/Resources/models/resource.model';

/**
 * @memberof Party
 */
class AccessGroupService {
  public party = DB.Party;
  public partyUser = DB.PartyUser;
  public partyRelation = DB.PartyRelation;
  public resource = DB.Resource;
  public partyResource = DB.PartyResource;
  public partyUserLogs = DB.PartyUserLogs;
  private resourceGroup = DB.ResourceGroup;
  public api = DB.Api;

  public tableIdService = new tableIdService();

  public async createAccessGroup(customerAccountKey: number, logginedUserId: string, createData: CreateAccessGroupDto): Promise<IPartyResponse> {
    const { partyName, partyDescription, parentPartyId } = createData;

    const tableIdTableName = 'Party';

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

      return await this.getAccessGroup(customerAccountKey, updatePartyId);
    } catch (error) {}
  }

  public async addUserToAccessGroup(
    customerAccountKey: number,
    logginedUserId: string,
    partyParentId: string,
    addingPartyChildData: AddUserAccessGroupDto,
  ): Promise<any> {
    try {
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

        const insertDataList = [];

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
    } catch (error) {
      return error;
    }
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
  ): Promise<[number]> {
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

    return await this.partyRelation.update(
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
  ): Promise<IPartyResource[] | string> {
    const party: IParty = await this.party.findOne({
      where: { partyId },
      attributes: ['partyKey'],
    });

    const resourceAll = await this.resource.findAll({
      where: {
        resourceId: { [Op.in]: addingResourceData.resourceIds },
      },
      include: [
        {
          model: this.resourceGroup,
          attributes: ['resourceGroupUuid'],
        },
      ],
      attributes: ['resourceKey', 'resourceType', 'resourceNamespace', 'resourceName'],
    });

    const resourceKeyList = resourceAll.map(resource => resource.resourceKey);

    const existPartyResource = await this.partyResource.findAll({
      where: {
        partyKey: party.partyKey,
        resourceKey: { [Op.in]: resourceKeyList },
        deletedAt: null,
      },

      raw: true,
    });

    if (existPartyResource.length > 0) {
      return 'Contains resources that are already added to the accessGorup.';
    }

    const insertDataList = [];

    for (const resource of resourceAll) {
      const { resourceKey } = resource;
      const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId('PartyResource');

      insertDataList.push({
        partyResourceId: responseTableIdData.tableIdFinalIssued,
        partyKey: party.partyKey,
        resourceKey,
        createdBy: logginedUserId,
      });
    }

    return await this.partyResource.bulkCreate(insertDataList, { returning: true });
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

    const resourceOfAccessGroup = [];

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
  ): Promise<number> {
    const party: IParty = await this.party.findOne({
      where: { partyId },
      attributes: ['partyKey'],
    });

    const resourceAll = await this.resource.findAll({
      where: { resourceId: { [Op.in]: removingResourceData.resourceIds } },
      attributes: ['resourceKey'],
    });

    const resourceKeyList = resourceAll.map(resource => resource.resourceKey);

    const updated: number = await this.partyResource.destroy({
      where: {
        partyKey: party.partyKey,
        resourceKey: { [Op.in]: resourceKeyList },
        deletedAt: null,
      },
    });

    return updated;
  }
}

export default AccessGroupService;
