import { HttpException } from '@/common/exceptions/HttpException';
import { IAlertTimeline } from '@/common/interfaces/alertTimeline.interface';
import { isEmpty } from '@/common/utils/util';
import DB from '@/database';
import TableIdService from '@/modules/CommonService/services/tableId.service';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import axios from 'axios';
import config from 'config';

import _ from 'lodash';

dayjs.extend(utc);

class AlerthubService {
  public async getAlertTimelinesByAlertRuleKey(
    customerAccountKey: number,
    alertRuleKey: number,
    startAt?: string,
    endAt?: string,
  ): Promise<IAlertTimeline[]> {
    axios.get(`${config.alerthub.baseUrl}/v1/alertTimeline/${customerAccountKey}/${alertRuleKey}`, {
      headers: { x_auth_token: `${config.alerthub.authToken}` },
    });

    return;
  }
}

export default AlerthubService;
