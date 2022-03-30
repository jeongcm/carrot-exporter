import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';

import AuthService from '@/modules/UserTenancy/services/auth.service';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';
import { CreateUserDto, UpdateUserDto, LoginDto } from '@/modules/Party/dtos/party.dto';
import validationMiddleware from '@/common/middlewares/validation.middleware';

import PartyController from '../controllers/party.controller';

class tableIdRoute implements Routes {
  public router = Router();
  public partyController = new PartyController();
  public authservice = new AuthService();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/login', validationMiddleware(LoginDto, 'body'), this.partyController.login);
    this.router.get('/logout', this.partyController.logout);

    this.router.post('/party/user', validationMiddleware(CreateUserDto, 'body'), this.partyController.createUser);

    this.router.get('/party/user', authMiddleware, this.partyController.getUsers);
    this.router.get('/party/user/:partyUserId', authMiddleware, this.partyController.getUser);
    this.router.put('/party/user/:partyUserId', authMiddleware, validationMiddleware(UpdateUserDto, 'body'), this.partyController.updateUser);
  }
}

export default tableIdRoute;
