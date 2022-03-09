import { NextFunction, Response } from 'express';
import { CreateUserDto } from '@/modules/UserTenancy/dtos/user.dto';
import { User } from '@/common/interfaces/users.interface';
import userService from '@/modules/UserTenancy/services/users.service';
import TokenService from '@/modules/UserTenancy/services/token.service';
import DB from '@/database';
import config from 'config';
import { RequestWithUser } from '@/common/interfaces/auth.interface';

const crypto = require('crypto');

class UsersController {
  public userService = new userService();
  public tokenService = new TokenService();
  public users = DB.Users;
  public token = DB.Tokens;

  public getUsers = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const findAllUsersData: User[] = await this.userService.findAllUser();
      res.status(200).json({ data: findAllUsersData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getUserById = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userPk = req.params.id;
      const findOneUserData: User = await this.userService.findUserById(userPk);
      res.status(200).json({ data: findOneUserData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };
  public checkForDuplicateMail = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      const findOneUserData: User = await this.userService.findUserByEmail(email);
      if (findOneUserData && Object.keys(findOneUserData).length) {
        return res.status(200).json({ message: `User exit with ${email} mail` });
      } else {
        return res.status(200).json({ message: 'Validated Successfully' });
      }
    } catch (error) {
      next(error);
    }
  };

  public createUser = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userData: CreateUserDto = req.body;
      const createUserData: User = await this.userService.createUser(userData);
      delete createUserData.password;
      res.status(201).json({ data: createUserData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public updateUser = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.id;
      const userData: CreateUserDto = req.body;
      const updateUserData: User = await this.userService.updateUserById(userId, userData);
      delete updateUserData.password;
      res.status(200).json({ data: updateUserData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public deleteUser = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userPk = Number(req.params.id);
      const deleteUserData: User = await this.userService.deleteUser(userPk);

      res.status(200).json({ data: deleteUserData, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };

  public verifyMail = async (req, res, next) => {
    const { token, email } = req.query;
    const userDetail = await this.users.findOne({ where: { email } });
    if (!token) {
      return res.status(400).json({ message: 'Token is missing in the url' });
    }
    if (token && userDetail.token == token) {
      const obj = {
        isEmailValidated: true,
        emailValidatedOn: new Date(),
        token,
      };
      this.users.update(obj, { where: { email } });
      return res.status(200).json({ message: 'user verified successfully' });
    } else {
      return res.status(400).json({ message: 'Token is invalid' });
    }
  };

  public recoverPassword = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { email } = req.body;
    const userDetail: User = await this.userService.findUserByEmail(email);
    if (!userDetail) {
      return res.status(200).json({ ok: false, message: 'USER_NOT_FOUND_WITH_THIS_EMAIL_ID' });
    }

    //RYAN: we should really move this inside the token service FROM:
    const resetToken = crypto.randomBytes(32).toString('hex');
    const obj = {
      userPk: userDetail.pk,
      token: resetToken,
    };
    // RYAN: till HERE. One of the reasons that we might reluctant to put into token
    // is the name "token" is away too ambiguous.
    // What if we call it recoverPasswordToken Service?
    // What if we call createRecoverPasswordToken method?

    const tokenResult = await this.tokenService.createTokenDetail(obj);
    req.body['from'] = config.email.defaultFrom;
    req.body['email'] = email;
    req.body['username'] = userDetail.username;
    req.body['reset_token'] = resetToken;
    req.body['subject'] = 'Reset Password';

    let emailResult = {
      ok: false,
      emailResult: null,
    };
    try {
      emailResult = {
        ok: true,
        emailResult: await this.userService.sendRecoveryMail(req, res),
      };
    } catch (err) {
      emailResult = {
        ok: false,
        emailResult: err,
      };
    }

    if (!emailResult.ok) {
      return res.status(400).json({
        ok: false,
        message: 'Failed to send recover email',
        emailResult,
        tokenResult,
      });
    }

    return res.status(200).json({
      ok: true,
      message: 'recovery email sent',
    });
  };

  public resetPassword = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const { newPassword } = req.body;
      const { reset_token } = req.query;
      const token = await this.tokenService.findTokenDetail(reset_token);

      if (!token) {
        return res.status(400).json({ message: 'Invalid Token' });
      }
      if (token.expiryTime - Date.now() < 0) {
        return res.status(400).json({ message: 'Token has been expired, Please try resetting again' });
      }
      const userDetails = await this.userService.findUserByPk(token.userPk);

      await this.userService.updateUserPassword(token.userPk, newPassword);

      this.tokenService.deleteTokenByToken(reset_token);

      req.body['from'] = config.email.defaultFrom;
      req.body['subject'] = 'Password Reset Successfully!';
      req.body['email'] = userDetails.email;
      req.body['isResetMail'] = true;
      return await this.userService.sendRecoveryMail(req, res);
    } catch (err) {
      next(err);
    }
  };
}

export default UsersController;
