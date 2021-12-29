import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import InvitationController from '@/controllers/invitation.controller';
import AuthService from '@/services/auth.service';
import validationMiddleware from '@middlewares/validation.middleware';
import { CreateInvitationDto } from '@dtos/invitation.dto';
import authMiddleware from '@middlewares/auth.middleware';

class InvitationRoute implements Routes {
  public router = Router();
  public invitationController = new InvitationController();
  public authservice = new AuthService();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/invite/email',authMiddleware, this.invitationController.checkForDuplicateInvitation);
    this.router.get('/invite/accept', this.invitationController.acceptInvitation);
    this.router.get('/invite/reject', this.invitationController.rejectInvitation);
    this.router.post('/invite/email', authMiddleware, validationMiddleware(CreateInvitationDto, 'body'), this.invitationController.createInvitation);
    this.router.put('/invite/email',authMiddleware, this.invitationController.updateInvitation);
  }
}

export default InvitationRoute;
