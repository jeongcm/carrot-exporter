import axios from 'axios';
import config from '@config/index';
import { HttpException } from '@/common/exceptions/HttpException';
import { SchedulerDto } from '../dtos/scheduler.dto';

/**
 * @memberof Scheduler
 */
class SchedulerService {
  public async getSchedulerByAccountId(accountId: string): Promise<any> {
    const schedulerServerUrl = config.ncCronApiDetail.baseURL + '/scheduler/account/' + accountId;

    let result = [];

    await axios({
      method: 'get',
      url: `${schedulerServerUrl}`,
      headers: { x_auth_token: `${config.ncCronApiDetail.authToken}` },
    })
      .then(async (res: any) => {
        const statusCode = res.status;

        if (statusCode === 200) {
          result = res?.data?.data;
        }
      })
      .catch(error => {
        console.log(error);
        throw new HttpException(500, `Unknown error to fetch the result of scheduler of accountId: ${accountId}`);
      });

    return result;
  }

  public async getAllSchedulersByAccountId(accountId: string): Promise<any> {
    const schedulerServerUrl = config.ncCronApiDetail.baseURL + '/scheduler/account/all/' + accountId;

    let result = [];

    await axios({
      method: 'get',
      url: `${schedulerServerUrl}`,
      headers: { x_auth_token: `${config.ncCronApiDetail.authToken}` },
    })
      .then(async (res: any) => {
        const statusCode = res.status;

        if (statusCode === 200) {
          result = res?.data?.data;
        }
      })
      .catch(error => {
        console.log(error);
        throw new HttpException(500, `Unknown error to fetch the result of scheduler of accountId: ${accountId}`);
      });

    return result;
  }

  public async getSchedulerByClusterId(clusterId: string): Promise<any> {
    const schedulerServerUrl = config.ncCronApiDetail.baseURL + '/cluster/' + clusterId;
    let result = [];

    await axios({
      method: 'get',
      url: `${schedulerServerUrl}`,
      headers: { x_auth_token: `${config.ncCronApiDetail.authToken}` },
    })
      .then(async (res: any) => {
        const statusCode = res.status;

        if (statusCode === 200) {
          result = res?.data?.data;
        }
      })
      .catch(error => {
        console.log(error);
        throw new HttpException(500, `Unknown error to fetch the result of scheduler of clusterId: ${clusterId}`);
      });

    return result;
  }

  public async getSchedulerBySchedulerId(schedulerId: string): Promise<any> {
    const schedulerServerUrl = config.ncCronApiDetail.baseURL + '/scheduler/' + schedulerId;

    let result = [];

    await axios({
      method: 'get',
      url: `${schedulerServerUrl}`,
      headers: { x_auth_token: `${config.ncCronApiDetail.authToken}` },
    })
      .then(async (res: any) => {
        const statusCode = res.status;

        if (statusCode === 200) {
          result = res?.data?.data;
        }
      })
      .catch(error => {
        console.log(error);
        throw new HttpException(500, `Unknown error to fetch the result of scheduler of accountId: ${schedulerId}`);
      });

    return result;
  }

  public async getAllSchedulerByAccountId(accountId: string): Promise<any> {
    const schedulerServerUrl = config.ncCronApiDetail.baseURL + '/scheduler/account/all/' + accountId;

    let result = [];

    await axios({
      method: 'get',
      url: `${schedulerServerUrl}`,
      headers: { x_auth_token: `${config.ncCronApiDetail.authToken}` },
    })
      .then(async (res: any) => {
        const statusCode = res.status;

        if (statusCode === 200) {
          result = res?.data?.data;
        }
      })
      .catch(error => {
        console.log(error);
        throw new HttpException(500, `Unknown error to fetch the result of scheduler of accountId: ${accountId}`);
      });

    return result;
  }

  public async createScheduler(createSchedulerData: SchedulerDto, customerAccountId: string): Promise<any> {
    const schedulerServerUrl = config.ncCronApiDetail.baseURL + '/scheduler';

    let schedulerCreateResponse;

    const payload = {
      ...createSchedulerData,
      timezone: 'UTC',
      accountId: customerAccountId,
    };

    await axios({
      method: 'post',
      url: `${schedulerServerUrl}`,
      data: payload,
      headers: { x_auth_token: `${config.ncCronApiDetail.authToken}` },
    })
      .then(async (res: any) => {
        console.log('success to create scheduler');
        schedulerCreateResponse = res.data;
      })
      .catch(error => {
        console.log(error);
        return error;
      });

    return schedulerCreateResponse;
  }

  public async cancelCronScheduleBySchedulerId(schedulerId: string): Promise<any> {
    const schedulerServerUrl = config.ncCronApiDetail.baseURL + '/scheduler/' + schedulerId;

    let result = [];

    await axios({
      method: 'delete',
      url: `${schedulerServerUrl}`,
      headers: { x_auth_token: `${config.ncCronApiDetail.authToken}` },
    })
      .then(async (res: any) => {
        const statusCode = res.status;

        if (statusCode === 200) {
          result = res?.data;
        }
      })
      .catch(error => {
        console.log(error);
        throw new HttpException(500, `Unknown error to fetch the result of scheduler of accountId: ${schedulerId}`);
      });

    return result;
  }
}

export default SchedulerService;
