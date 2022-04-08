import { NextFunction, Request, Response } from 'express';
import { IResponseIssueTableIdDto, IResponseIssueTableIdBulkDto } from '@/modules/CommonService/dtos/tableId.dto';
//import { ITableId as TableId } from '@/common/interfaces/tableId.interface';
import tableIdService from '@/modules/CommonService/services/tableId.service';
import { IRequestWithUser } from '@/common/interfaces/party.interface';

class TableIdController {
  public tableIdService = new tableIdService();

  public issueTableId = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const tableIdTableName = req.body.tableName;

      const tableId = await this.tableIdService.getTableIdByTableName(tableIdTableName);

      if (!tableId) {
        return res.sendStatus(404);
      }

      const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(tableIdTableName);
      res.status(200).json({ data: responseTableIdData, message: `a new table id is issued for ${tableIdTableName} table` });
    } catch (error) {
      next(error);
    }
  };

  public issueTableIdBulk = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    try {
      const tableIdTableName = req.body.tableName;
      const tableIdKeyRange = req.body.tableIdRange;

      const tableId = await this.tableIdService.getTableIdByTableName(tableIdTableName);

      if (!tableId) {
        return res.sendStatus(404);
      }

      const responseTableIdData: IResponseIssueTableIdBulkDto = await this.tableIdService.issueTableIdBulk(tableIdTableName, tableIdKeyRange);
      res.status(200).json({ data: responseTableIdData, message: `new table IDs are issued for ${tableIdTableName} table` });
      

    } catch(error) {
      next(error);
    }
  };

}

export default TableIdController;
