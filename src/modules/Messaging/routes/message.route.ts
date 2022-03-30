import { Router } from 'express';
import MessageController from '@/modules/Messaging/controllers/channel.controller';
import { CreateMessageDto } from '@/modules/Messaging/dtos/message.dto';
import { Routes } from '@/common/interfaces/routes.interface';
import validationMiddleware from '@/common/middlewares/validation.middleware';
import AuthService from '@/modules/UserTenancy/services/auth.service';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';

class MessageRoute implements Routes {
  public router = Router();
  public messageController = new MessageController();
  public authservice = new AuthService();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/message', authMiddleware, validationMiddleware(CreateMessageDto, 'body'), this.messageController.createChannel);
    this.router.get('/messages', authMiddleware, this.messageController.getAllChannels);
    this.router.get('/message/:messageId', authMiddleware, this.messageController.getAccessGroupByChannel);
    this.router.put('/message/:messageId', authMiddleware, validationMiddleware(CreateMessageDto, 'body'), this.messageController.updateChannel);
  }
}

export default MessageRoute;