import { Router } from 'express';
import ChannelController from '@controllers/channel.controller';
import { CreateChannelDto } from '@dtos/channel.dto';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import AuthService from '@services/auth.service';
import authMiddleware from '@middlewares/auth.middleware';


class UsersRoute implements Routes {
  public router = Router();
  public channelController = new ChannelController();
  public authservice = new AuthService();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // this.router.get('/channels', this.channelController.getUserChannels);
    this.router.post(
      '/channels',
      authMiddleware,
      validationMiddleware(CreateChannelDto, 'body'),
      this.channelController.createChannel,
    );
    this.router.get('/channels', authMiddleware, this.channelController.getAllChannels);
    this.router.get('/channels/:id', authMiddleware, this.channelController.getChannelById);
    this.router.delete('/channels/:id', authMiddleware, this.channelController.deleteChannel);
    this.router.put('/channels/:id', authMiddleware, this.channelController.updateChannel);
  }
}

export default UsersRoute;
