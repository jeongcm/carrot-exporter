import { Router } from 'express';
import { Routes } from '@/common/interfaces/routes.interface';
import validationMiddleware from '@/common/middlewares/validation.middleware';
import authMiddleware from '@/modules/ApiGateway/middlewares/auth.middleware';
import { InvitationDto, UpdateInvitation } from '../dtos/invitation.dto';
import InvitationController from '@/modules/Party/controllers/invitation.controller';

class InvitationRoute implements Routes {
  public router = Router();
  public invitationController = new InvitationController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/invitation/email', authMiddleware, validationMiddleware(InvitationDto, 'body'), this.invitationController.createInvitation);
    this.router.get('/invitation/accept', this.invitationController.acceptInvitation);
    this.router.get('/invitation/reject', this.invitationController.rejectInvitation);
    this.router.put('/invitation/email', authMiddleware, validationMiddleware(UpdateInvitation, 'body'), this.invitationController.updateInvitation);
    this.router.get('/invitation/email',authMiddleware, this.invitationController.checkForDuplicateInvitation);
  }
}

export default InvitationRoute;
