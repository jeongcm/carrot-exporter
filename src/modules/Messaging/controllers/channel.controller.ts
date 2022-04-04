import { NextFunction, Response } from 'express';
import { CreateChannelDto } from '@/modules/Messaging/dtos/channel.dto';
import { Channel } from '@/common/interfaces/channel.interface';
import ChannelService from '@/modules/Messaging/services/channel.service';
import { AccessGroupChannel } from '@/common/interfaces/accessGroupChannel.interface';
import { RequestWithUser } from '@/common/interfaces/auth.interface';
import tableIdService from '@/modules/CommonService/services/tableId.service';
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

  public createChannel = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const tableIdName: string = "Channel";
      const tableId = await this.tableIdService.getTableIdByTableName(tableIdName);
      const tempChannelId: string = tableId.tableIdFinalIssued;
      const channelData: CreateChannelDto = req.body;
      const currentUserPk = req.user.pk;
      const createChannelData: Channel = await this.channelService.createChannel(channelData, currentUserPk, tempChannelId);
      res.status(201).json({ data: createChannelData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public updateChannel = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const channelId = req.params.channelId;
      const channelData = req.body;
      const currentUserPk = req.user.pk;
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
