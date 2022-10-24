import config from '@config/index';
import urlJoin from 'url-join';
//import messageModel from '../models/message.model';
//import {SendMail} from '@/modules/Messaging/dtos/sendMail.dto'
//import DB from '@/database';

// RYAN: please keep it our convention by using import
const nodeMailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const auth = {
  api_key: config.email.mailgun.apiKey,
  domain: config.email.mailgun.domain,
};
class MailService {

  public sendMail = (req, res) => {
    const emailTemplateSource = fs.readFileSync(path.join(__dirname, '../templates/emails/email-body/verifyEmail.hbs'), 'utf8');
    const mailgunAuth = { auth };
    const smtpTransport = nodeMailer.createTransport(mg(mailgunAuth));
    const template = handlebars.compile(emailTemplateSource);
    const { email, username } = req.body;
    const token = crypto.randomBytes(48).toString('base64').slice(0, 48);
    const link = urlJoin(config.email.verification.verityPageURL, `/verify`) + `?email=${email}&token=${token}`;
    const htmlToSend = template({ link, username });
    const mailOptions = {
      from: config.email.defaultFrom,
      to: email,
      subject: 'Email Verification from Nexclipper',
      html: htmlToSend,
    };

    smtpTransport.sendMail(mailOptions, function (error, response) {
      if (error) {
        return res.status(400).json({ mesaage: 'Error while sending mail' });
      } else {
        this.users.update({ token: token }, { where: { email } });
        return res.status(200).json({ mesaage: 'Successfully sent email.' });
      }
    });
  };

  public sendMailGeneral(mailOptions: any) {
    let msg = {};
    console.log('sending mail');
    try {
      const auth = {
        api_key: config.email.mailgun.apiKey,
        domain: config.email.mailgun.domain,
      };
      const mailgunAuth = { auth };
      const smtpTransport = nodeMailer.createTransport(mg(mailgunAuth));

      smtpTransport.sendMail(mailOptions, function (error, response) {
        if (error && Object.keys(error).length) {
          console.log(error);
        } else {
          msg = { response: 'success', details: response.Message };
        }
      });
    } catch (err) {
      console.log(err);
    }
  }
}
export default MailService;
