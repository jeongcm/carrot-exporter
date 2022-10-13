import { NextFunction, Request, Response } from 'express';
import { IRequestWithSystem, IRequestWithUser } from '@/common/interfaces/party.interface';
//import { ExecutorDto, IExecutorClient, IExecutorClientCheck } from '@/modules/CommonService/dtos/executor.dto';
import HealthService from '../services/health.service';
//import { HttpException } from '@/common/exceptions/HttpException';
//import config from '@config/index';

class healthController {
  public healthService = new HealthService();

  /**
   * @param  {IRequestWithUser} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */
  public checkHealthByCustomerAccountId = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const customerAccountId = req.body.customerAccountId;

      const healthServiceResult = await this.healthService.checkHealthByCustomerAccountId(customerAccountId);
      res.status(200).json({ data: healthServiceResult, message: `Healthcheck finished successfuly - customerAccountId -  ${customerAccountId}` });
    } catch (error) {
      next(error);
    }
  }; // end of method
} // end of class

export default healthController;
