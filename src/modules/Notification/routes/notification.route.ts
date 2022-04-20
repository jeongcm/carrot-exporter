import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import validationMiddleware from '@/common/middlewares/validation.middleware';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';
import NotificationController from '../controllers/notification.controller';
import { CreateNotificationDto, UpdateNotificationDto } from '../dtos/notification.dto';
import systemAuthMiddleware from '@/modules/ApiGateway/middlewares/systemAuth.middleware';

class NotificationRoute implements Routes {
  public router = Router();
  public notificationController = new NotificationController();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      '/notification',
      systemAuthMiddleware,
      authMiddleware,
      validationMiddleware(CreateNotificationDto, 'body'),
      this.notificationController.createNotification,
    );
    this.router.get('/notification', systemAuthMiddleware, authMiddleware, this.notificationController.getAllNotification);
    this.router.get('/notification/:notificationId', systemAuthMiddleware, this.notificationController.getNotificationById);
    this.router.put(
      '/notification/:notificationId',
      systemAuthMiddleware,
      authMiddleware,
      validationMiddleware(UpdateNotificationDto, 'body'),
      this.notificationController.updateNotification,
    );
  }
}

export default NotificationRoute;
