import { Router } from 'express';
import ChannelController from '@controllers/channel.controller';
import { CreateChannelDto } from '@dtos/channel.dto';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import AuthService from '@services/auth.service';

class UsersRoute implements Routes {
  public path = '/users/channels';
  public router = Router();
  public channelController = new ChannelController();
  public authservice = new AuthService();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // this.router.get(`${this.path}`, this.channelController.getUserChannels);
    this.router.post(
      `${this.path}`,
      this.authservice.authenticate,
      validationMiddleware(CreateChannelDto, 'body'),
      this.channelController.createChannel,
    );
    this.router.get(`${this.path}`, this.authservice.authenticate, this.channelController.getAllChannels);
    this.router.get(`${this.path}/:id`, this.authservice.authenticate, this.channelController.getChannelById);
    this.router.delete(`${this.path}/:id`, this.authservice.authenticate, this.channelController.deleteChannel);
    this.router.put(`${this.path}/:id`, this.authservice.authenticate, this.channelController.updateChannel);
  }
}

export default UsersRoute;
