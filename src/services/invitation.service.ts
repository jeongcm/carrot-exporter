import DB from 'databases';
import { Log } from '@/interfaces/log.interface';
import { HttpException } from '@exceptions/HttpException';
import { isEmpty } from '@utils/util';
import { CreateInvitationDto } from '@dtos/invitation.dto';
import { Invitation } from '@/interfaces/invitation.interface';
import { where } from 'sequelize/types';
const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class InvitationService {
  public invitations = DB.Invitations;

  public async getInvitationByEmail(email): Promise<Invitation> {
    const invitationDetail: Invitation = await this.invitations.findOne({ where: { invitedTo: email } });
    return invitationDetail;
  }

  public sendInvitationMail = (req, res) => {
    try{

      const emailTemplateSource = req.body.newUser
        ? fs.readFileSync(path.join(__dirname, '../templates/newUserEmail.hbs'), 'utf8')
        : fs.readFileSync(path.join(__dirname, '../templates/tenancyMail.hbs'), 'utf8');
      const mailgunAuth = {
        auth: {
          api_key: 'afc38a0b3a279b1c3da684fcaf5b6ede-7fba8a4e-6df6e2b9',
          domain: 'sandboxf34105cd97c4421d8286857b8c3be8bb.mailgun.org',
        },
      };
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
        from: from || 'jaswant.singh@exubers.com',
        to: email,
        subject: subject || 'Email Verification from Exubers',
        html: htmlToSend,
      };
  console.log("mailOptions", mailOptions)
      smtpTransport.sendMail(mailOptions, function (error, response) {
        if (error && Object.keys(error).length) {
          return res.status(400).json({ mesaage: 'Error while sending mail' });
        } else {
          return res.status(200).json({ mesaage: 'Successfully sent email.' });
        }
      });
    }catch(err){
      console.log(err)
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

  // public async updateLog(logId: string, logData: CreateLogDto, currentUserId: string): Promise<Log> {
  //   if (isEmpty(logData)) throw new HttpException(400, 'Log Data cannot be blank');
  //   const findLog: Log = await this.log.findByPk(logId);
  //   if (!findLog) throw new HttpException(409, "Log doesn't exist");
  //   const updatedLogData = {
  //     ...logData,
  //     updatedBy: currentUserId,
  //     updatedAt: new Date(),
  //   };
  //   await this.log.update(updatedLogData, { where: { id: logId } });
  //   const updateUser: Log = await this.log.findByPk(logId);
  //   return updateUser;
  // }

  // public async deleteLogById(id: number): Promise<void> {
  //   const log: void = await this.log.findByPk(id).then(log => log.destroy());
  //   return log;
  // }
}

export default InvitationService;
