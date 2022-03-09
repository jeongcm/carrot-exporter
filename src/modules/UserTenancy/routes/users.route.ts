import { Router } from 'express';
import UsersController from '@/modules/UserTenancy/controllers/users.controller';
import SendMailController from '@/modules/Messaging/controllers/sendMail.controller';
import { CreateUserDto } from '@/modules/UserTenancy/dtos/user.dto';
import { Routes } from '@/common/interfaces/routes.interface';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';
import validationMiddleware from '@/common/middlewares/validation.middleware';

class UsersRoute implements Routes {
  public path = '/';
  public router = Router();
  public usersController = new UsersController();
  public sendMailController = new SendMailController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/users', authMiddleware, this.usersController.getUsers);
    this.router.get('/users/:id(\\d+)', authMiddleware, this.usersController.getUserById);
    this.router.post('/users', validationMiddleware(CreateUserDto, 'body'), this.usersController.createUser);
    this.router.put('/users/:id(\\d+)', authMiddleware, validationMiddleware(CreateUserDto, 'body', true), this.usersController.updateUser);
    this.router.delete('/users/:id(\\d+)', authMiddleware, this.usersController.deleteUser);
    this.router.post('/users/sendMail', this.sendMailController.processMail);
    this.router.get('/verify', this.usersController.verifyMail);
    this.router.post('/users/duplicateMail', this.usersController.checkForDuplicateMail);
    this.router.post('/recover-password', this.usersController.recoverPassword);
    this.router.post('/password-reset', this.usersController.resetPassword);
  }
}

export default UsersRoute;
