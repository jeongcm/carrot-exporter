import { Router } from 'express';
import UsersController from '@controllers/users.controller';
import SendMailController from '@controllers/sendMail.controller';
import { CreateUserDto } from '@dtos/users.dto';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';

class UsersRoute implements Routes {
  public path = '/';
  public router = Router();
  public usersController = new UsersController();
  public sendMailController = new SendMailController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/users', this.usersController.getUsers);
    this.router.get('/users/:id(\\d+)', this.usersController.getUserById);
    this.router.post('/users', validationMiddleware(CreateUserDto, 'body'), this.usersController.createUser);
    this.router.put('/users/:id(\\d+)', validationMiddleware(CreateUserDto, 'body', true), this.usersController.updateUser);
    this.router.delete('/users/:id(\\d+)', this.usersController.deleteUser);
    this.router.post('/users/sendMail', this.sendMailController.processMail);
    this.router.get('/verify', this.usersController.verifyMail);
    this.router.post('/users/duplicateMail', this.usersController.checkForDuplicateMail);
  }
}

export default UsersRoute;
