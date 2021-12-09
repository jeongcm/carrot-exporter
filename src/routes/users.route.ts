import { Router } from 'express';
import UsersController from '@controllers/users.controller';
import SendMailController from '@controllers/sendMail.controller';
import { CreateUserDto } from '@dtos/users.dto';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';

class UsersRoute implements Routes {
  public path = '/users';
  public router = Router();
  public usersController = new UsersController();
  public sendMailController = new SendMailController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.usersController.getUsers);
    this.router.get(`${this.path}/:id(\\d+)`, this.usersController.getUserById);
    this.router.post(`${this.path}`, validationMiddleware(CreateUserDto, 'body'), this.usersController.createUser);
    this.router.put(`${this.path}/:id(\\d+)`, validationMiddleware(CreateUserDto, 'body', true), this.usersController.updateUser);
    this.router.delete(`${this.path}/:id(\\d+)`, this.usersController.deleteUser);
    this.router.post(`${this.path}/sendMail`, this.sendMailController.processMail);
    this.router.get(`/verify`, this.sendMailController.verifyMail);
    this.router.post(`${this.path}/duplicateMail`, this.usersController.checkForDuplicateMail);
  }
}

export default UsersRoute;
