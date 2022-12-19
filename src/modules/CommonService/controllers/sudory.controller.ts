import { NextFunction, Request, Response } from 'express';
import { IRequestWithSystem, IRequestWithUser } from '@/common/interfaces/party.interface';
import { ISudoryClient } from '@/modules/CommonService/dtos/sudory.dto';
import SudoryService from '../services/sudory.service';
import { HttpException } from '@/common/exceptions/HttpException';
import config from '@config/index';

class executorController {
  public sudoryService = new SudoryService();

  /**
   * @param  {IRequestWithUser} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */
  public checkSudoryClient = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const clusterUuid = req.params.clusterUuid;

      const clientResponse: ISudoryClient = await this.sudoryService.checkSudoryClient(clusterUuid);

      if (clientResponse) {
        if (clientResponse.validClient) {
          res.status(200).json({ data: clientResponse, message: `Success to confirm Executor/Sudory client: clientUuid: ${clusterUuid}` });
        } else if (clientResponse.clientUuid == 'notfound')
          res.status(404).json({ data: clientResponse, message: `Executor/Sudory client not found` });
        else res.status(409).json({ data: clientResponse, message: `Executor/Sudory client expired` });
      } else res.status(404).json({ data: clientResponse, message: `Executor/Sudory client not found` });
    } catch (error) {
      next(error);
    }
  };
} // end of class

export default executorController;
