import { NextFunction, Request, Response } from 'express';
import { CreateChannelDto } from '@dtos/channel.dto';
import { Channel } from '@interfaces/channel.interface';
import ChannelService from '@services/channel.service';
import { currentUser } from '@/utils/currentUser';
import { AccessGroupChannel } from '@/interfaces/accessGroupChannel.interface';

class ChannelController {
  public channelService = new ChannelService();

  public getAllChannels = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const findAllChannelsData: Channel[] = await this.channelService.findAllChannel();
      res.status(200).json({ data: findAllChannelsData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getChannelById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const channelId = req.params.id;
      const findOneUserData: Channel = await this.channelService.findChannelById(channelId);
      res.status(200).json({ data: findOneUserData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  public createChannel = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const channelData: CreateChannelDto = req.body;
      const currentUserId = currentUser(req).id;
      const createChannelData: Channel = await this.channelService.createChannel(channelData, currentUserId);
      res.status(201).json({ data: createChannelData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public updateChannel = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const channelId = req.params.id;
      const channelData = req.body;
      const currentUserId = currentUser(req).id;
      const updateChannelData: Channel = await this.channelService.updateChannel(channelId, channelData, currentUserId);
      res.status(200).json({ data: updateChannelData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public deleteChannel = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const channelId = req.params.id;
      const deleteChannelData: Channel = await this.channelService.deleteChannel(channelId);
      res.status(200).json({ data: deleteChannelData, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };

  public getAccessGroupByChannel = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const channelId = req.params.id;
      const currentAcessGroupData: AccessGroupChannel[] = await this.channelService.getAccessGroupByChannels(channelId);
      res.status(200).json({ data: currentAcessGroupData, message: 'Get Access groups of specfic channel' });
    } catch (error) {
      next(error);
    }
  };
}

export default ChannelController;
