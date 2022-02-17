import { NextFunction, Request, Response } from 'express';
import { Invitation } from '@/interfaces/invitation.interface';
import InvitationService from '@/services/invitation.service';
import TenancyService from '@/services/tenancy.service';
import MailService from '@/services/sendMail.service';
import UsersService from '@/services/users.service';
import { User } from '@/interfaces/users.interface';


class InvitationController {
  public invitationService = new InvitationService();
  public tenancyService = new TenancyService();
  public usersService = new UsersService();
  public mailService = new MailService();

  public checkForDuplicateInvitation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {email} = req.query;
      const findInvitationData: Invitation = await this.invitationService.getInvitationByEmail(email);
      if( !findInvitationData && !Object.keys(findInvitationData).length){
        return res.status(200).json({ message: `Invitation for  ${email} mail, doesn't exist`});
      }else{
        return res.status(200).json({ message: "Invitation existed"});
      }
    } catch (error) {
      return  res.status(400).json({message:"Error while checking for invitation", error})
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
      req.body['from'] = process.env.NX_NODE_FROM_MAIL||'jaswant.singh@exubers.com';
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
    return  res.status(400).json({message:"Error while sending invitation", error:err});
    }
  };

  public updateInvitation = async (req: Request, res: Response, next: NextFunction) => {
    try{
      const { email } = req.body;
      const isEmailExist = await this.invitationService.getInvitationByEmail(email);
      if (!isEmailExist) {
        return res.status(200).json({
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
    }catch(err){
      res.status(400).json({message:"Error while updating invitation", error:err})
    }
  };

  public acceptInvitation = async (req: Request, res: Response, next: NextFunction) => {
    try{
      const { token } = req.query;
      const invitationData = await this.invitationService.checkForToken(token);
      if (!invitationData) {
        return res.status(200).json({ message: 'TOKEN_IS_INVALID' });
      }else if(invitationData.isRejected){
        return res.status(200).json({ message: 'REQUEST_IS_ALEARDY_REJECTED' });
      }else{

        await this.invitationService.updateInvitation(invitationData.id, { isActive: false, isAccepted: true, acceptedAt: new Date() });
        await this.tenancyService.updateTenancyMemberDetail(invitationData.tenancyId, { invitedBy: invitationData.invitedTo });
        return res.status(200).json({ message: 'VERIFICATION_DONE_SUCCESSFULLY' });
      }
    }catch(error){
      return  res.status(400).json({message:"Error while accepting  invitation", error})
    }
  };
  
  public rejectInvitation = async (req: Request, res: Response, next: NextFunction) => {
    try{
      const { token } = req.query;
      const invitationData = await this.invitationService.checkForToken(token);
      if (!invitationData) {
        return res.status(200).json({ message: 'TOKEN_IS_INVALID' });
      }else if(invitationData.isAccepted){
        return res.status(400).json({ message: 'REQUEST_IS_ALEARDY_ACCEPTED' });
      }else{
        await this.invitationService.updateInvitation(invitationData.id, { isActive: false, isRejected: true, rejectedAt: new Date() });
        return res.status(200).json({ message: 'REJECT_IS_REJECTED_SUCCESSFULLY' });
      }
    }catch(error){
        return  res.status(400).json({message:"Error while rejecting invitation", error})
      
    }
    }
}

export default InvitationController;
