import { NextFunction, Response } from 'express';
import { IAcceptInvitation, IInvitation, IRejectInvitation } from '@/common/interfaces/invitation.interface';
import { InvitationDto } from '../dtos/invitation.dto';
import { IRequestWithUser } from '@/common/interfaces/party.interface';
import PartyService from '../services/party.service';
import config from '@config/index';
import InvitationService from '@/modules/Party/services/invitation.service';
import TableIdService from '@/modules/CommonService/services/tableId.service';
import MessageServices from '@/modules/Messaging/services/message.service';
import { logger } from '@/common/utils/logger';

class InvitationController {
  public invitationService = new InvitationService();
  public partyService = new PartyService();
  public tableIdService = new TableIdService();
  public messageServices = new MessageServices();

  public createInvitation = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const {
        user: { partyId, partyKey },
        customerAccountKey,
        body,
      } = req;
      const invitationData: InvitationDto = body;

      const invitationDetail: IInvitation = await this.invitationService.getInvitationByEmail(invitationData.invitedTo);
      if (invitationDetail !== null && invitationDetail.isAccepted) {
        return res.status(200).json({ data: 'ok', message: 'PartyUser already invited' });
      }
      const invitedByPartyKey: number = partyKey;

      const email: string = await this.partyService.getEmailFromPartyUser(invitedByPartyKey);
      if (!email) {
        return res.status(200).json({ data: 'ok', message: 'Party user Not Exists' });
      } else if (email === invitationData.invitedTo) {
        const token = req.cookies['X-AUTHORIZATION'] || req.header('x-authorization').split('Bearer ')[1];
        const newInvitation = await this.invitationService.createInvitation(
          req,
          customerAccountKey,
          invitedByPartyKey,
          token,
          partyId,
          invitationData,
        );
        logger.info(`Logged invitation data: ${newInvitation}`);
        return await this.invitationService.sendInvitationMail(req, res);
      } else {
        return res.status(200).json({ data: 'ok', message: 'Not a Valid Email Id of existing party User' });
      }
    } catch (err) {
      next(err);
    }
  };

  public acceptInvitation = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const { token } = req.query;

      const invitationData = await this.invitationService.checkForToken(token);
      if (!invitationData) {
        return res.status(200).json({ message: 'TOKEN_IS_INVALID' });
      } else if (invitationData.isRejected) {
        return res.status(200).json({ message: 'REQUEST_IS_ALEARDY_REJECTED' });
      } else {
        const acceptInvitation: IAcceptInvitation = {
          isActive: false,
          isAccepted: true,
          acceptedAt: new Date(),
        };
        const partyId = req.params.partyId;
        const { invitationId } = invitationData;
        await this.invitationService.updateInvitation(invitationId, acceptInvitation, partyId);

        return res.status(200).json({ message: 'VERIFICATION_DONE_SUCCESSFULLY' });
      }
    } catch (error) {
      return res.status(400).json({ message: 'Error while accepting  invitation', error });
    }
  };

  public rejectInvitation = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const { token } = req.query;
      const invitationData = await this.invitationService.checkForToken(token);
      if (!invitationData) {
        return res.status(200).json({ message: 'TOKEN_IS_INVALID' });
      } else if (invitationData.isAccepted) {
        return res.status(400).json({ message: 'REQUEST_IS_ALEARDY_ACCEPTED' });
      } else {
        const rejectInvitation: IRejectInvitation = {
          isActive: false,
          isRejected: true,
          rejectedAt: new Date(),
        };
        const partyId = req.params.partyId;
        await this.invitationService.updateInvitation(invitationData.invitationId, rejectInvitation, partyId);
        return res.status(200).json({ message: 'REQUEST_IS_REJECTED_SUCCESSFULLY' });
      }
    } catch (error) {
      return res.status(400).json({ message: 'Error while rejecting invitation', error });
    }
  };

  public updateInvitation = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      const isEmailExist: IInvitation = await this.invitationService.getInvitationByEmail(email);
      if (!isEmailExist) {
        return res.status(200).json({
          ok: false,
          msg: 'NO_ACTIVE_INVITATION_FOR_THIS_EMAIL',
        });
      }
      req.body['from'] = config.email.defaultFrom;
      req.body['email'] = email;
      req.body['newInvitation'] = isEmailExist;
      req.body['subject'] = 'Invitation Update Email';
      req.body['newUser'] = false;
      return this.invitationService.sendInvitationMail(req, res);
    } catch (err) {
      res.status(400).json({ message: 'Error while updating invitation', error: err });
    }
  };

  public checkForDuplicateInvitation = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const { email } = req.query;

      const findInvitationData: IInvitation = await this.invitationService.getInvitationByEmail(email);
      if (!findInvitationData) {
        return res.status(200).json({ message: `Invitation for  ${email} mail, doesn't exist` });
      } else {
        return res.status(200).json({ message: 'Invitation existed' });
      }
    } catch (error) {
      return res.status(400).json({ message: 'Error while checking for invitation', error });
    }
  };
}

export default InvitationController;
