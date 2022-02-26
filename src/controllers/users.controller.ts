import { NextFunction, Request, Response } from 'express';
import { CreateUserDto } from '@dtos/users.dto';
import { User } from '@interfaces/users.interface';
import userService from '@services/users.service';
import TokenService from '@services/token.service';
import DB from 'databases';
const crypto = require('crypto');

class UsersController {
  public userService = new userService();
  public tokenService = new TokenService();
  public users = DB.Users;
  public token = DB.Tokens;

  public getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const findAllUsersData: User[] = await this.userService.findAllUser();
      res.status(200).json({ data: findAllUsersData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.id;
      const findOneUserData: User = await this.userService.findUserById(userId);
      res.status(200).json({ data: findOneUserData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };
  public checkForDuplicateMail = async (req: Request, res: Response, next: NextFunction) => {
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

  public createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: CreateUserDto = req.body;
      const createUserData: User = await this.userService.createUser(userData);
      delete createUserData.password;
      res.status(201).json({ data: createUserData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.id;
      const userData: CreateUserDto = req.body;
      const updateUserData: User = await this.userService.updateUser(userId, userData);
      delete updateUserData.password;
      res.status(200).json({ data: updateUserData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = Number(req.params.id);
      const deleteUserData: User = await this.userService.deleteUser(userId);

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
      let obj = {
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

  public recoverPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      const userDetail: User = await this.userService.findUserByEmail(email);
      if (!userDetail) {
        return res.status(200).json({ ok: false, message: 'USER_NOT_FOUND_WITH_THIS_EMAIL_ID' });
      }
      let reset_token = crypto.randomBytes(32).toString("hex");
      let obj = {
        userId: userDetail.id,
        token: reset_token
      };
      await this.tokenService.createTokenDetail(obj);
      req.body['from'] = process.env.NC_NODE_FROM_MAIL;
      req.body['email'] = email;
      req.body['username'] = userDetail.username;
      req.body['reset_token'] = reset_token;
      req.body['subject'] = 'Reset Password !!';
      return await this.userService.sendRecoveryMail(req, res);
    } catch (err) {
      return res.status(400).json({ message: 'Error while sending passwor reset mail', error: err });
    }
  };

  public resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {  newPassword } = req.body;
      const { reset_token } = req.query;
      const token = await this.tokenService.findTokenDetail(reset_token);
      const userDetails = await this.userService.findUserById(token.userId);
      if (!token) {
        return res.status(400).json({ message: 'Invalid Token' });
      }
      if(token.expiryTime - Date.now()<0){
        return res.status(400).json({ message: 'Token has been expired, Please try resetting again' });
      }
      await this.userService.updateUser(token.userId, {loginPw:newPassword});
      req.body['from'] = process.env.NC_NODE_FROM_MAIL;
      req.body['subject'] = 'Password Reset Successfully !!';
      req.body['email'] = userDetails.email;
      req.body['isResetMail'] = true;
      return await this.userService.sendRecoveryMail(req, res);


    } catch (err) {

    }
  };
}

export default UsersController;
