import { NextFunction, Response } from 'express';

import PartyService from '@/modules/Party/services/party.service';
import ExternalPartyService from '@/modules/Party/services/externalParty.service';

import { RequestWithUser } from '@/common/interfaces/auth.interface';
import { IParty, IPartyUserAPILog, IPartyUserResponse, IRequestWithSystem, IRequestWithUser } from '@/common/interfaces/party.interface';
import { CreateUserDto, UpdateUserDto, LoginDto, LoginApiDto } from '@/modules/Party/dtos/party.dto';
import { ICustomerAccount } from '@/common/interfaces/customerAccount.interface';
import CustomerAccountService from '@/modules/CustomerAccount/services/customerAccount.service';
import { logger } from '@/common/utils/logger';
import { validatePassword } from '@/common/utils/passwordValidation';

class PartyController {
  public partyService = new PartyService();
  public externalPartyService = new ExternalPartyService();
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
      const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return res.status(200).json({
        user,
        account,
        browserTimezone,
        message: 'success',
      });
    } catch (error) {
      next(error);
    }
  };

  public createUser = async (req: IRequestWithSystem, res: Response, next: NextFunction) => {
    const createUserData: CreateUserDto = req.body;

    try {
      const customerAccountKey: number = await this.customerAccountService.getCustomerAccountKeyById(createUserData.customerAccountId);

      if (!customerAccountKey) {
        return res.status(409).json({ message: "customerAccount doesn't exist" });
      }

      const createdUser: IPartyUserResponse = await this.partyService.createUser(createUserData, req.systemId);
      console.log('createdUser', createdUser);
      if (!createdUser?.errors || !createdUser?.errors.length) {
        return res.status(201).json({ data: createdUser, message: 'created' });
      } else {
        return res.status(500).json({ message: createdUser?.errors[0].message });
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

  public login = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const loginData: LoginDto = req.body;
      //const customerAccountKey = req.customerAccountKey;
      const { cookie, findUser, token } = await this.partyService.login(loginData);

      const loggedInUser = {
        partyId: findUser.partyUserId,
        id: findUser.userId,
        email: findUser.email,
        firstName: findUser.firstName,
        lastName: findUser.lastName,
        mobile: findUser.mobile,
      };

      // res.setHeader('Set-Cookie', [cookie]);
      res.status(200).json({ data: loggedInUser, message: 'login', token });
    } catch (error) {
      next(error);
    }
  };

  public loginInSystem = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const loginData: LoginDto = req.body;
      //const customerAccountKey = req.customerAccountKey;
      const { cookie, findUser, token } = await this.partyService.loginInSystem(loginData);

      const loggedInUser = {
        partyId: findUser.partyUserId,
        id: findUser.userId,
        email: findUser.email,
        firstName: findUser.firstName,
        lastName: findUser.lastName,
        mobile: findUser.mobile,
      };

      // res.setHeader('Set-Cookie', [cookie]);
      res.status(200).json({ data: loggedInUser, message: 'login', token });
    } catch (error) {
      next(error);
    }
  };

  public apiLogin = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const loginData: LoginApiDto = req.body;
      const { cookie, findCustomerAccount, token } = await this.externalPartyService.apiLogin(loginData);

      const loggedInCustomerAccount = {
        customerAccountid: findCustomerAccount.customerAccountId,
      };

      res.setHeader('Set-Cookie', [cookie]);
      res.status(200).json({ data: loggedInCustomerAccount, message: 'login', token });
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
      console.log(email);
      const resultRequest = await this.partyService.requestPasswordReset(email);
      res.status(200).json({ data: resultRequest, message: ' Password reset email sent successfully' });
    } catch (error) {
      next(error);
    }
  };

  public resetPassword = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const {
        body: { email, password, oldPassword = '' },
        query: { reset_token = '' },
      } = req;
      const resultRequest = await this.partyService.resetPassword(email, password, reset_token, oldPassword);
      res.status(200).json({ data: resultRequest, message: 'Sent Password reset email successuflly' });
    } catch (error) {
      next(error);
    }
  };

  public resetPasswordByAdmin = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const {
        body: { userId, password, adminCode },
      } = req;
      const resultRequest = await this.partyService.resetPasswordByAdmin(userId, password, adminCode);
      res.status(200).json({ data: resultRequest, message: 'success' });
    } catch (error) {
      next(error);
    }
  };

  public deleteParty = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const {
        params: { partyId },
      } = req;
      const resultRequest = await this.partyService.deleteParty(partyId);
      res.status(200).json({ data: resultRequest, message: 'success' });
    } catch (error) {
      next(error);
    }
  };
}

export default PartyController;
