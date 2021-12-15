const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class MailService {
  public sendMail = (req, res) => {
      console.log("_dirrrr", __dirname)
    const emailTemplateSource = fs.readFileSync(path.join(__dirname, '../templates/email.hbs'), 'utf8');
    const mailgunAuth = {
      auth: {
        api_key: 'afc38a0b3a279b1c3da684fcaf5b6ede-7fba8a4e-6df6e2b9',
        domain: 'sandboxf34105cd97c4421d8286857b8c3be8bb.mailgun.org',
      },
    };
    const smtpTransport = nodemailer.createTransport(mg(mailgunAuth));
    const template = handlebars.compile(emailTemplateSource);
    const { email, username } = req.body;
    let token;
    token = crypto.randomBytes(48).toString('base64').slice(0, 48);
    const host = req.get('host');
    const link = `http://${host}/verify?email=${email}&token=${token}`;
    const htmlToSend = template({ link, username });
    const mailOptions = {
      from: 'jaswant.singh@exubers.com',
      to: email,
      subject: 'Email Verification from Exubers',
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
