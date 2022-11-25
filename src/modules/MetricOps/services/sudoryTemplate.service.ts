import DB from '@/database';
import { CreateSudoryTemplateDto, UpdateSudoryTemplateDto } from '../dtos/sudoryTemplate.dto';
import { isEmpty } from '@/common/utils/util';
import { HttpException } from '@/common/exceptions/HttpException';
import TableIdService from '@/modules/CommonService/services/tableId.service';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
import { ISudoryTemplate } from '@/common/interfaces/sudoryTemplate.interface';

class SudoryTemplateService {
  public sudoryTemplate = DB.SudoryTemplate;
  public tableIdService = new TableIdService();

  /**
   * Find all sudoryTemplate List
   *
   * @returns Promise<ISudoryTemplate[]>
   * @author Shrishti Raj
   */
  public async findAllSudoryTemplate(): Promise<ISudoryTemplate[]> {
    const sudoryTemplateList: ISudoryTemplate[] = await this.sudoryTemplate.findAll({
      where: { deletedAt: null },
    });
    return sudoryTemplateList;
  }

  /**
   * Create a new sudoryTemplate
   *
   * @param  {CreateSudoryTemplateDto} sudoryTemplateData
   * @returns Promise<ISudoryTemplate>
   * @author Shrishti Raj
   */
  public async createSudoryTemplate(sudoryTemplateData: CreateSudoryTemplateDto, systemId: string): Promise<ISudoryTemplate> {
    if (isEmpty(sudoryTemplateData)) throw new HttpException(400, 'sudoryTemplate Data cannot be blank');

    const tableIdName = 'SudoryTemplate';
    const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(tableIdName);
    const sudoryTemplateId: string = responseTableIdData.tableIdFinalIssued;
    const { sudoryTemplateName, sudoryTemplateDescription, sudoryTemplateUuid, sudoryTemplateArgs } = sudoryTemplateData;
    const currentDate = new Date();
    const sudoryTemplate = {
      sudoryTemplateId: sudoryTemplateId,
      createdBy: systemId,
      createdAt: currentDate,
      updatedAt: currentDate,
      sudoryTemplateName,
      sudoryTemplateDescription,
      sudoryTemplateUuid,
      sudoryTemplateArgs,
    };
    const newsudoryTemplate: ISudoryTemplate = await this.sudoryTemplate.create(sudoryTemplate);
    return newsudoryTemplate;
  }

  /**
   * find sudoryTemplate by Id
   *
   * @param  {string} sudoryTemplateId
   * @returns Promise<ISudoryTemplate>
   * @author Shrishti Raj
   */
  public async findSudoryTemplateById(sudoryTemplateId: string): Promise<ISudoryTemplate> {
    if (isEmpty(sudoryTemplateId)) throw new HttpException(400, 'Not a valid sudoryTemplateId');

    const findSudoryTemplate: ISudoryTemplate = await this.sudoryTemplate.findOne({
      where: { sudoryTemplateId, deletedAt: null },
    });
    if (!sudoryTemplateId) throw new HttpException(409, 'sudoryTemplate Id Not found');

    return findSudoryTemplate;
  }

  /**
   *
   * @param {string} sudoryTemplateId
   * @param {object} sudoryTemplateData
   * @param {string} systemId
   * @returns  Promise<ISudoryTemplate>
   */
  public async updateSudoryTemplate(
    sudoryTemplateId: string,
    sudoryTemplateData: UpdateSudoryTemplateDto,
    systemId: string,
  ): Promise<ISudoryTemplate> {
    if (isEmpty(UpdateSudoryTemplateDto)) throw new HttpException(400, 'sudoryTemplate Data cannot be blank');
    const findSudoryTemplate: ISudoryTemplate = await this.sudoryTemplate.findOne({ where: { sudoryTemplateId } });
    if (!findSudoryTemplate) throw new HttpException(409, "sudoryTemplate doesn't exist");

    const currentDate = new Date();
    const updatedChannelData = {
      ...sudoryTemplateData,
      updatedBy: systemId,
      updatedAt: currentDate,
    };
    await this.sudoryTemplate.update(updatedChannelData, { where: { sudoryTemplateId } });

    return this.findSudoryTemplateById(sudoryTemplateId);
  }
}

export default SudoryTemplateService;
