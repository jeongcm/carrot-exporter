import { Notification } from '@/common/interfaces/notification.interface';
import { IRequestWithUser } from '@/common/interfaces/party.interface';
import tableIdService from '@/modules/CommonService/services/tableId.service';
import NotificationService from '@/modules/Notification/services/notification.service';
import { NextFunction, Response } from 'express';
import { CreateNotificationDto, UpdateNotificationDto } from '../dtos/notification.dto';
class NotificationController {
  public notificationService = new NotificationService();
  public tableIdService = new tableIdService();

  public getAllNotification = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const customerAccountKey = req.customerAccountKey;
      const findAllNotification: Notification[] = await this.notificationService.findAllNotification(customerAccountKey);
      res.status(200).json({ data: findAllNotification, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getNotificationById = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const notificationId: string = req.params.notificationId;
      const findNotification: Notification = await this.notificationService.findNotificationById(notificationId);
      if (findNotification != null) {
        res.status(200).json({ data: findNotification, message: 'findOne' });
      } else {
        res.status(404).json({ data: 'Not Found', message: 'findOne' });
      }
    } catch (error) {
      next(error);
    }
  };

  public createNotification = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const customerAccountKey = req.customerAccountKey;
      const { user:{partyKey},systemId} = req
      const notificationData: CreateNotificationDto = req.body;
      const createNotificationData: Notification = await this.notificationService.createNotification(
        notificationData,
        partyKey,
        customerAccountKey,
        systemId
      );
      res.status(201).json({ data: createNotificationData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public updateNotification = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const notificationId: string = req.params.notificationId;
      const customerAccountKey = req.customerAccountKey;
      const { user:{partyKey},systemId} = req
      const notificationData: UpdateNotificationDto = req.body;
      const updateNotificationData: Notification = await this.notificationService.updateNotification(
        notificationId,
        partyKey,
        customerAccountKey,
        notificationData,
        systemId
      );
      res.status(200).json({ data: updateNotificationData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };
}

export default NotificationController;
