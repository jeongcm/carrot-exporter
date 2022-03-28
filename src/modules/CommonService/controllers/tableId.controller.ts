import { NextFunction, Request, Response } from 'express';
import { IssueTableIdDto, IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
import { ITableId as TableId } from '@/common/interfaces/tableId.interface';
import tableIdService from '@/modules/CommonService/services/tableId.service';
import { RequestWithUser } from '@/common/interfaces/auth.interface';

class tableIdController {
  public tableIdService = new tableIdService();

  public issueTableId = async (req: RequestWithUser, res: Response, next: NextFunction) => {
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
}

export default tableIdController;
