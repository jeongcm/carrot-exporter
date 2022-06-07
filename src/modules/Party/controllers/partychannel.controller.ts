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

  public getChannelOfAccessGroup = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const partyId: string = req.params.partyId;

    try {
      const findAllChannelsData: PartyChannel[] = await this.partyChannelService.getChannelOfAccessGroup(partyId);
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
  public addChannelToAccessGroup = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const partyId = req.params.partyId; // <-- use this to get partyKey
      const partyChannelData = req.body;
      const logginedUserId = req.user.partyId;

      const channelKeys: number[] = await this.channelService.findChannelKeysByIds(partyChannelData.channelIds);

      const addedChannelToAccessGroupData: PartyChannel[] = await this.partyChannelService.addChannelToAccessGroup(
        logginedUserId,
        partyId,
        channelKeys,
      );

      res.status(201).json({ data: addedChannelToAccessGroupData, message: 'added' });
    } catch (error) {
      next(error);
    }
  };

  public removeChannelFromAccessGroup = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const partyId = req.params.partyId;
      const partyChannelData = req.body;
      const logginedUserId = req.user.partyId;

      const channelKeys: number[] = await this.channelService.findChannelKeysByIds(partyChannelData.channelIds);

      const removeChannelFromAccessGroupData = await this.partyChannelService.removeChannelFromAccessGroup(logginedUserId, partyId, channelKeys);

      if (removeChannelFromAccessGroupData) {
        res.status(200).json({ message: 'removed' });
      }
    } catch (error) {
      next(error);
    }
  };
}

export default PartyChannelController;
