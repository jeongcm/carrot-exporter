import { NextFunction, Request, Response } from 'express';
import { IRequestWithSystem, IRequestWithUser } from '@/common/interfaces/party.interface';
import LokiService from '../services/loki.service';

class LokiController {
  public lokiService = new LokiService();
  public tailLog = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const query = req.query.query as string;
      this.lokiService.tailLog(query);
    } catch (error) {
      console.log('Loki tail error');
      res.status(500).json({ message: `Loki Tail Unknown Error` });
      next(error);
    }
  };
  public queryLog = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const query = req.query.query as string;
      const logResult = await this.lokiService.queryLog(query);
      res.status(200).json({ data: logResult, message: `success to query logs` });
    } catch (error) {
      console.log('Loki query error', error);
      res.status(500).json({ message: `Loki Query Unknown Error` });
      // next(error);
    }
  };
  public getLabels = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      //const query = req.query.query as string;
      const logResult = await this.lokiService.getLabels();
      res.status(200).json({ data: logResult, message: `success to pull Loki labels` });
    } catch (error) {
      console.log('Loki query error');
      res.status(500).json({ message: `Loki Label Query Unknown Error` });
      next(error);
    }
  };
  public getLabelValues = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const label = req.params.label as string;
      const logResult = await this.lokiService.getLabelValues(label);
      res.status(200).json({ data: logResult, message: `success to pull Loki label value` });
    } catch (error) {
      console.log('Loki query error');
      res.status(500).json({ message: `Loki Label Value Query Unknown Error` });
      next(error);
    }
  };
}

export default LokiController;
