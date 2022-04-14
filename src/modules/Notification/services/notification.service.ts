import { Notification } from '@/common/interfaces/notification.interface';
import DB from '@/database';
import { CreateNotificationDto, UpdateNotificationDto } from '../dtos/notification.dto';
import { isEmpty } from '@/common/utils/util';
import { HttpException } from '@/common/exceptions/HttpException';
import { NotificationStatus } from '@/common/types';
import CustomerAccountService from '@/modules/CustomerAccount/services/customerAccount.service';
import TableIdService from '@/modules/CommonService/services/tableId.service';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
import PartyChannelService from '@/modules/Party/services/partychannel.service';
import MessageServices from '@/modules/Messaging/services/message.service';
import { IMessage } from '@/common/interfaces/message.interface';
class NotificationService {
  public notificaion = DB.Notification;
  public customerAccountService = new CustomerAccountService();
  public tableIdService = new TableIdService();
  public partyChannelService = new PartyChannelService();
  public messageServices = new MessageServices();
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
  public async createNotification(notificationData: CreateNotificationDto, tempPartyKey: number, customerAccountKey: number,partyId: string): Promise<Notification> {
    if (isEmpty(notificationData)) throw new HttpException(400, 'Notification Data cannot be blank');

    const messageData: IMessage = await this.messageServices.findMessage(notificationData.messageId);
    const tempMessageKey: number = messageData.messageKey;

    const partyChannelKey: number = await this.partyChannelService.getPartyChannelKey(tempPartyKey);

    const tableIdName: string = 'Notification';
    const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(tableIdName);
    const tempNotificationId: string = responseTableIdData.tableIdFinalIssued;

    const customerAccountId = await this.customerAccountService.getCustomerAccountIdByKey(customerAccountKey);
    const currentDate = new Date();
    const newNotification = {
      notificationId: tempNotificationId,
      partyChannelKey: partyChannelKey,
      partyKey: tempPartyKey,
      messageKey: tempMessageKey,
      createdBy: partyId,
      createdAt: currentDate,
      updatedAt: currentDate,
      notificationStatutsUpdatedAt: currentDate,
      customerAccountKey,
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
      where: { notificationId, deletedAt: null },
    });
    if (!notificationId) throw new HttpException(409, 'Notification Id Not found');

    return findNotification;
  }

  public async updateNotification(
    notificationId: string,
    tempPartyKey: number,
    customerAccountKey: number,
    notificationData: UpdateNotificationDto,
    partyId: string
  ): Promise<Notification> {
    if (isEmpty(UpdateNotificationDto)) throw new HttpException(400, 'Notification Data cannot be blank');
    const findNotification: Notification = await this.notificaion.findOne({ where: { notificationId: notificationId } });
    if (!findNotification) throw new HttpException(409, "Notification doesn't exist");

    const messageData: IMessage = await this.messageServices.findMessage(notificationData.messageId);
    const tempMessageKey: number = messageData.messageKey;
    if (!tempMessageKey){
      throw new HttpException(409, 'MessageKey Not Found');
    }
    const partyChannelKey: number = await this.partyChannelService.getPartyChannelKey(tempPartyKey);
    const currentDate = new Date();
    const updatedChannelData = {
      ...notificationData,
      notificationId: notificationId,
      partyChannelKey: partyChannelKey,
      partyKey: tempPartyKey,
      updatedBy: partyId,
      updatedAt: currentDate,
      isDeleted: false,
      notificationStatutsUpdatedAt: currentDate,
      customerAccountKey,
    };
    await this.notificaion.update(updatedChannelData, { where: { notificationId: notificationId } });

    return this.findNotificationById(notificationId);
  }
}

export default NotificationService;
