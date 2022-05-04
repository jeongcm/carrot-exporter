import { NextFunction, Request, Response } from 'express';

import DB from '@/database';

import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
import TableIdService from '@/modules/CommonService/services/tableId.service';
import { IPartyUser } from '@/common/interfaces/party.interface';
import { IApi } from '@/common/interfaces/api.interface';

/**
 * Middleware to be used to authenticate a particular request.
 * @param  {} req
 * @param  {Response} res
 * @param  {NextFunction} next
 */

const createUserLogMiddleware = async (req, res: Response, next: NextFunction) => {
  const tableIdService = new TableIdService();

  const partyUserId = req?.user?.partyId ? req?.user?.partyId : req?.systemId;
  const apiEndPoint1 = req.method;
  const apiEndPoint2 = req?.route?.path;

  const findPartyUser: IPartyUser = await DB.PartyUser.findOne({
    where: {
      partyUserId,
    },
  });

  const findApi: IApi = await DB.Api.findOne({
    where: {
      apiEndPoint1,
      apiEndPoint2,
    },
  });

  try {
    const responseTableIdData: IResponseIssueTableIdDto = await tableIdService.issueTableId('PartyUserLogs');

    await DB.PartyUserLogs.create({
      partyUserLogsId: responseTableIdData.tableIdFinalIssued,
      partyUserKey: findPartyUser.partyUserKey,
      apiKey: findApi.apiKey,
      createdBy: partyUserId,
    });

    return next();
<<<<<<< HEAD
  } catch (error) {
    return next(error);
  }
=======
  } catch (error) {next(error)}
>>>>>>> dfcee82 (add new apis for creating cluster)
};

export default createUserLogMiddleware;
