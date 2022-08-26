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
  public party = DB.Party; 
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
  public async findAllNotification(customerAccountKey: number): Promise<Notification[]> {
    const allNotification: Notification[] = await this.notificaion.findAll({
      where: { customerAccountKey: customerAccountKey, deletedAt: null },
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
  public async createNotification(
    notificationData: CreateNotificationDto,
    partyId: string,
    customerAccountKey: number,
    systemId: string,
  ): Promise<Notification> {
    if (isEmpty(notificationData)) throw new HttpException(400, 'Notification Data cannot be blank');


    const tableIdName: string = 'Notification';
    const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(tableIdName);
    const tempNotificationId: string = responseTableIdData.tableIdFinalIssued;

    const resultParty = await this.party.findOne ({where: {partyId}});
    const partyKey = resultParty.partyKey;

    const currentDate = new Date();
    const newNotification = {
      notificationId: tempNotificationId,
      partyKey: partyKey,
      createdBy: systemId,
      createdAt: currentDate,
      notificationStatutsUpdatedAt: currentDate,
      customerAccountKey,
      ...notificationData,
      }  

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
    partyKey: number,
    customerAccountKey: number,
    notificationData: UpdateNotificationDto,
    systemId: string,
  ): Promise<Notification> {
    if (isEmpty(UpdateNotificationDto)) throw new HttpException(400, 'Notification Data cannot be blank');
    const findNotification: Notification = await this.notificaion.findOne({ where: { notificationId: notificationId } });
    if (!findNotification) throw new HttpException(409, "Notification doesn't exist");

    const currentDate = new Date();
    const updatedChannelData = {
      ...notificationData,
      notificationId: notificationId,
      partyKey: partyKey,
      updatedBy: systemId,
      updatedAt: currentDate,
      notificationStatutsUpdatedAt: currentDate,
      customerAccountKey,
    };
    await this.notificaion.update(updatedChannelData, { where: { notificationId: notificationId } });

    return this.findNotificationById(notificationId);
  }
}

export default NotificationService;
