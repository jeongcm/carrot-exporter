import { Router } from 'express';
import ChannelController from '@/modules/Messaging/controllers/channel.controller';
import { CreateChannelDto, RemoveChannelDto, UpdateChannelDto } from '@/modules/Messaging/dtos/channel.dto';
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
    this.router.get('/channels/:channelId', authMiddleware, this.channelController.getChannelById);
    this.router.put('/channels/:channelId', authMiddleware, validationMiddleware(UpdateChannelDto, 'body'), this.channelController.updateChannel);
    this.router.delete('/channels', authMiddleware, validationMiddleware(RemoveChannelDto, 'body'), this.channelController.removeChannel);
  }
}

export default ChannelsRoute;
