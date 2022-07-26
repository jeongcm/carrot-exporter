import TableIdService from '@/modules/CommonService/services/tableId.service';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
import { HttpException } from '@/common/exceptions/HttpException';

type TErrorTypes = 'NOT_FOUND' | 'EXCEPTION';

export interface IServiceExtensionConstructor {
  tableName?: string;
}

class ServiceExtension {
  private tableName;
  private tableIdService = new TableIdService();

  constructor(opts: IServiceExtensionConstructor) {
    this.tableName = opts.tableName;
  }

  protected async createTableId() {
    const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(this.tableName);

    if (responseTableIdData) {
      return responseTableIdData.tableIdFinalIssued;
    } else {
      this.throwError('EXCEPTION', `Failed to issue Table Id for Table "${this.tableName}"`);
    }
  }

  protected throwError(errorType: TErrorTypes, message: string) {
    let code = 500;

    switch (errorType) {
      case 'NOT_FOUND':
        code = 404;
        break;
      case 'EXCEPTION':
        code = 500;
        break;
      default:
        code = 500;
    }

    throw new HttpException(code, `${errorType}: ${message}`);
  }
}

export default ServiceExtension;
