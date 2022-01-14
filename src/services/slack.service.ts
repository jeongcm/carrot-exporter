import DB from 'databases';
import { SlackMessage } from '@/interfaces/slack.interface';
import { HttpException } from '@exceptions/HttpException';
import { isEmpty } from '@utils/util';
import axios from 'axios';

class SlackService {
  public async sendSlack(slackData: SlackMessage, slackHook: string): Promise<any> {
    if (isEmpty(slackData)) throw new HttpException(400, 'must be valid data into it');
    console.log(slackData);
    console.log(slackHook);

    const data = { username: 'example' };
    axios
      .post(slackHook, {
        text: JSON.stringify(slackData),
      })
      .catch(err => {
        console.log(err);
      });

    return true;
  }
}

export default SlackService;
