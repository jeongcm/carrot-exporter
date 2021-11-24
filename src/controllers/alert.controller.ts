import { NextFunction, Request, Response } from 'express';
import { IAlert } from '@/interfaces/alert.interface';
import AlertService from '@/services/alert.service';

class AlertController {
  public alertService = new AlertService();

  public getAlerts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const findAllAlertsData: IAlert[] = await this.alertService.findAllAlerts();
      res.status(200).json({ data: findAllAlertsData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };
}

export default AlertController;

// let alerts = [
//   {
//     alertName: 'sample alert',
//     from: 'LARI',
//     id: 1,
//     incidentId: [1],
//     lastUpdatedAt: new Date().toString(),
//     recipients: [
//       {
//         id: 3,
//         name: 'bear',
//       },
//     ],
//     severity: 'information',
//     source: '1.0.0.7',
//     startAt: new Date().toString(),
//     status: 'OPEN',
//     summary: 'eclipse',
//   },
// ];
