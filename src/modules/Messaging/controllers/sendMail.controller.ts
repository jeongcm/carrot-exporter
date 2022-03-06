import MailService from '@/modules/Messaging/services/sendMail.service';

class SendMailController {
  public mailService = new MailService();
  public processMail = async (req, res, next) => {
    return await this.mailService.sendMail(req, res);
  };
}

export default SendMailController;
