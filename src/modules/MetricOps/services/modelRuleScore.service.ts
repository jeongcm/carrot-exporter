import { IModelRuleScore } from '@/common/interfaces/modelRuleScore.interface';
import DB from '@/database';
import { AttachRuleGroupDto, DetachRuleGroupDto } from '../dtos/modelRuleScore.dto';
import { isEmpty } from '@/common/utils/util';
import { HttpException } from '@/common/exceptions/HttpException';
import CustomerAccountService from '@/modules/CustomerAccount/services/customerAccount.service';
import TableIdService from '@/modules/CommonService/services/tableId.service';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
import { Bool } from 'aws-sdk/clients/clouddirectory';

class ModelRuleScoreService {
    public modelRuleScore = DB.ModelRuleScore;
    public ruleGroup = DB.RuleGroup;
    public bayesianModel = DB.BayesianModel;
    public customerAccountService = new CustomerAccountService();
    public tableIdService = new TableIdService();

    /**
     * Create a new modelRuleScore i.e attach rule group to bayesian model
     *
     * @param  {AttachRuleGroupDto} modelRuleScoreData
     * @returns Promise<IModelRuleScore>
     * @author Shrishti Raj
     */
    public async attachRuleGroup(
        modelRuleScoreData: AttachRuleGroupDto,
        systemId: string,
    ): Promise<IModelRuleScore> {
        if (isEmpty(modelRuleScoreData)) throw new HttpException(400, 'modelRuleScoreData cannot be blank');


        const tableIdName: string = 'ModelRuleScore';
        const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(tableIdName);
        const modelRuleScoreId: string = responseTableIdData.tableIdFinalIssued;
        const { ruleGroupId, bayesianModelId, scoreCard } = modelRuleScoreData
        const ruleGroup = await this.ruleGroup.findOne({where:{ruleGroupId}});
        if (!ruleGroup) throw new HttpException(400, `Rule group doesn't exit with this id ${ruleGroupId}`);
        const bayesianModel = await this.bayesianModel.findOne({where:{bayesianModelId}});
        if (!bayesianModel) throw new HttpException(400, `Bayesian model doesn't exit with this id ${bayesianModelId}`);

        const currentDate = new Date();
        const ruleScore = {
            modelRuleScoreId,
            createdBy: systemId,
            createdAt: currentDate,
            updatedAt: currentDate,
            ruleGroupKey:ruleGroup.ruleGroupKey,
            bayesianModelKey:bayesianModel.bayesianModelKey,
            scoreCard
        };
        const newModelRuleScore: IModelRuleScore = await this.modelRuleScore.create(ruleScore);
        return newModelRuleScore;
    }

    /**
     * Detach  rule group to bayesian model
     *
     * @param  {DetachRuleGroupDto} modelRuleScoreData
     * @returns Promise<IModelRuleScore>
     * @author Shrishti Raj
     */
     public async detachRuleGroup(
        modelRuleScoreData: DetachRuleGroupDto,
        systemId: string,
    ): Promise<Boolean> {
        if (isEmpty(modelRuleScoreData)) throw new HttpException(400, 'modelRuleScoreData cannot be blank');
        const { ruleGroupId, bayesianModelId, modelRuleScoreId } = modelRuleScoreData;
        const findData = await this.modelRuleScore.findOne({where:{modelRuleScoreId}})
        if(!findData) throw new HttpException(400, "Model Rule Score  doesn't exist");
        const currentDate = new Date();;
        await this.modelRuleScore.update({deletedAt:currentDate},{where:{modelRuleScoreId}});
        return true;
    }

    
}

export default ModelRuleScoreService;
