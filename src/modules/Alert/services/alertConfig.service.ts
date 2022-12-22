import DB from '@/database';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

const { Op } = require('sequelize');
import _ from 'lodash';
class AlertConfigService {
  public async updateResourceGroupAlertConfig(customerAccountKey: number, resourceGroupId: string, resourceGroupAlertRepeatInterval: number, resourceGroupAlertGroupWait: number) {
    const updateResult = await DB.ResourceGroup.update({
        resourceGroupAlertRepeatInterval,
        resourceGroupAlertGroupWait
      },
      {
        where: {
          customerAccountKey,
          resourceGroupId,
        },
      },
    );
  
    return updateResult;
  }
}

export default AlertConfigService;
