import { Channel } from '@/common/interfaces/channel.interface';
import { IRequestWithUser, PartyChannel } from '@/common/interfaces/party.interface';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
import TableIdService from '@/modules/CommonService/services/tableId.service';
import ChannelService from '@/modules/Messaging/services/channel.service';
import { NextFunction, Response } from 'express';
import PartyChannelService from '../services/partychannel.service';

class PartyChannelController {
  public partyChannelService = new PartyChannelService();
  public channelService = new ChannelService();
  public tableIdService = new TableIdService();

  public getPartyChannel = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const findAllChannelsData: PartyChannel[] = await this.partyChannelService.findAllChannel();
      res.status(200).json({ data: findAllChannelsData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };
  /**
   * @param  {IRequestWithUser} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */
  public createPartyChannel = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const partyId = req.params.partyId; // <-- use this to get partyKey
      const partyKey: number = req.user.partyKey;

      const customerAccountKey: number = req.customerAccountKey;
      const partyChannelData = req.body;
      // based on channelId fetch channelKey
      const channelKeys: number[] = await this.channelService.findChannelKeyById(partyChannelData.channelIds);

      // --------------
      const channelKey: number = channelData.channelKey;
      const tableIdName = 'PartyChannel';
      const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(tableIdName);
      const tempPartyChannelId: string = responseTableIdData.tableIdFinalIssued;
      const createPartyChannelData: PartyChannel = await this.partyChannelService.createPartyChannel(
        partyKey,
        channelKey,
        tempPartyChannelId,
        customerAccountKey,
      );
      res.status(201).json({ data: createPartyChannelData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };
}

export default PartyChannelController;
