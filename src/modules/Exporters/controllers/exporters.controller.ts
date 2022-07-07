import { NextFunction, Request, Response } from 'express';
import { IExporters } from '@/common/interfaces/exporters.interface';
import { IRequestWithSystem, IRequestWithUser } from '@/common/interfaces/party.interface';
import exportersService from '../services/exporters.service';
import { HttpException } from '@/common/exceptions/HttpException';
import exporterService from '@/modules/Exporters/services/exporters.service'

class exporterController {
  public exeporterService = new exporterService();

  /**
   * @param  {IRequestWithUser} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */
  public getExporter = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const exporterId = req.params.exporterId;

      const getExporter : IExporters = await this.exeporterService.getExporter(exporterId);
      if (!getExporter) {
        return res.status(404).json({ Requested_exporterId: exporterId, message: `can't find exporter info of exporterId` });  
      
      }
      res.status(200).json({ data: getExporter, message: `find exporter info of exporterId: ${exporterId}` });
    } catch (error) {
      next(error);
    }
  }; // end of method

  /**
   * @param  {IRequestWithUser} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */
   public createExporter = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      let createdBy = req.user.partyId
      let dataSetForExporter = { exporterName: req.body.exporterName,
                                 exporterDescription: req.body.exporterDescription,
                                 exporterHelmChartName: req.body.exporterHelmChartName,
                                 exporterHelmChartVersion: req.body.exporterHelmChartVersion,
                                 exporterHelmChartRepoUrl: req.body.exporterHelmChartRepoUrl,
                                 exporterHelmChartValues: req.body.exporterHelmChartValues,
                                 grafanaDashboard: req.body.grafanaDashboard
      } 

      const getExporter : IExporters = await this.exeporterService.createExporter(dataSetForExporter, createdBy);
      res.status(200).json({ data: getExporter, message: `create exporter info of exporterId: ${req.body}` });
    } catch (error) {
      next(error);
    }
  }; // end of method


} // end of class

export default exporterController;
