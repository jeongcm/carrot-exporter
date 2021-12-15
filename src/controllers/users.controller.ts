import { NextFunction, Request, Response } from 'express';
import { CreateUserDto } from '@dtos/users.dto';
import { User } from '@interfaces/users.interface';
import userService from '@services/users.service';
import DB from 'databases';

class UsersController {
  public userService = new userService();
  public users = DB.Users;

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
      const {email} = req.body;
      const findOneUserData: User = await this.userService.findUserByEmail(email);
      if( findOneUserData &&Object.keys(findOneUserData).length){
        return res.status(200).json({ message: `User exit with ${email} mail`});
      }else{
        return res.status(200).json({ message: "Validated Successfully"});
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
      const userId = Number(req.params.id);
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

  public verifyMail = async(req, res, next)=>{
    console.log(req.query)
    const {token , email} = req.query;
    if(token){
      let obj = {
        isEmailValidated:true,
        emailValidatedOn:new Date(),
        token
      };
      this.users.update(obj, {where:{email}});
      return res.status(200).json({message:"user verified successfully"})
    }else{
      return res.status(400).json({message:"Token is missing in the url"});
    }
  }
}

export default UsersController;
