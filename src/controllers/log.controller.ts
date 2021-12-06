import { NextFunction, Request, Response } from 'express';
import { Log } from '@/interfaces/log.interface';
import LogService from '@/services/log.service';

class LogController {
  public logService = new LogService();

  public getLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const allLogs: Log[] = await this.logService.getAllLogs();
      res.status(200).json({ data: allLogs, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getLog = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    try {
      const log: Log = await this.logService.getLogById(id);
      res.status(200).json({ data: log, message: `find log id (${id}) ` });
    } catch (error) {
      next(error);
    }
  };

}

export default LogController;
