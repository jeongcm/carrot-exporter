import axios from 'axios';
import ServiceExtension from '@/common/extentions/service.extension';
import config from 'config';
import { isEmpty } from 'lodash';

class VictoriaMetricService extends ServiceExtension {
  private victoriaEndpoint = config.victoriaMetrics.NC_LARI_VM_ADDRESS;

  constructor() {
    super({});
  }

  public async queryRange(promQl, start, end, step?) {
    if (isEmpty(promQl)) return this.throwError('EXCEPTION', 'promQL is missing');
    if (isEmpty(start)) return this.throwError('EXCEPTION', 'start time is missing');
    if (isEmpty(end)) return this.throwError('EXCEPTION', 'end time is missing');

    let url = `${this.victoriaEndpoint}/api/v1/query_range?query=${promQl}&start=${start}&end=${end}`;
    if (step) {
      url = `${url}&step=${step}`;
    }

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
      this.throwError('EXCEPTION', 'failed to call victoria metric server');
    }
  }

  public async query(promQl) {
    if (isEmpty(promQl)) return this.throwError('EXCEPTION', 'promQL is missing');

    const url = `${this.victoriaEndpoint}/api/v1/query?query=${promQl}`;

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
      this.throwError('EXCEPTION', 'failed to call victoria metric server');
    }
  }}

export default VictoriaMetricService;
