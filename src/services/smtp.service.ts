import nodemailer from 'nodemailer';
import { RequestHandler } from 'express';
import { smtpMessage } from '@/interfaces/smtp.interface';

class SmtpService {
  public sendSmtp: RequestHandler = (req, res) => {
    let mailTransporter = nodemailer.createTransport({
      // service: 'gmail',
      host: 'smtp.gmail.com',
      Port: 587,
      auth: {
        user: 'jaswantlog@gmail.com',
        pass: 'pyuoupmvspnktrwz',
      },
    });

    let mailDetails: smtpMessage = {
      from: req.body.from,
      to: req.body.to,
      subject: req.body.subject,
      text: req.body.text,
    };

    mailTransporter.sendMail(mailDetails, (err: string, res) => {
      if (err) {
        return res.status(400).json({ mesaage: 'Error while sending mail' });
      } else {
        return res.status(200).json({ mesaage: 'Successfully sent email.' });
      }
    });
  };
}

export default SmtpService;
