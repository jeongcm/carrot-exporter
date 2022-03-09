import { NextFunction, Request, Response } from 'express';
import { Log } from '@/common/interfaces/log.interface';
import LogService from '@/modules/Log/services/log.service';
import { RequestWithUser } from '@/common/interfaces/auth.interface';

class LogController {
  public logService = new LogService();

  public getLogs = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const allLogs: Log[] = await this.logService.getAllLogs();
      res.status(200).json({ data: allLogs, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getLog = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const id = req.params.id;

    try {
      const log: Log = await this.logService.getLogById(Number(id));
      res.status(200).json({ data: log, message: `find log id (${id}) ` });
    } catch (error) {
      next(error);
    }
  };
}

export default LogController;
