import { NextFunction, Response } from 'express';

import AccessGroupService from '@/modules/Party/services/accessgroup.service';

import { IParty, IPartyRelation, IPartyResponse, IRequestWithUser } from '@/common/interfaces/party.interface';
import { UpdateUserDto, CreateAccessGroupDto, AddUserAccessGroupDto, AddResourceToAccessGroupDto } from '@/modules/Party/dtos/party.dto';
import CustomerAccountService from '@/modules/CustomerAccount/services/customerAccount.service';
import SchedulerService from '@/modules/Scheduler/services/scheduler.service';
import { textChangeRangeIsUnchanged } from 'typescript';
import config from '@config/index';

class SchedulerController {
  public schedulerService = new SchedulerService();
  public customerAccountService = new CustomerAccountService();

  public getSchedulerByAccountId = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const accountId = req.params.accountId;

      const getSchedulerResult = await this.schedulerService.getSchedulerByAccountId(accountId);

      if (!getSchedulerResult) {
        return res.sendStatus(404);
      }

      res.status(200).json({ data: getSchedulerResult, message: `scheduler list of customerAccountId: ${accountId}` });
    } catch (error) {
      next(error);
    }
  };

  public getSchedulerByClusterId = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const clusterId = req.params.clusterId;

      const getSchedulerResult = await this.schedulerService.getSchedulerByClusterId(clusterId);

      if (!getSchedulerResult) {
        return res.sendStatus(404);
      }

      res.status(200).json({ data: getSchedulerResult, message: `scheduler list of cluster: ${clusterId}` });
    } catch (error) {
      next(error);
    }
  };

  public getSchedulerBySchedulerId = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const schedulerId = req.params.schedulerId;

      const getSchedulerResult = await this.schedulerService.getSchedulerBySchedulerId(schedulerId);

      if (!getSchedulerResult) {
        return res.sendStatus(404);
      }

      res.status(200).json({ data: getSchedulerResult, message: `scheduler (Id: ${schedulerId})` });
    } catch (error) {
      next(error);
    }
  };

  public getAllSchedulersByAccountId = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const accountId = req.params.accountId;

      const getSchedulerResult = await this.schedulerService.getAllSchedulersByAccountId(accountId);

      if (!getSchedulerResult) {
        return res.sendStatus(404);
      }

      res.status(200).json({ data: getSchedulerResult, message: `scheduler list of customerAccountId: ${accountId}` });
    } catch (error) {
      next(error);
    }
  };

  public createScheduler = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const customerAccountKey = req.customerAccountKey;
    const createSchedulerData = req.body;
    //improvement/599, in case of "" of apiUrl, fill Sudory base url.
    const apiUrl = req.body.apiUrl || config.sudoryApiDetail.baseURL;
    const apiType = req.body.apiType || 'POST';
    const customerAccountId = await this.customerAccountService.getCustomerAccountIdByKey(customerAccountKey);
    delete createSchedulerData.apiUrl;
    delete createSchedulerData.apiType;
    const newCreateSchedulerData = { ...createSchedulerData, apiUrl, apiType };
    try {
      const createSchedulerResult = await this.schedulerService.createScheduler(newCreateSchedulerData, customerAccountId);
      res.status(200).json({ data: createSchedulerResult, message: `created scheduler` });
    } catch (error) {
      next(error);
    }
  };

  public cancelCronScheduleBySchedulerId = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const schedulerId = req.params.schedulerId;

      const cancelSchedulerResult = await this.schedulerService.cancelCronScheduleBySchedulerId(schedulerId);

      if (!cancelSchedulerResult) {
        return res.sendStatus(404);
      }

      res.status(200).json({ data: cancelSchedulerResult, message: `scheduler (Id: ${schedulerId}) has been cancelled` });
    } catch (error) {
      next(error);
    }
  };
}

export default SchedulerController;
