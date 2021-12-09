const nodemailer = require('nodemailer');
import { User } from '@interfaces/users.interface';
import DB from 'databases';
const mg = require('nodemailer-mailgun-transport');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class SendMailController {
  public users = DB.Users;
  public processMail = async (req, res, next) => {
    const emailTemplateSource = fs.readFileSync(path.join(__dirname, '/sendMail.hbs'), 'utf8');
    const mailgunAuth = {
      auth: {
        api_key: 'afc38a0b3a279b1c3da684fcaf5b6ede-7fba8a4e-6df6e2b9',
        domain: 'sandboxf34105cd97c4421d8286857b8c3be8bb.mailgun.org',
      },
    };
    const smtpTransport = nodemailer.createTransport(mg(mailgunAuth));
    const template = handlebars.compile(emailTemplateSource);
    const {email, username} = req.body;
    let token;
    token = crypto.randomBytes(48).toString('base64').slice(0, 48);
    const host = req.get('host');
    const link = `http://${host}/verify?email=${email}&token=${token}`;
    console.log(email, username);
    const htmlToSend = template({ link, username });
    const mailOptions = {
      from: 'jaswant.singh@exubers.com',
      to: email,
      subject: 'Email Verification from Exubers',
      html: htmlToSend,
    };
    
    smtpTransport.sendMail(mailOptions, function (error, response) {
      if (error) {
        console.log(error);
        this.users.update({token:token}, {where:{email}})
      } else {
        return res.status(200).json({ mesaage: 'Successfully sent email.' });
      }
    });
  };

/**
 * verifyMail function to verify the email send while login
 */
  public verifyMail = async(req, res, next)=>{
    console.log(req.query)
    const {token , email} = req.query;
    if(token){
      let obj = {
        isEmailValidated:true,
        emailValidatedOn:new Date(),
        token
      };
      this.users.update(obj, {where:{email}});
      return res.status(200).json({message:"user verified successfully"})
    }else{
      return res.status(400).json({message:"Token is missing in the url"});
    }
  }
}

export default SendMailController;
