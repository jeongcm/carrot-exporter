import { NextFunction, Response } from 'express';

import AccessGroupService from '@/modules/Party/services/accessgroup.service';

import { IParty, IPartyRelation, IPartyResponse, IRequestWithUser } from '@/common/interfaces/party.interface';
import { UpdateUserDto, CreateAccessGroupDto, AddUserAccessGroupDto, AddResourceToAccessGroupDto } from '@/modules/Party/dtos/party.dto';
import CustomerAccountService from '@/modules/CustomerAccount/services/customerAccount.service';

class AccessGroupController {
  public accessGroupService = new AccessGroupService();
  public customerAccountService = new CustomerAccountService();

  public createAccessGroup = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const customerAccountKey = req.customerAccountKey;
    const logginedUserId = req.user.partyId;

    const createData: CreateAccessGroupDto = req.body;

    try {
      const createdAccessGroup: IPartyResponse = await this.accessGroupService.createAccessGroup(customerAccountKey, logginedUserId, createData);

      res.status(201).json({ data: createdAccessGroup, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public getAccessGroups = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const customerAccountKey = req.customerAccountKey;

    try {
      const accessGroups: IParty[] = await this.accessGroupService.getAccessGroups(customerAccountKey);

      res.status(200).json({ data: accessGroups, message: 'success' });
    } catch (error) {
      next(error);
    }
  };

  public getAccessGroup = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const customerAccountKey = req.customerAccountKey;
    const partyId = req.params.partyId;

    try {
      const accessGroup: IParty = await this.accessGroupService.getAccessGroup(customerAccountKey, partyId);

      if (accessGroup) {
        return res.status(200).json({ data: accessGroup, message: 'success' });
      } else {
        return res.status(404).json({ message: `accessgroup (id: ${partyId})  doesn't exist` });
      }
    } catch (error) {
      next(error);
    }
  };

  public updateAccessGroup = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const customerAccountKey = req.customerAccountKey;
    const logginedUserId = req.user.partyId;

    const updateData: UpdateUserDto = req.body;
    const updatePartyId: string = req.params.partyId;

    const accessgroup: IParty = await this.accessGroupService.getAccessGroup(customerAccountKey, updatePartyId);

    if (!accessgroup) {
      return res.status(404).json({ message: `AccessGroup (id: ${updatePartyId})  doesn't exist` });
    }

    try {
      const updatedAccessgroup: IParty = await this.accessGroupService.updateAccessGroup(
        customerAccountKey,
        logginedUserId,
        updatePartyId,
        updateData,
      );

      if (updatedAccessgroup) {
        res.status(200).json({ data: updatedAccessgroup, message: 'updated' });
      }
    } catch (error) {
      next(error);
    }
  };

  public addUserToAccessGroup = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const customerAccountKey = req.customerAccountKey;
    const logginedUserId = req.user.partyId;

    const partyParentId: string = req.params.partyId;
    const addingPartyChildData: AddUserAccessGroupDto = req.body;

    const accessgroup: IParty = await this.accessGroupService.getAccessGroup(customerAccountKey, partyParentId);

    if (!accessgroup) {
      return res.status(404).json({ message: `AccessGroup (id: ${partyParentId})  doesn't exist` });
    }

    try {
      const addUserToAccessGroup: IParty = await this.accessGroupService.addUserToAccessGroup(
        customerAccountKey,
        logginedUserId,
        partyParentId,
        addingPartyChildData,
      );

      res.status(200).json({ data: addUserToAccessGroup, message: 'success' });
    } catch (error) {
      next(error);
    }
  };

  public getUserOfAccessGroup = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const customerAccountKey = req.customerAccountKey;

    const partyParentId: string = req.params.partyId;

    const accessgroup: IParty = await this.accessGroupService.getAccessGroup(customerAccountKey, partyParentId);

    if (!accessgroup) {
      return res.status(409).json({ message: `AccessGroup (id: ${partyParentId})  doesn't exist` });
    }

    try {
      const UserOfAccessGroup: IPartyRelation[] = await this.accessGroupService.getUserOfAccessGroup(partyParentId);

      res.status(200).json({ data: UserOfAccessGroup, message: 'success' });
    } catch (error) {
      next(error);
    }
  };

  public removeUserFromAccessGroup = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const customerAccountKey = req.customerAccountKey;
    const logginedUserId = req.user.partyId;

    const partyParentId: string = req.params.partyId;
    const removingPartyChildData: AddUserAccessGroupDto = req.body;

    const accessgroup: IParty = await this.accessGroupService.getAccessGroup(customerAccountKey, partyParentId);

    if (!accessgroup) {
      res.status(409).json({ message: `AccessGroup (id: ${partyParentId})  doesn't exist` });
    }

    try {
      const deleted = await this.accessGroupService.removeUserFromAccessGroup(
        customerAccountKey,
        logginedUserId,
        partyParentId,
        removingPartyChildData,
      );

      if (deleted) {
        res.status(204).json({ message: 'deleted' });
      }
    } catch (error) {
      next(error);
    }
  };

  public addResourceToAccessGroup = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const customerAccountKey = req.customerAccountKey;
    const logginedUserId = req.user.partyId;

    const partyId: string = req.params.partyId;
    const addingResourceData: AddResourceToAccessGroupDto = req.body;

    const accessgroup: IParty = await this.accessGroupService.getAccessGroup(customerAccountKey, partyId);

    if (!accessgroup) {
      res.status(404).json({ message: `AccessGroup (id: ${partyId})  doesn't exist` });
    }

    try {
      const addedResource = await this.accessGroupService.addResourceToAccessGroup(customerAccountKey, logginedUserId, partyId, addingResourceData);

      if (addedResource === 'Contains resources that are already added to the accessGorup.') {
        res.status(500).json({ message: addedResource });
      } else {
        res.status(201).json({ data: addedResource, message: 'added' });
      }
    } catch (error) {
      console.log(error, '<------');


      next(error);
    }
  };

  public removeResourceFromAccessGroup = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const customerAccountKey = req.customerAccountKey;
    const logginedUserId = req.user.partyId;

    const partyId: string = req.params.partyId;
    const removingResourceData: AddResourceToAccessGroupDto = req.body;

    const accessgroup: IParty = await this.accessGroupService.getAccessGroup(customerAccountKey, partyId);

    if (!accessgroup) {
      res.status(409).json({ message: `AccessGroup (id: ${partyId})  doesn't exist` });
    }

    try {
      const removedResource = await this.accessGroupService.removeResourceFromAccessGroup(
        customerAccountKey,
        logginedUserId,
        partyId,
        removingResourceData,
      );

      if (removedResource) {
        res.status(200).json({ message: 'removed' });
      }
    } catch (error) {
      next(error);
    }
  };

  public getResourceOfAccessGroup = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const customerAccountKey = req.customerAccountKey;

    const partyId: string = req.params.partyId;

    const accessgroup: IParty = await this.accessGroupService.getAccessGroup(customerAccountKey, partyId);

    if (!accessgroup) {
      return res.status(409).json({ message: `AccessGroup (id: ${partyId})  doesn't exist` });
    }

    try {
      const resourceOfAccessGroup = await this.accessGroupService.getResourceOfAccessGroup(customerAccountKey, partyId);

      res.status(200).json({ data: resourceOfAccessGroup, message: 'resources of AccessGroup All' });
    } catch (error) {
      next(error);
    }
  };
}

export default AccessGroupController;
