import nodemailer from 'nodemailer';

import { HttpException } from '@/common/exceptions/HttpException';
import { isEmpty } from '@/common/utils/util';
import { SMTPConfig, SMTPMessage } from '@/common/interfaces/smtp.interface';

class SMTPService {
  public async sendSMTP(config: SMTPConfig, SMTPData: SMTPMessage): Promise<any> {
    if (isEmpty(SMTPData)) throw new HttpException(400, 'must be valid data into it');

    if (isEmpty(config)) throw new HttpException(400, 'must be valid config into it');

    let mailTransporter = nodemailer.createTransport({
      host: config.host,
      Port: config.port,
      auth: {
        user: config.userName,
        pass: config.password,
      },
    });

    mailTransporter.sendMail(SMTPData, (err: string) => {
      if (err) {
        throw new HttpException(502, 'Unable to send email.');
      }
    });
  }
}

export default SMTPService;
