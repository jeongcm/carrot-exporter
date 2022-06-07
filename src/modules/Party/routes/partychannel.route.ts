import { Routes } from '@/common/interfaces/routes.interface';
import { Router } from 'express';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';
import PartyChannelController from '../controllers/partychannel.controller';
import validationMiddleware from '@/common/middlewares/validation.middleware';
import { AddChannelToAccessGroupDto, RemoveChannelFromAccessGroupDto } from '../dtos/partychannel.dto';
class PartyChannelRoute implements Routes {
  public router = Router();
  public partyChannelController = new PartyChannelController();
  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.post(
      '/party/:partyId/channels',
      authMiddleware,
      validationMiddleware(AddChannelToAccessGroupDto, 'body'),
      this.partyChannelController.addChannelToAccessGroup,
    );

    this.router.delete(
      '/party/:partyId/channels',
      authMiddleware,
      validationMiddleware(RemoveChannelFromAccessGroupDto, 'body'),
      this.partyChannelController.removeChannelFromAccessGroup,
    );

    this.router.get('/party/:partyId/channels', authMiddleware, this.partyChannelController.getChannelOfAccessGroup);
  }
}

export default PartyChannelRoute;
