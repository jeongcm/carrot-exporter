import DB from '@/database';
import { IAcceptInvitation, IInvitation, IRejectInvitation } from '@/common/interfaces/invitation.interface';
import { InvitationDto } from '../dtos/invitation.dto';
import { HttpException } from '@/common/exceptions/HttpException';
import { isEmpty } from '@/common/utils/util';
import tableIdService from '@/modules/CommonService/services/tableId.service';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';

import config from '@config/index';
const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
import { Request, Response } from 'express';
import { IMessage } from '@/common/interfaces/message.interface';
import MessageServices from '@/modules/Messaging/services/message.service';

const auth = {
  api_key: config.email.mailgun.apiKey,
  domain: config.email.mailgun.domain,
};

class InvitationService {
  public invitations = DB.Invitation;
  public tableIdService = new tableIdService();
  public messageServices = new MessageServices();

  public async getInvitationByEmail(email): Promise<IInvitation> {
    const invitationDetail: IInvitation = await this.invitations.findOne({ where: { invitedTo: email } });
    return invitationDetail;
  }

  public async sendInvitationMail(req: Request, res: Response) {
    try {
      const emailTemplateSource = req.body.newUser
        ? fs.readFileSync(path.join(__dirname, '../../Messaging/templates/emails/email-body/newUserEmail.hbs'), 'utf8')
        : fs.readFileSync(path.join(__dirname, '../../Messaging/templates/emails/email-body/tenancyMail.hbs'), 'utf8');
      const mailgunAuth = { auth };
      const smtpTransport = nodemailer.createTransport(mg(mailgunAuth));
      const template = handlebars.compile(emailTemplateSource);
      const { email, subject, from, invitationMessage } = req.body;
      let token = req.cookies['X-AUTHORIZATION'] || req.header('x-authorization').split('Bearer ')[1];
      const host = req.get('host');
      let acceptLink, rejectLink, htmlToSend;

      acceptLink = `http://${host}/invitation/accept?token=${token}`;
      rejectLink = `http://${host}/invitation/reject?token=${token}`;
      htmlToSend = template({ acceptLink, rejectLink, invitationMessage });

      const mailOptions = {
        from: from || config.email.defaultFrom,
        to: email,
        subject: subject || 'Email Verification from Nexclipper',
        html: htmlToSend,
      };
      smtpTransport.sendMail(mailOptions, function (error, response) {
        if (error && Object.keys(error).length) {
          return res.status(400).json({ message: error });
        } else {
          return res.status(200).json({ message: 'Successfully Invitation Sent' });
        }
      });
    } catch (err) {
      return res.status(400).json({ message: err });
    }
  };

  public async createInvitation(
    req: Request,
    customerAccountKey: number,
    invitedByPartyKey: number,
    token: string,
    partyId: string,
    invitationData: InvitationDto,
  ): Promise<IInvitation> {
    if (isEmpty(invitationData)) throw new HttpException(400, 'Invitation Data cannot be blank');

    // get Message key form message table based on messageId
    const messageData: IMessage = await this.messageServices.findMessage(invitationData.messageId);
    const messageKey: number = messageData.messageKey;
    const messageVerbiage: string = messageData.messageVerbiage;

    const tableIdName: string = 'Invitation';
    const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(tableIdName);
    const tempInvitationId: string = responseTableIdData.tableIdFinalIssued;
    try {
      const currentDate = new Date();
      const newInvitation = {
        invitationId: tempInvitationId,
        customerAccountKey,
        messageKey: messageKey,
        createdBy: partyId,
        updatedBy: null,
        createdAt: currentDate,
        invitedByPartyKey,
        isActive: true,
        isAccepted: false,
        isRejected: false,
        token,
        ...invitationData,
      };
      const createInvitation: IInvitation = await this.invitations.create(newInvitation);

      // decorate mail Request here 
      invitationData['from'] = config.email.invitation.from;
      invitationData['email'] = invitationData.invitedTo;
      invitationData['invitationMessage'] = messageVerbiage + '\n' + invitationData.customMsg;
      invitationData['subject'] = 'Invitation for Party User with Party Key ' + invitedByPartyKey.toLocaleString();

      return createInvitation;
    } catch (error) {}
  }

  public async checkForToken(token): Promise<IInvitation> {
    try {
      const findInvitation: IInvitation = await this.invitations.findOne({ where: { token } });
      return findInvitation;
    } catch (err) {
      throw err;
    }
  }

  public async updateInvitation(
    invitationId: string,
    updatingData: IAcceptInvitation | IRejectInvitation,
    partyId: string,
  ): Promise<IInvitation> {
    if (isEmpty(updatingData)) throw new HttpException(400, 'Invitation  must not be empty');

    const findInvitation: IInvitation = await this.invitations.findOne({ where: { invitationId: invitationId } });

    if (!findInvitation) throw new HttpException(409, "Invitation  doesn't exist");

    const updatedInvitation = {
      ...updatingData,
      updatedBy: partyId,
    };

    await this.invitations.update(updatedInvitation, { where: { invitationId: invitationId } });

    const updateInvitation: IInvitation = await this.invitations.findOne({ where: { invitationId: invitationId } });
    return updateInvitation;
  }
}

export default InvitationService;
