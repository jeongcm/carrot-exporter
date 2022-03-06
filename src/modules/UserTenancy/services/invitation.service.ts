import DB from '@/database';
import { HttpException } from '@/common/exceptions/HttpException';
import { isEmpty } from '@/common/utils/util';
import { CreateInvitationDto } from '@/modules/UserTenancy/dtos/invitation.dto';
import { Invitation } from '@/common/interfaces/invitation.interface';
import config from 'config';

// RYAN: please keep it in our convention using import
const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

const auth = {
  api_key: config.email.mailgun.apiKey,
  domain: config.email.mailgun.domain,
};

class InvitationService {
  public invitations = DB.Invitations;

  public async getInvitationByEmail(email): Promise<Invitation> {
    const invitationDetail: Invitation = await this.invitations.findOne({ where: { invitedTo: email } });
    return invitationDetail;
  }

  public sendInvitationMail = (req, res) => {
    try {
      const emailTemplateSource = req.body.newUser
        ? fs.readFileSync(path.join(__dirname, '../templates/emails/email-body/newUserEmail.hbs'), 'utf8')
        : fs.readFileSync(path.join(__dirname, '../templates/emails/email-body/tenancyMail.hbs'), 'utf8');
      const mailgunAuth = { auth };
      const smtpTransport = nodemailer.createTransport(mg(mailgunAuth));
      const template = handlebars.compile(emailTemplateSource);
      const { email, username, subject, from, newUser, newInvitation } = req.body;
      let token = req.cookies['X-AUTHORIZATION'] || req.header('x-authorization').split('Bearer ')[1];
      const host = req.get('host');
      let newuserLink, acceptLink, rejectLink, htmlToSend;
      if (newUser) {
        newuserLink = `http://${host}/login`;
        htmlToSend = template({ newuserLink });
      } else {
        acceptLink = `http://${host}/invite/accept?token=${token}`;
        rejectLink = `http://${host}/invite/reject?token=${token}`;
        htmlToSend = template({ acceptLink, rejectLink, username });
      }

      const mailOptions = {
        from: from || config.email.defaultFrom,
        to: email,
        subject: subject || 'Email Verification from Nexclipper',
        html: htmlToSend,
      };
      smtpTransport.sendMail(mailOptions, function (error, response) {
        if (error && Object.keys(error).length) {
          return res.status(400).json({ message: 'Error while sending mail' });
        } else {
          return res.status(200).json({ message: 'Successfully sent email.' });
        }
      });
    } catch (err) {
      return res.status(400).json({ message: 'Error while sending mail' });
    }
  };

  public async createInvitation(invitationData: CreateInvitationDto): Promise<Invitation> {
    if (isEmpty(invitationData)) throw new HttpException(400, 'Invitation must not be empty');

    const newInvitationData: Invitation = await this.invitations.create(invitationData);
    return newInvitationData;
  }
  public async updateInvitation(id, updatingData): Promise<Invitation> {
    const findInvitation: Invitation = await this.invitations.findByPk(id);
    if (!findInvitation) throw new HttpException(409, "Invitation doesn't exist");
    await this.invitations.update({ ...updatingData }, { where: { id } });
    const updatedInvitation: Invitation = await this.invitations.findByPk(id);
    return updatedInvitation;
  }

  public async checkForToken(token): Promise<Invitation> {
    try {
      const findInvitation: Invitation = await this.invitations.findOne({ where: { token } });
      return findInvitation;
    } catch (err) {
      throw err;
    }
  }
}

export default InvitationService;
