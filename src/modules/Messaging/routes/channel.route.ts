import { Router } from 'express';
import ChannelController from '@/modules/Messaging/controllers/channel.controller';
import { CreateChannelDto } from '@/modules/Messaging/dtos/channel.dto';
import { Routes } from '@/common/interfaces/routes.interface';
import validationMiddleware from '@/common/middlewares/validation.middleware';
import AuthService from '@/modules/UserTenancy/services/auth.service';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';

class ChannelsRoute implements Routes {
  public router = Router();
  public channelController = new ChannelController();
  public authservice = new AuthService();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // this.router.get('/channels', this.channelController.getUserChannels);
    this.router.post('/channels', authMiddleware, validationMiddleware(CreateChannelDto, 'body'), this.channelController.createChannel);
    this.router.get('/channels', authMiddleware, this.channelController.getAllChannels);
    this.router.get('/channels/:id/accessgroup', authMiddleware, this.channelController.getAccessGroupByChannel);
    this.router.get('/channels/:id', authMiddleware, this.channelController.getChannelById);
    this.router.delete('/channels/:id', authMiddleware, this.channelController.deleteChannel);
    this.router.put('/channels/:id', authMiddleware, validationMiddleware(CreateChannelDto, 'body'), this.channelController.updateChannel);
  }
}

export default ChannelsRoute;
