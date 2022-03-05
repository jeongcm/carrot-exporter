import config from 'config';
import urlJoin from 'url-join';

// RYAN: please keep it our convention by using import
const nodemailer = require('nodemailer');
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
    const smtpTransport = nodemailer.createTransport(mg(mailgunAuth));
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
}
export default MailService;
