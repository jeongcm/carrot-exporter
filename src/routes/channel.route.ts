import { Router } from 'express';
import ChannelController from '@controllers/channel.controller';
import { CreateChannelDto } from '@dtos/channel.dto';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import AuthService from '@services/auth.service';

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
      this.authservice.authenticate,
      validationMiddleware(CreateChannelDto, 'body'),
      this.channelController.createChannel,
    );
    this.router.get('/channels', this.authservice.authenticate, this.channelController.getAllChannels);
    this.router.get('/channels/:id', this.authservice.authenticate, this.channelController.getChannelById);
    this.router.delete('/channels/:id', this.authservice.authenticate, this.channelController.deleteChannel);
    this.router.put('/channels/:id', this.authservice.authenticate, this.channelController.updateChannel);
  }
}

export default UsersRoute;
