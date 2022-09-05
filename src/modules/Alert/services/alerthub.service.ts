import { HttpException } from '@/common/exceptions/HttpException';
import { IAlertTimeline } from '@/common/interfaces/alertTimeline.interface';
import { isEmpty } from '@/common/utils/util';
import DB from '@/database';
import TableIdService from '@/modules/CommonService/services/tableId.service';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import axios from 'common/httpClient/axios';
import config from 'config';
import AlertRuleService from './alertRule.service';
import { IAlertRule } from '@/common/interfaces/alertRule.interface';
import { IAlertRuleSettingData } from '@/common/interfaces/alertReceived.interface';

import _ from 'lodash';

dayjs.extend(utc);

class AlerthubService {
  public alertRuleService = new AlertRuleService();

  public async getAlertTimelinesByAlertRuleKey(
    customerAccountKey: number,
    alertRuleKey: number,
    startAt?: string,
    endAt?: string,
  ): Promise<IAlertTimeline[]> {
    try {
      const start = Date.now();
      const { data } = await axios.get(`${config.alerthub.baseUrl}/v1/alertTimeline/${customerAccountKey}/${alertRuleKey}`, {
        headers: { x_auth_token: `${config.alerthub.authToken}` },
      });

      if (data.data && data.message === 'success') {
        data.data.queryRunTime = Date.now() - start;
        return data.data;
      }
    } catch (e) {
      throw e;
    }
  }

  public async getAlertNotiScheduledByAlertRuleKey(
    customerAccountKey: number,
    alertRuleKey: number,
    startAt?: string,
    endAt?: string,
  ): Promise<IAlertTimeline[]> {
    try {
      const start = Date.now();
      const { data } = await axios.get(`${config.alerthub.baseUrl}/v1/alertNotiScheduled/${customerAccountKey}/${alertRuleKey}`, {
        headers: { x_auth_token: `${config.alerthub.authToken}` },
      });

      if (data.data && data.message === 'success') {
        data.data.queryRunTime = Date.now() - start;
        return data.data;
      }
    } catch (e) {
      throw e;
    }
  }

  public async getAlertTimelineByResourceDetail(customerAccountKey: number, filteringData: any): Promise<IAlertTimeline[]> {
    try {
      const start = Date.now();

      const { resourceType, resourceName, resourceGroupUuid } = filteringData;
      const { data } = await axios.get(
        `${config.alerthub.baseUrl}/v1/alertTimelineByResGroupUuid/${customerAccountKey}/${resourceGroupUuid}?resourceType=${resourceType}&resourceName=${resourceName}`,
        {
          headers: { x_auth_token: `${config.alerthub.authToken}` },
        },
      );
      console.log(`Sequelize time: `, Date.now() - start, 'ms');
      if (data.data && data.message === 'success') {
        data.data.queryRunTime = Date.now() - start;
        return data.data;
      }
    } catch (e) {
      throw e;
    }
  }

  public async getAllAlertRuleIdsSettingData(alertRuleIds: string[], customerAccountKey: number): Promise<IAlertRule[]> {
    if (isEmpty(alertRuleIds)) throw new HttpException(400, 'Alert Rule Ids must be valid or not empty');
    const alertRuleKey: IAlertRule[] = await this.alertRuleService.findAlertRuleKeyByIds(alertRuleIds, customerAccountKey);
    const alertRuleKeys: number[] = alertRuleKey.map(alertRuleKeyX => {
      return alertRuleKeyX.alertRuleKey;
    });
    try {
      const { data } = await axios.post(
        `${config.alerthub.baseUrl}/v1/alertNotiSetAlertRule/${customerAccountKey}`,
        { alertRuleKeys },
        {
          headers: { x_auth_token: `${config.alerthub.authToken}` },
        },
      );

      if (data.data && data.message === 'success') {
        return data.data;
      }
    } catch (e) {
      throw e;
    }
    return alertRuleKey;
  }

  public async upsertAlertRuleSetting(alertRuleSettingData: IAlertRuleSettingData, customerAccountKey: number): Promise<IAlertRule[]> {
    if (isEmpty(alertRuleSettingData)) throw new HttpException(400, 'Alert Rule setting must not be empty.');
    try {
      const { data } = await axios.put(
        `${config.alerthub.baseUrl}/v1/alertNotiSetAlertRule/${customerAccountKey}`,
        { ...alertRuleSettingData },
        {
          headers: { x_auth_token: `${config.alerthub.authToken}` },
        },
      );

      if (data.data && data.message === 'success') {
        return data.data;
      }
    } catch (e) {
      throw e;
    }
  }
}

export default AlerthubService;
