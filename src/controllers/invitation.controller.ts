import { NextFunction, Request, Response } from 'express';
import { Invitation } from '@/interfaces/invitation.interface';
import InvitationService from '@/services/invitation.service';
import TenancyService from '@/services/tenancy.service';
import MailService from '@/services/sendMail.service';
import UsersService from '@/services/users.service';
import { User } from '@/interfaces/users.interface';
import { isEmail } from 'class-validator';

class InvitationController {
  public invitationService = new InvitationService();
  public tenancyService = new TenancyService();
  public usersService = new UsersService();
  public mailService = new MailService();

  public checkForDuplicateInvitation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {email} = req.query;
      const findInvitationData: Invitation = await this.invitationService.getInvitationByEmail(email);
      if( findInvitationData &&Object.keys(findInvitationData).length){
        return res.status(200).json({ message: `Invitation for  ${email} mail, doesn't exist`});
      }else{
        return res.status(200).json({ message: "Invitation existed"});
      }
    } catch (error) {
      next(error);
    }
  };

  public createInvitation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tenancyId, invitedTo } = req.body;
      const userDetail: User = await this.usersService.findUserByEmail(invitedTo);
      if (userDetail.currentTenancyId && userDetail.currentTenancyId === tenancyId) {
        return res.status(200).json({ ok: false, message: 'USER_ALREADY_IN_TENANCY' });
      }
      const invitationDetail: Invitation = await this.invitationService.getInvitationByEmail(invitedTo);
      if (invitationDetail && invitationDetail.isAccepted) {
        return res.status(200).json({ ok: false, message: 'USER_ALREADY_INVITED' });
      }
      let newInvitation = await this.invitationService.createInvitation(req.body);
      req.body['from'] = 'jaswant.singh@exubers.com';
      req.body['email'] = req.body.invitedTo;
      req.body['newInvitation'] = newInvitation;
      if (!userDetail) {
        req.body['subject'] = 'Testing for new user';
        req.body['newUser'] = true;
        await this.invitationService.sendInvitationMail(req, res);
      }
      req.body['subject'] = 'Testing to verify email';
      req.body['newUser'] = false;
      return await this.invitationService.sendInvitationMail(req, res);
     
    } catch (err) {
      console.log("err", err)
    }
  };

  public updateInvitation = async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    const isEmailExist = await this.invitationService.getInvitationByEmail(email);
    if (!isEmailExist) {
      return res.send(200).json({
        ok: false,
        msg: 'NO_ACTIVE_INVITATION_FOR_THIS_EMAIL',
      });
    }
    req.body['from'] = 'jaswant.singh@exubers.com';
    req.body['email'] = email;
    req.body['newInvitation'] = isEmailExist
    req.body['subject'] = 'Testing to verify email';
    req.body['newUser'] = false;
    return await this.invitationService.sendInvitationMail(req, res);
  };

  public acceptInvitation = async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.query;

    console.log(token)
    const invitationData = await this.invitationService.checkForToken(token);
    console.log("invitationData", invitationData)
    if (!invitationData) {
      return res.send(200).json({ message: 'Token is invalid' });
    }
    if(invitationData.isRejected){
      return res.send(200).json({ message: 'Request has been already rejected' });
    }
    await this.invitationService.updateInvitation(invitationData.id, { isActive: false, isAccepted: true, acceptedAt: new Date() });
    await this.tenancyService.updateTenancyMemberDetail(invitationData.tenancyId, { invitedBy: invitationData.invitedTo });
    // return res.send(200).json({ message: 'verification done successfully' });
  };
  
  public rejectInvitation = async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.query;
    const invitationData = await this.invitationService.checkForToken(token);
    console.log("invitationData", invitationData)
    if (!invitationData) {
      console.log("in iffff")
      return res.sendStatus(200).json({ message: 'Token is invalid' });
    }else if(invitationData.isAccepted){
      console.log("in leseeee")
      return res.sendStatus(400).json({ message: 'Request has been already accepted' });
    }else{
      console.log("in leseeee2222")
      await this.invitationService.updateInvitation(invitationData.id, { isActive: false, isRejected: true, rejectedAt: new Date() });
      return res.sendStatus(200).json({ message: 'Request has been rejected successfully' });
    }
  };
}

export default InvitationController;
