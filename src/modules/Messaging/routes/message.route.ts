import { Router } from 'express';
import ChannelController from '@/modules/Messaging/controllers/channel.controller';
import { CreateMessageDto } from '@/modules/Messaging/dtos/message.dto';
import { Routes } from '@/common/interfaces/routes.interface';
import validationMiddleware from '@/common/middlewares/validation.middleware';
import AuthService from '@/modules/UserTenancy/services/auth.service';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';

class MessageRoute implements Routes {
  public router = Router();
  public channelController = new ChannelController();
  public authservice = new AuthService();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/message', authMiddleware, validationMiddleware(CreateMessageDto, 'body'), this.channelController.createChannel);
    this.router.get('/messages', authMiddleware, this.channelController.getAllChannels);
    this.router.get('/message/:messageId', authMiddleware, this.channelController.getAccessGroupByChannel);
    this.router.put('/message/:messageId', authMiddleware, validationMiddleware(CreateMessageDto, 'body'), this.channelController.updateChannel);
  }
}

export default MessageRoute;