import { NextFunction, Response } from 'express';
import { IMessage } from '@/common/interfaces/message.interface';
import MessageServices from '@/modules/Messaging/services/message.service';
import { RequestWithUser } from '@/common/interfaces/auth.interface';
import { CreateMessageDto } from '../dtos/message.dto';
class MessageController {
  public messageService = new MessageServices();


  public getAllMessages = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const allCatalogPlans: IMessage[] = await this.messageService.findMessages();
      res.status(200).json({ data: allCatalogPlans, message: 'Success' });
    } catch (error) {
      next(error);
    }
  };


  public createMessage = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const catalogData: CreateMessageDto = req.body;
      const newCatalogPlan: CreateMessageDto = await this.messageService.createMessage(catalogData);
      res.status(201).json({ data: newCatalogPlan, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public getMessageById = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const messageId = req.params.messageId;
      const catalogPlan: IMessage = await this.messageService.findMessage(messageId);
      res.status(200).json({ data: catalogPlan, message: 'finOne' });
    } catch (error) {
      next(error);
    }
  };


  public updateMessage = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const { params: { messageId }, body } = req
      const updated: IMessage = await this.messageService.updateMessageById(messageId, body, req.user.pk);
      res.status(200).json({ updated });
    } catch (error) {
      next(error);
    }
  }
}
export default MessageController;