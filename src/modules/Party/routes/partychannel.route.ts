import { Routes } from '@/common/interfaces/routes.interface';
import { Router } from 'express';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';
import PartyChannelController from '../controllers/partychannel.controller';
import validationMiddleware from '@/common/middlewares/validation.middleware';
import { CreatePartyChannel } from '../dtos/partychannel.dto';
class PartyChannelRoute implements Routes {
  public router = Router();
  public partyChannelController = new PartyChannelController();
  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.post(
      '/partychannel',
      authMiddleware,
      validationMiddleware(CreatePartyChannel, 'body'),
      this.partyChannelController.createPartyChannel,
    );
    this.router.get('/partychannel', authMiddleware, this.partyChannelController.getPartyChannel);
  }
}

export default PartyChannelRoute;
