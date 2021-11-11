import { NextFunction, Request, Response } from 'express';
import { CreateUserDto } from '@dtos/users.dto';
import { User } from '@interfaces/users.interface';
import { RequestWithUser } from '@interfaces/auth.interface';
import AuthService from '@services/auth.service';

class AuthController {
  public authService = new AuthService();

  public signUp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("userData========================", req.body)
      const userData: CreateUserDto = req.body;
      const signUpUserData: User = await this.authService.signup(userData);
      res.status(201).json({ data: signUpUserData, message: 'signup' });
    } catch (error) {
      console.log("err");
      next(error);
    }
  };

  public logIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: CreateUserDto = req.body;
      const { cookie, findUser } = await this.authService.login(userData);
      res.setHeader('Set-Cookie', [cookie]);
      res.status(200).json({ data: findUser, message: 'login' });
    } catch (error) {
      next(error);
    }
  };

  public logOut = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      res.setHeader('set-cookie', ['X-AUTHORIZATION=; Max-age=0']);
      res.status(200).send({  message: 'logged out successfully' });
    } catch (error) {
      next(error);
    }
  };


  public info = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {     
      const logOutUserData: User = await this.authService.info(req);
      res.status(200).json({ data: logOutUserData, message: 'me' });
    } catch (error) {
      next(error);
    }
  };
}



export default AuthController;
