import { Router } from 'express';
import MessageController from '@/modules/Messaging/controllers/message.controller';
import { CreateMessageDto } from '@/modules/Messaging/dtos/message.dto';
import { Routes } from '@/common/interfaces/routes.interface';
import validationMiddleware from '@/common/middlewares/validation.middleware';
import AuthService from '@/modules/UserTenancy/services/auth.service';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';
import systemAuthMiddleware from '@/modules/ApiGateway/middlewares/systemAuth.middleware';

class MessageRoute implements Routes {
  public router = Router();
  public messageController = new MessageController();
  public authservice = new AuthService();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/message', systemAuthMiddleware, authMiddleware, validationMiddleware(CreateMessageDto, 'body'), this.messageController.createMessage);
    this.router.get('/messages', authMiddleware, this.messageController.getAllMessages);
    this.router.get('/message/:messageId', authMiddleware, this.messageController.getMessageById);
    this.router.put('/message/:messageId', systemAuthMiddleware, authMiddleware, validationMiddleware(CreateMessageDto, 'body'), this.messageController.updateMessage);
  }
}

export default MessageRoute;