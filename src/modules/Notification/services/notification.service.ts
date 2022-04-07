import { Notification } from "@/common/interfaces/notification.interface";
import DB from "@/database";
import { CreateNotificationDto, UpdateNotificationDto } from "../dtos/notification.dto";
import { isEmpty } from '@/common/utils/util';
import { HttpException } from '@/common/exceptions/HttpException';
import { NotificationStatus } from '@/common/types';
class NotificationService{
  public notificaion = DB.Notification;

  /**
   * Find all Notifications
   *
   * @returns Promise<Notification[]>
   * @author Akshay
   */
  public async findAllNotification(): Promise<Notification[]> {
    const allNotification: Notification[] = await this.notificaion.findAll({
      where: { deletedAt: null },
      attributes: { exclude: ['messageKey', 'createdBy', 'updatedBy', 'deletedAt'] },
    });
    return allNotification;
  }
  /**
   * Create a new Notification
   *
   * @param  {CreateNotificationDto} notificationData
   * @returns Promise<Notification>
   * @author Akshay
   */
  public async createNotification(notificationData: CreateNotificationDto,tempNotificationId:string,partyChannelKey:number,tempPartyKey:number,tempMessageKey:number,customerAccountKey:number): Promise<Notification>  {
    if (isEmpty(notificationData)) throw new HttpException(400, 'Notification Data cannot be blank');
    const currentDate = new Date();
    const newNotification = {
      notificationId: tempNotificationId,
      partyChannelKey: partyChannelKey,
      partyKey: tempPartyKey,
      messageKey: tempMessageKey,
      createdBy: customerAccountKey.toLocaleString(),
      updatedBy: customerAccountKey.toLocaleString(),
      createdAt: currentDate,
      updatedAt: currentDate,
      deletedAt: null,
      notificationStatus: null,
      notificationStatutsUpdatedAt: currentDate,
      customerAccountKey: customerAccountKey,
    };
    const createNotificationData: Notification = await this.notificaion.create(newNotification);
    return createNotificationData;
  }

   /**
   * find Notification by Id
   *
   * @param  {string} notificationId
   * @returns Promise<Notification>
   * @author Akshay
   */
    public async findNotificationById(notificationId: string): Promise<Notification> {
      if (isEmpty(notificationId)) throw new HttpException(400, 'Not a valid notificationId');
  
      const findNotification: Notification = await this.notificaion.findOne({
        where: { notificationId, isDeleted: false },
      });
      if (!notificationId) throw new HttpException(409, 'Notification Id Not found');
  
      return findNotification;
    }

  public async updateNotification(notificationId: string,partyChannelKey:number,tempPartyKey:number,customerAccountKey:number,notificationData: UpdateNotificationDto): Promise<Notification> {
    if (isEmpty(UpdateNotificationDto)) throw new HttpException(400, 'Notification Data cannot be blank');
    const findNotification: Notification = await this.notificaion.findOne({ where: { notificationId: notificationId } });
    if (!findNotification) throw new HttpException(409, "Notification doesn't exist");
    const currentDate = new Date();
    const updatedChannelData = {
      ...notificationData,
      notificationId: notificationId,
      partyChannelKey: partyChannelKey,
      partyKey: tempPartyKey,
      updatedBy: customerAccountKey.toLocaleString(),
      updatedAt: currentDate,
      isDeleted: false,
      notificationStatutsUpdatedAt: currentDate,
      customerAccountKey: customerAccountKey,
    };
    await this.notificaion.update(updatedChannelData, { where: { notificationId: notificationId } });

    return this.findNotificationById(notificationId);
  }
    
}

export default NotificationService;