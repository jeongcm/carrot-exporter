import { NextFunction, Response } from 'express';

import PartyService from '@/modules/Party/services/party.service';

import { RequestWithUser } from '@/common/interfaces/auth.interface';
import { IParty, IPartyUserAPILog, IPartyUserResponse, IRequestWithSystem, IRequestWithUser } from '@/common/interfaces/party.interface';
import { CreateUserDto, UpdateUserDto, LoginDto } from '@/modules/Party/dtos/party.dto';
import { ICustomerAccount } from '@/common/interfaces/customerAccount.interface';
import CustomerAccountService from '@/modules/CustomerAccount/services/customerAccount.service';
import { logger } from '@/common/utils/logger';

class PartyController {
  public partyService = new PartyService();
  public customerAccountService = new CustomerAccountService();

  public getUsers = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const customerAccountKey = req.customerAccountKey;

    try {
      const userAll: IParty[] = await this.partyService.getUsers(customerAccountKey);

      if (userAll) {
        return res.status(200).json({ data: userAll, message: 'success' });
      }
    } catch (error) {
      next(error);
    }
  };

  public getUser = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const customerAccountKey = req.customerAccountKey;
    const partyUserId = req.params.partyUserId;

    try {
      const user: IParty = await this.partyService.getUser(customerAccountKey, partyUserId);

      if (user) {
        return res.status(200).json({ data: user, message: 'success' });
      } else {
        return res.status(404).json({ message: 'user not found' });
      }
    } catch (error) {
      next(error);
    }
  };

  public getCurrentUser = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const customerAccountKey = req.customerAccountKey;

    try {
      const partyUserId = req.user.partyId;
      const user: IParty = await this.partyService.getUser(customerAccountKey, partyUserId);
      const account: ICustomerAccount = await this.customerAccountService.getCustomerAccountByKey(customerAccountKey);

      if (!user) {
        return res.status(500).json({ ok: false, message: 'NO_USER' });
      }

      if (!account) {
        return res.status(500).json({ ok: false, message: 'NO_ACCOUNT' });
      }

      return res.status(200).json({
        user,
        account,
        message: 'success',
      });
    } catch (error) {
      next(error);
    }
  };

  public createUser = async (req: IRequestWithSystem, res: Response, next: NextFunction) => {
    const createUserData: CreateUserDto = req.body;

    const customerAccountKey: ICustomerAccount = await this.customerAccountService.getCustomerAccountKeyById(createUserData.customerAccountId);

    if (!customerAccountKey) {
      return res.status(409).json({ message: "customerAccount doesn't exist" });
    }

    try {
      const createdUser: IPartyUserResponse = await this.partyService.createUser(createUserData, customerAccountKey.customerAccountKey, req.systemId);

      if (createdUser) {
        return res.status(201).json({ data: createdUser, message: 'created' });
      } else {
        return res.status(500).json({ message: "user can't be created" });
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
      return res.status(404).json({ message: `user (id: ${updateUserId})  doesn't exist` });
    }

    try {
      const updatedUser: IParty = await this.partyService.updateUser(customerAccountKey, logginedUserId, updateUserId, updateUserData);

      

      res.status(200).json({ data: updatedUser, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public getUserAPILog = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const customerAccountKey = req.customerAccountKey;
    const partyId: string = req.params.partyId;

    const party: IParty = await this.partyService.getUser(customerAccountKey, partyId);

    if (!party) {
      return res.status(409).json({ message: `PartyUser (id: ${partyId})  doesn't exist` });
    }

    try {
      const userAPILog: IPartyUserAPILog[] = await this.partyService.getUserAPILog(partyId);

      res.status(200).json({ data: userAPILog, message: 'All partyUser API logs' });
    } catch (error) {
      next(error);
    }
  };

  public login = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const loginData: LoginDto = req.body;
      const { cookie, findUser, token } = await this.partyService.login(loginData);

      const loggedInUser = {
        partyId: findUser.partyUserId,
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
      res.setHeader('Set-Cookie', ['X-AUTHORIZATION=; Max-age=0']);
      res.removeHeader('X-AUTHORIZATION');
      res.status(200).send({ message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  };

  public requestPasswordReset = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const email: string = req.params.email;
      console.log (email); 
      const resultRequest = await this.partyService.requestPasswordReset(email);
      res.status(200).json({ data: resultRequest, message: ' Password reset email sent successfully' });


    } catch (error) {
      next(error);
    }
  };

  public resetPassword = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const {body:{email, password, oldPassword = ''}, query:{reset_token = ''}} = req;
      const resultRequest = await this.partyService.resetPassword(email, password, reset_token, oldPassword);
      res.status(200).json({ data: resultRequest, message: 'Sent Password reset email successuflly' });


    } catch (error) {
      next(error);
    }
  };


  

}

export default PartyController;
