import ServiceExtension from '@/common/extentions/service.extension';
import config from 'config';
import { isEmpty } from 'lodash';
import { logger } from '@/common/utils/logger';
import axios from 'common/httpClient/axios';
class VictoriaMetricService extends ServiceExtension {
  private victoriaSingleEndpoint = config.victoriaMetrics.NC_LARI_VM_ADDRESS;
  private victoriaMultiEndpoint = config.victoriaMetrics.vmMultiAuthUrl;

  constructor() {
    super({});
  }

  public async queryRange(customerAccountId, promQl, start, end, step?) {
    if (isEmpty(promQl)) return this.throwError('EXCEPTION', 'promQL is missing');
    if (isEmpty(start)) return this.throwError('EXCEPTION', 'start time is missing');
    if (isEmpty(end)) return this.throwError('EXCEPTION', 'end time is missing');

    const startTime: number = Date.now();
    let url;
    let axiosParameter;
    if (config.victoriaMetrics.vmOption === 'SINGLE') {
      url = `${this.victoriaSingleEndpoint}/api/v1/query_range?query=${encodeURIComponent(promQl)}&start=${start}&end=${end}&step=${step}`;
      axiosParameter = {
        method: 'GET',
        url: `${url}`,
      };
    } else {
      const username = 'S' + customerAccountId;
      const password = customerAccountId;
      url = `${this.victoriaMultiEndpoint}/api/v1/query_range?query=${encodeURIComponent(promQl)}&start=${start}&end=${end}&step=${step}`;
      axiosParameter = {
        method: 'GET',
        url: `${url}`,
        auth: { username: username, password: password },
      };
    }

    if (step) {
      url = `${url}&step=${step}`;
    }

    try {
      const result = await axios(axiosParameter);

      if (result && result.data && result.data.data) {
        result.data.data.queryRunTime = Date.now() - startTime;
        return result.data.data;
      } else {
        return null;
      }
    } catch (e) {
      console.log(e.toJSON());
      this.throwError('EXCEPTION', e.response?.data);
    }
  }

  public async query(customerAccountId, promQl, step) {
    if (isEmpty(promQl)) return this.throwError('EXCEPTION', 'promQL is missing');

    let url;
    let axiosParameter;
    let stepStr = '';
    if (step) {
      stepStr = `&step=${step}`;
    }
    if (config.victoriaMetrics.vmOption === 'SINGLE') {
      url = `${this.victoriaSingleEndpoint}/api/v1/query?query=${encodeURIComponent(promQl)}${stepStr}`;
      axiosParameter = {
        method: 'GET',
        url: `${url}`,
      };
    } else {
      const username = 'S' + customerAccountId;
      const password = customerAccountId;
      url = `${this.victoriaMultiEndpoint}/api/v1/query?query=${encodeURIComponent(promQl)}${stepStr}`;
      axiosParameter = {
        method: 'GET',
        url: `${url}`,
        auth: { username: username, password: password },
      };
    }

    try {
      const result = await axios(axiosParameter);

      if (result && result.data && result.data.data) {
        return result.data.data;
      } else {
        return null;
      }
    } catch (e) {
      console.log(e.response?.data);
      this.throwError('EXCEPTION', e);
    }
  }
}

export default VictoriaMetricService;
