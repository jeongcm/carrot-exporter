import ServiceExtension from '@/common/extentions/service.extension';
import config from 'config';
import { isEmpty } from 'lodash';
import { logger } from '@/common/utils/logger';
import axios from 'common/httpClient/axios';
class VictoriaMetricService extends ServiceExtension {
  private victoriaEndpoint = config.victoriaMetrics.NC_LARI_VM_ADDRESS;

  constructor() {
    super({});
  }

  public async queryRange(promQl, start, end, step?) {
    if (isEmpty(promQl)) return this.throwError('EXCEPTION', 'promQL is missing');
    if (isEmpty(start)) return this.throwError('EXCEPTION', 'start time is missing');
    if (isEmpty(end)) return this.throwError('EXCEPTION', 'end time is missing');

    const startTime: number = Date.now();

    let url = `${this.victoriaEndpoint}/api/v1/query_range?query=${encodeURIComponent(promQl)}&start=${start}&end=${end}`;
    if (step) {
      url = `${url}&step=${step}`;
    }

    // FOR DEBUG:
    logger.info(`Calling Victoria Metric: ${url}`);

    try {
      const result = await axios({
        method: 'GET',
        url: `${url}`,
      });

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

  public async query(promQl, step) {
    if (isEmpty(promQl)) return this.throwError('EXCEPTION', 'promQL is missing');

    let stepStr = '';
    if (step) {
      stepStr = `&step=${step}`;
    }

    const url = `${this.victoriaEndpoint}/api/v1/query?query=${encodeURIComponent(promQl)}${stepStr}`;

    try {
      const result = await axios({
        method: 'GET',
        url: `${url}`,
      });

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
