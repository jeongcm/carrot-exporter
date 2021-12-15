import { NextFunction, Request, Response } from 'express';
import { CreateUserDto } from '@dtos/users.dto';
import { User } from '@interfaces/users.interface';
import { RequestWithUser } from '@interfaces/auth.interface';
import AuthService from '@services/auth.service';

class AuthController {
  public authService = new AuthService();

  public signUp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: CreateUserDto = req.body;
      const signUpUserData: User = await this.authService.signup(userData);
      let createdData = {
        id: signUpUserData.id,
        email: signUpUserData.email,
        username: signUpUserData.username,
        firstName: signUpUserData.firstName,
        lastName: signUpUserData.lastName,
        mobile: signUpUserData.mobile,
        photo: signUpUserData.photo,
        isEmailValidated: signUpUserData.isEmailValidated,
        emailValidatedOn: signUpUserData.emailValidatedOn,
        token: signUpUserData.token,
        currentTenancy: signUpUserData.currentTenancy,
        lastAccess: signUpUserData.lastAccess,
        updatedAt: signUpUserData.updatedAt,
        createdAt: signUpUserData.createdAt,
      };
      res.status(201).json({ data: createdData, message: 'signup' });
    } catch (error) {
      next(error);
    }
  };

  public logIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: CreateUserDto = req.body;
      const { cookie, findUser, token } = await this.authService.login(userData);
      let loggedInUser = {
        id: findUser.id,
        email: findUser.email,
        username: findUser.username,
        firstName: findUser.firstName,
        lastName: findUser.lastName,
        mobile: findUser.mobile,
        photo: findUser.photo,
        lastAccess: findUser.lastAccess,
        updatedAt: findUser.updatedAt,
        createdAt: findUser.createdAt,
      };
      res.setHeader('Set-Cookie', [cookie]);
      res.status(200).json({ data: loggedInUser, message: 'login', token });
    } catch (error) {
      next(error);
    }
  };

  public logOut = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      res.setHeader('set-cookie', ['X-AUTHORIZATION=; Max-age=0']);
      res.status(200).send({ message: 'logged out successfully' });
    } catch (error) {
      next(error);
    }
  };

  public info = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const logOutUserData: User = await this.authService.info(req);
      res.status(200).json(logOutUserData);
    } catch (error) {
      next(error);
    }
  };
}

export default AuthController;
