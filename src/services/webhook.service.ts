import { webhookMessage } from '@/interfaces/webhook.interface';
import { HttpException } from '@/exceptions/HttpException';
import { isEmpty } from '@utils/util';
import axios from 'axios';

class WebhookService {
  public async sendWebhook(webhookData: webhookMessage, webhook: string): Promise<any> {
    if (isEmpty(webhookData)) throw new HttpException(400, 'must be valid data into it');

    axios.post(webhook, webhookData).catch(err => {
      console.log(err);
    });

    return true;
  }
}

export default WebhookService;
