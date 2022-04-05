import DB from '@/database';

import { NextFunction, Response } from 'express';

import PartyService from '@/modules/Party/services/party.service';

import { RequestWithUser } from '@/common/interfaces/auth.interface';
import {
  IParty,
  IPartyRelation,
  IPartyResponse,
  IPartyUserResponse,
  IRequestWithSystem,
  IRequestWithUser,
} from '@/common/interfaces/party.interface';
import { CreateUserDto, UpdateUserDto, CreateAccessGroupDto, AddUserAccessGroupDto, LoginDto } from '@/modules/Party/dtos/party.dto';
import { ICustomerAccount } from '@/common/interfaces/customerAccount.interface';
import CustomerAccountService from '@/modules/CustomerAccount/services/customerAccount.service';

class PartyController {
  public partyService = new PartyService();
  public customerAccountService = new CustomerAccountService();

  public getUsers = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const customerAccountKey = req.customerAccountKey;

    try {
      const userAll: IParty[] = await this.partyService.getUsers(customerAccountKey);

      res.status(200).json({ data: userAll, message: 'success' });
    } catch (error) {
      next(error);
    }
  };

  public getUser = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const customerAccountKey = req.customerAccountKey;
    const partyUserId = req.params.partyUserId;

    try {
      const user: IParty = await this.partyService.getUser(customerAccountKey, partyUserId);

      res.status(200).json({ data: user, message: 'success' });
    } catch (error) {
      next(error);
    }
  };

  public createUser = async (req: IRequestWithSystem, res: Response, next: NextFunction) => {
    const createUserData: CreateUserDto = req.body;

    const customerAccountKey: ICustomerAccount = await this.customerAccountService.getCustomerAccountKeyById(createUserData.customerAccountId);

    if (!customerAccountKey) {
      res.status(409).json({ message: "customerAccount doesn't exist" });
    }

    try {
      const createdUser: IPartyUserResponse = await this.partyService.createUser(createUserData, customerAccountKey.customerAccountKey, req.systemId);

      if (createdUser) {
        res.status(201).json({ data: createdUser, message: 'created' });
      }
    } catch (error) {
      next(error);
    }
  };

  public updateUser = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const customerAccountKey = req.customerAccountKey;
    const logginedUserId = req.user.partyId;

    const updateUserData: UpdateUserDto = req.body;
    const updateUserId: string = req.params.partyUserId;

    const user: IParty = await this.partyService.getUser(customerAccountKey, updateUserId);

    if (!user) {
      res.status(409).json({ message: `user (id: ${updateUserId})  doesn't exist` });
    }

    try {
      const updatedUser: IParty = await this.partyService.updateUser(customerAccountKey, logginedUserId, updateUserId, updateUserData);

      res.status(201).json({ data: updatedUser, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public createAccessGroup = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const customerAccountKey = req.customerAccountKey;
    const logginedUserId = req.user.partyId;

    const createData: CreateAccessGroupDto = req.body;

    try {
      const createdAccessGroup: IPartyResponse = await this.partyService.createAccessGroup(customerAccountKey, logginedUserId, createData);

      res.status(201).json({ data: createdAccessGroup, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public getAccessGroups = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const customerAccountKey = req.customerAccountKey;

    try {
      const accessGroups: IParty[] = await this.partyService.getAccessGroups(customerAccountKey);

      res.status(200).json({ data: accessGroups, message: 'success' });
    } catch (error) {
      next(error);
    }
  };

  public getAccessGroup = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const customerAccountKey = req.customerAccountKey;
    const partyId = req.params.partyId;

    try {
      const accessGroup: IParty = await this.partyService.getAccessGroup(customerAccountKey, partyId);

      res.status(200).json({ data: accessGroup, message: 'success' });
    } catch (error) {
      next(error);
    }
  };

  public updateAccessGroup = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const customerAccountKey = req.customerAccountKey;
    const logginedUserId = req.user.partyId;

    const updateData: UpdateUserDto = req.body;
    const updatePartyId: string = req.params.partyId;

    const accessgroup: IParty = await this.partyService.getAccessGroup(customerAccountKey, updatePartyId);

    if (!accessgroup) {
      res.status(409).json({ message: `AccessGroup (id: ${updatePartyId})  doesn't exist` });
    }

    try {
      const updatedAccessgroup: IParty = await this.partyService.updateAccessGroup(customerAccountKey, logginedUserId, updatePartyId, updateData);

      res.status(200).json({ data: updatedAccessgroup, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public addUserToAccessGroup = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const customerAccountKey = req.customerAccountKey;
    const logginedUserId = req.user.partyId;

    const partyParentId: string = req.params.partyId;
    const addingPartyChildData: AddUserAccessGroupDto = req.body;

    const accessgroup: IParty = await this.partyService.getAccessGroup(customerAccountKey, partyParentId);

    if (!accessgroup) {
      res.status(409).json({ message: `AccessGroup (id: ${partyParentId})  doesn't exist` });
    }

    try {
      const addUserToAccessGroup: IParty = await this.partyService.addUserToAccessGroup(
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

    const accessgroup: IParty = await this.partyService.getAccessGroup(customerAccountKey, partyParentId);

    if (!accessgroup) {
      res.status(409).json({ message: `AccessGroup (id: ${partyParentId})  doesn't exist` });
    }

    try {
      const UserOfAccessGroup: IPartyRelation[] = await this.partyService.getUserOfAccessGroup(partyParentId);

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

    const accessgroup: IParty = await this.partyService.getAccessGroup(customerAccountKey, partyParentId);

    if (!accessgroup) {
      res.status(409).json({ message: `AccessGroup (id: ${partyParentId})  doesn't exist` });
    }

    try {
      await this.partyService.removeUserFromAccessGroup(customerAccountKey, logginedUserId, partyParentId, removingPartyChildData);

      res.status(204).json({ message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };

  public login = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const loginData: LoginDto = req.body;
      const { cookie, findUser, token } = await this.partyService.login(loginData);

      const loggedInUser = {
        id: findUser.userId,
        email: findUser.email,
        firstName: findUser.firstName,
        lastName: findUser.lastName,
        mobile: findUser.mobile,
      };

      res.setHeader('Set-Cookie', [cookie]);
      res.status(200).json({ data: loggedInUser, message: 'login', token });
    } catch (error) {
      next(error);
    }
  };

  public logout = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      res.setHeader('set-cookie', ['X-AUTHORIZATION=; Max-age=0']);
      req.logOut();
      res.status(200).send({ message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  };
}

export default PartyController;
