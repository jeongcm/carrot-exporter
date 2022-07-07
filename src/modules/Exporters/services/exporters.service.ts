import DB from '@/database';
import axios from 'axios';
import config from '@config/index';
import { HttpException } from '@/common/exceptions/HttpException';
import { IResourceGroup } from '@/common/interfaces/resourceGroup.interface';
import { ExporterDto } from '@/modules/Exporters/dtos/exporters.dto';
import { IExecutorClient, ExecutorResultDto, ExecutorResourceListDto, IExecutorClientCheck, SudoryWebhookDto } from '@/modules/CommonService/dtos/executor.dto';

import TableIdService from '@/modules/CommonService/services/tableId.service';
import CustomerAccountService from '@/modules/CustomerAccount/services/customerAccount.service';
import { IExporters } from '@/common/interfaces/exporters.interface';

class executorService {
    public tableIdService = new TableIdService();

    public customerAccountService = new CustomerAccountService();
    public exporters = DB.Exporters; 

    
    /**
     * @param {ExporterDto} DataSetForExporter
     */
    public async createExporter (DataSetForExporter: ExporterDto, createdBy: string): Promise<IExporters> {

        const exporterId = await this.tableIdService.issueTableId('Exporters');        

        const insertData = {
            exporterId: exporterId.tableIdFinalIssued,
            createdAt: new Date(),
            createdBy: createdBy,
            exporterName: DataSetForExporter.exporterName,
            exporterDescription: DataSetForExporter.exporterDescription,
            exporterHelmChartName: DataSetForExporter.exporterHelmChartName,
            exporterHelmChartVersion: DataSetForExporter.exporterHelmChartVersion,
            exporterHelmChartRepoUrl: DataSetForExporter.exporterHelmChartRepoUrl,
            exporterHelmChartValues: JSON.parse(JSON.stringify(DataSetForExporter.exporterHelmChartValues)),
            grafanaDashboard: JSON.parse(JSON.stringify(DataSetForExporter.grafanaDashboard)),
        }
        const resultExporter = await this.exporters.create(insertData); 

        return resultExporter;
    }

    /**
     * @param {string} exporterId
     */
     public async getExporter(exporterId: string): Promise<IExporters> {

        console.log(exporterId); 
        const resultExporter = await this.exporters.findOne({where: { exporterId }}); 
        return resultExporter;
    }

}
export default executorService;