import DB from '@/database';
import { HttpException } from '@/common/exceptions/HttpException';
import { isEmpty } from '@/common/utils/util';
import tableIdService from '@/modules/CommonService/services/tableId.service';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
import { IMessage } from '@/common/interfaces/message.interface';
import { CreateMessageDto } from '../dtos/message.dto';

class MessageServices {
  public messages = DB.Messages;
  public tableIdService = new tableIdService();


  /**
   * @function {findMessages} find the all messages
   * @returns  array of messages
   * @author shrishti
   */
  public async findMessages(): Promise<IMessage[]> {
    const catalogPlans: IMessage[] = await this.messages.findAll({ where: { isDeleted: null } });
    return catalogPlans;
  }

  /**
   * @function {createMessage} create new message
   * @param {object} new message data 
   * @returns {object} new message created
   * @author shrishti
   */
  public async createMessage(data:CreateMessageDto): Promise<IMessage> {
    const messageId = await  this.getTableId('message');
    data = {...data, messageId}
    const newCatalogPlan: IMessage = await this.messages.create(data);
    return newCatalogPlan;
  }


  /**
   * {findMessage} find the catalog plan by its catalogPlanId
   * @param {string} id 
   * @returns {object} catalog plan object
   */

  public async findMessage(id: string): Promise<IMessage> {
    if (isEmpty(id)) throw new HttpException(400, 'Not a valid MessageId');
    const findMessageData: IMessage = await this.messages.findOne({
      where: {
        messageId: id,
        isDeleted: null,
      }
    });
    if (!findMessageData) throw new HttpException(409, 'Message Not found');
    return findMessageData;
  }


  /**
   * @function  {updateMessageById} update Message Data using id
   * @param  {string} messageId
   * @param  {number} currentUserPk
   * @returns Promise<messages>
   */
  public async updateMessageById(messageId: string, messageData: CreateMessageDto, currentUserPk: number): Promise<IMessage> {
    if (isEmpty(messageData)) throw new HttpException(400, 'Access Group Data cannot be blank');

    const findMessageData: IMessage = await this.messages.findOne({ where: { messageId } });

    if (!findMessageData) throw new HttpException(409, "Access Group doesn't exist");
    const updatedMessageData = {
      ...messageData,
      updatedBy: 'SYSTEM',
      updatedAt: new Date(),
    };

    await this.messages.update(updatedMessageData, { where: { messageId } });

    const updateData: IMessage = await this.messages.findByPk(findMessageData.messageKey);

    return updateData;
  }

  public  getTableId  = async (tableIdTableName:string)=>{
    const tableId = await this.tableIdService.getTableIdByTableName(tableIdTableName);

    if (!tableId) {
      return;
    }
    const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(tableIdTableName);
    return responseTableIdData.tableIdFinalIssued;
}
}
export default MessageServices;
