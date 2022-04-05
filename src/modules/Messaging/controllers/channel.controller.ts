import { RequestWithUser } from '@/common/interfaces/auth.interface';
import { Channel } from '@/common/interfaces/channel.interface';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
import tableIdService from '@/modules/CommonService/services/tableId.service';
import { CreateChannelDto } from '@/modules/Messaging/dtos/channel.dto';
import ChannelService from '@/modules/Messaging/services/channel.service';
import { NextFunction, Response } from 'express';
import { IRequestWithUser } from '@/common/interfaces/party.interface';
class ChannelController {
  public channelService = new ChannelService();
  public tableIdService = new tableIdService();

  public getAllChannels = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const findAllChannelsData: Channel[] = await this.channelService.findAllChannel();
      res.status(200).json({ data: findAllChannelsData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getChannelById = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const channelId = req.params.channelId;
      const findOneUserData: Channel = await this.channelService.findChannelById(channelId);
      res.status(200).json({ data: findOneUserData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  public createChannel = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const customerAccountKey = req.customerAccountKey;
      const tableIdName: string = "Channel";
      const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(tableIdName);
      const tempChannelId: string = responseTableIdData.tableIdFinalIssued;
      const channelData: CreateChannelDto = req.body;
      const createChannelData: Channel = await this.channelService.createChannel(channelData, customerAccountKey, tempChannelId);
      res.status(201).json({ data: createChannelData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public updateChannel = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const channelId = req.params.channelId;
      const channelData = req.body;
      const currentUserPk = req.customerAccountKey;
      const updateChannelData: Channel = await this.channelService.updateChannel(channelId, channelData, currentUserPk);
      res.status(200).json({ data: updateChannelData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public deleteChannel = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const channelId = req.params.id;
      const deleteChannelData: Channel = await this.channelService.deleteChannel(channelId);
      res.status(200).json({ data: deleteChannelData, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };
}

export default ChannelController;
