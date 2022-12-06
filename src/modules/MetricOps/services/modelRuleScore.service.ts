import { IModelRuleScore } from '@/common/interfaces/modelRuleScore.interface';
import DB from '@/database';
import { AttachRuleGroupDto } from '../dtos/modelRuleScore.dto';
import { isEmpty } from '@/common/utils/util';
import { HttpException } from '@/common/exceptions/HttpException';
//import CustomerAccountService from '@/modules/CustomerAccount/services/customerAccount.service';
import TableIdService from '@/modules/CommonService/services/tableId.service';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
import { BayesianModelTable } from '../models/bayesianModel.model';
import { logger } from '@/common/utils/logger';
import MetricOpsUtilService from './metricOpsUtill.service';

class ModelRuleScoreService {
  public modelRuleScore = DB.ModelRuleScore;
  public ruleGroup = DB.RuleGroup;
  public bayesianModel = DB.BayesianModel;
  //public customerAccountService = new CustomerAccountService();
  public tableIdService = new TableIdService();
  public metricOpsUtilService = new MetricOpsUtilService();
  /**
   * Create a new modelRuleScore i.e attach rule group to bayesian model
   *
   * @param  {AttachRuleGroupDto} modelRuleScoreData
   * @returns Promise<IModelRuleScore>
   * @author Shrishti Raj
   */
  public async attachRuleGroup(modelRuleScoreData: AttachRuleGroupDto, systemId: string): Promise<IModelRuleScore> {
    if (isEmpty(modelRuleScoreData)) throw new HttpException(400, 'modelRuleScoreData cannot be blank');

    const tableIdName = 'ModelRuleScore';
    const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(tableIdName);
    const modelRuleScoreId: string = responseTableIdData.tableIdFinalIssued;
    const { ruleGroupId, bayesianModelId, scoreCard } = modelRuleScoreData;
    const ruleGroup = await this.ruleGroup.findOne({ where: { ruleGroupId } });
    if (!ruleGroup) throw new HttpException(400, `Rule group doesn't exit with this id ${ruleGroupId}`);
    const bayesianModel = await this.bayesianModel.findOne({ where: { bayesianModelId } });
    if (!bayesianModel) throw new HttpException(400, `Bayesian model doesn't exit with this id ${bayesianModelId}`);

    const currentDate = new Date();
    const ruleScore = {
      modelRuleScoreId,
      createdBy: systemId,
      createdAt: currentDate,
      updatedAt: currentDate,
      ruleGroupKey: ruleGroup.ruleGroupKey,
      bayesianModelKey: bayesianModel.bayesianModelKey,
      scoreCard,
    };
    const newModelRuleScore: IModelRuleScore = await this.modelRuleScore.create(ruleScore);
    await this.metricOpsUtilService.updateBayesianNetwork(bayesianModel.bayesianModelKey);
    return newModelRuleScore;
  }
  /**
   * update a  modelRuleScore i.e attach rule group to bayesian model
   *
   * @param  {AttachRuleGroupDto} modelRuleScoreData
   * @returns Promise<IModelRuleScore>
   * @author Shrishti Raj
   */
  public async updateAttachRuleGroup(modelRuleScoreData: AttachRuleGroupDto, modelRuleScoreId: string, systemId: string): Promise<IModelRuleScore> {
    if (isEmpty(modelRuleScoreData)) throw new HttpException(400, 'modelRuleScoreData cannot be blank');
    const { ruleGroupId, bayesianModelId, scoreCard } = modelRuleScoreData;
    const ruleGroup = await this.ruleGroup.findOne({ where: { ruleGroupId } });
    if (!ruleGroup) throw new HttpException(400, `Rule group doesn't exit with this id ${ruleGroupId}`);
    const bayesianModel = await this.bayesianModel.findOne({ where: { bayesianModelId } });
    if (!bayesianModel) throw new HttpException(400, `Bayesian model doesn't exit with this id ${bayesianModelId}`);

    const currentDate = new Date();
    const ruleScore = {
      updatedBy: systemId,
      updatedAt: currentDate,
      ruleGroupKey: ruleGroup.ruleGroupKey,
      bayesianModelKey: bayesianModel.bayesianModelKey,
      scoreCard,
    };
    const newModelRuleScore: any = await this.modelRuleScore.update(ruleScore, { where: { modelRuleScoreId } });
    await this.metricOpsUtilService.updateBayesianNetwork(bayesianModel.bayesianModelKey);
    return newModelRuleScore;
  }

  /**
   * Detach  rule group to bayesian model
   *
   * @param  {DetachRuleGroupDto} modelRuleScoreData
   * @returns Promise<IModelRuleScore>
   * @author Shrishti Raj
   */
  public async detachRuleGroup(ruleGroupId: string, bayesianModelId: string, systemId: string): Promise<any> {
    const currentDate = new Date();
    const ruleGroupDetail = await this.ruleGroup.findOne({ where: { ruleGroupId } });
    const modelDetail = await this.bayesianModel.findOne({ where: { bayesianModelId } });
    const findData = await this.modelRuleScore.update(
      { deletedAt: currentDate },
      { where: { ruleGroupKey: ruleGroupDetail.ruleGroupKey, bayesianModelKey: modelDetail.bayesianModelKey } },
    );

    return findData;
  }
  /**
   * get score of   rule group to bayesian model
   *
   * @param  {ruleGroupId} ruleGroupId
   * @returns Promise<IModelRuleScore>
   * @author Shrishti Raj
   */
  public async getModelScoreByGroupId(ruleGroupId: string, bayesianModelId: string): Promise<IModelRuleScore> {
    const ruleGroupDetail = await this.ruleGroup.findOne({ where: { ruleGroupId } });
    const modelDetail = await this.bayesianModel.findOne({ where: { bayesianModelId } });
    const findData = await this.modelRuleScore.findOne({
      where: {
        ruleGroupKey: ruleGroupDetail.ruleGroupKey,
        bayesianModelKey: modelDetail.bayesianModelKey,
        deletedAt: null,
      },
      include: [{ model: BayesianModelTable }],
    });

    if (!findData) throw new HttpException(400, "Model Rule Score  doesn't exist");
    return findData;
  }

  /**
   * get score of rule group by Bayesian model key
   *
   * @param  bayesianModelId
   * @returns Promise<IModelRuleScore>
   * @author Jerry Lee
   */
  public async getModelScoreByBayesianModelKey(bayesianModelKey: number): Promise<IModelRuleScore[]> {
    const findData = await this.modelRuleScore.findAll({
      where: {
        bayesianModelKey: bayesianModelKey,
        deletedAt: null,
      },
    });

    if (!findData) throw new HttpException(400, "Model Rule Score  doesn't exist");
    return findData;
  }

  /**
   * get all bayesinaModel attach to rulegroup
   *
   * @param  {ruleGroupId} ruleGroupId
   * @returns Promise<IModelRuleScore>
   * @author Shrishti Raj
   */
  public async getAllModelsByGroupId(ruleGroupId: string): Promise<any> {
    const ruleGroupDetail = await this.ruleGroup.findOne({ where: { ruleGroupId } });
    console.log('ruleGroupDetail', ruleGroupDetail);
    const findData = await this.modelRuleScore.findOne({
      where: {
        ruleGroupKey: ruleGroupDetail?.ruleGroupKey,
      },
      include: [{ model: BayesianModelTable }],
    });

    if (!findData) return { message: 'No bayesian model used this Group' };
    return findData;
  }

  /**
   * get all ruleGroups attached under model
   *
   * @param  {string} bayesianModelId
   * @returns Promise<IModelRuleScore>
   * @author Jerry Lee
   */
  public async getAllRuleGroupsByModelId(bayesianModelId: string): Promise<any> {
    const findBayesianModel = await this.bayesianModel.findOne({ where: { bayesianModelId } });

    const bayesianModelKey = findBayesianModel.bayesianModelKey;
    const findData = await this.modelRuleScore.findAll({
      where: {
        bayesianModelKey: bayesianModelKey,
        deletedAt: null,
      },
      include: [{ model: BayesianModelTable }],
    });
    if (!findData) return { message: 'No rule group under the Bayesian Model' };
    return findData;
  }
}

export default ModelRuleScoreService;
