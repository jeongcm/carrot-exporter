import DB from 'databases';
import { SlackMessage } from '@/interfaces/slack.interface';
import { HttpException } from '@exceptions/HttpException';
import { isEmpty } from '@utils/util';
import axios from 'axios';

class SlackService {
  public async sendSlack(slackData: SlackMessage, slackHook: string): Promise<any> {
    if (isEmpty(slackData)) throw new HttpException(400, 'must be valid data into it');

    axios
      .post(slackHook, {
        attachments: [
          {
            color: '#B22222',
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `${slackData.name} \n Description: ${slackData.description} \n cluster_name: ${slackData.clusterName} \n severity: ${slackData.severity}`,
                },
              },
            ],
          },
        ],
      })
      .catch(err => {
        console.log(err);
      });

    return true;
  }
}

export default SlackService;



/// how to use slack service//
// below are the service used to call SlackService.sendSlack

// if(createAlertData){
//   let slackData: SlackMessage = {
//     name: createAlertData.alertName,
//     webLink: "https://www.google.com",
//     description: createAlertData.description,
//     clusterName: "some clustername",
//     severity: createAlertData.severity,
//   }
  
//   let slackHook = "https://hooks.slack.com/services/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";

//   await this.slackService.sendSlack(slackData, slackHook);

// }

