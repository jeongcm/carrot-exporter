import DB from '@/database';
import TableIdService from '@/modules/CommonService/services/tableId.service';
import { logger } from '@/common/utils/logger';
import config from '@config/index';
import pluck from 'lodash/map';
import axios from 'common/httpClient/axios';

class MetricOpsUtilService {
  public modelRuleScore = DB.ModelRuleScore;
  public ruleGroup = DB.RuleGroup;
  public bayesianModel = DB.BayesianModel;
  public tableIdService = new TableIdService();

  public async updateBayesianNetwork(bayesianModelKey: number): Promise<object> {
    try {
      const searchModel = {
        where: {
          bayesianModelKey,
          deletedAt: null,
        },
      };
      const resultModelSearch = await this.modelRuleScore.findAll(searchModel);
      const bayesianModel: any = await this.bayesianModel.findOne(searchModel);
      const bayesianModelId = bayesianModel?.standardModelId || bayesianModel?.bayesianModelId;
      if (resultModelSearch && resultModelSearch.length && bayesianModel?.bayesianModelScoreCard) {
        const mappingTo = {},
          mappingFrom = {},
          alerts = {},
          alertGroups = [],
          cptInfo = [];
        let count = 0;
        const version = 1;
        resultModelSearch.map((item: any) => {
          const name = (item?.scoreCard?.ruleGroupScoreModel?.ruleGroupName).replace(/ /g, '').toLowerCase();
          alertGroups.push(item?.scoreCard?.ruleGroupScoreModel?.ruleGroupName);
          item?.scoreCard?.ruleGroupScoreModel?.rules.map((rule: any) => {
            const alertList = [];
            mappingTo[count.toString()] = item?.scoreCard?.ruleGroupScoreModel?.ruleGroupName;
            alerts[count.toString()] = rule.ruleName;
            mappingFrom[count.toString()] = rule.ruleName;
            alertList.push(rule.ruleName);
            count++;
          });
          cptInfo.push({
            cptName: `cpt_${name}`,
            ruleGroupName: item?.scoreCard?.ruleGroupScoreModel?.ruleGroupName,
            alertList: pluck(item?.scoreCard?.ruleGroupScoreModel?.rules, 'ruleName'),
            cptValue0:
              item?.scoreCard?.ruleGroupScoreModel?.ruleGroupScores[1].ruleGroupScoreName === 'Failure'
                ? item?.scoreCard?.ruleGroupScoreModel?.ruleGroupScores[1].ruleGroupScore
                : [],
            cptValue1:
              item?.scoreCard?.ruleGroupScoreModel?.ruleGroupScores[0].ruleGroupScoreName === 'Ready'
                ? item?.scoreCard?.ruleGroupScoreModel?.ruleGroupScores[0].ruleGroupScore
                : [],
          });
        });
        bayesianModel?.bayesianModelScoreCard?.bayesianModelScoreModel?.rulesGroups.map((ruleGrp: any) => {
          mappingFrom[count.toString()] = ruleGrp?.ruleName;
          mappingTo[count.toString()] = bayesianModel?.bayesianModelName;
          count++;
        });
        cptInfo.push({
          cptName: `cpt_${bayesianModel.bayesianModelName.replace(/ /g, '').toLowerCase()}`,
          ruleGroupName: bayesianModel?.bayesianModelName,
          alertList: pluck(bayesianModel?.bayesianModelScoreCard?.bayesianModelScoreModel?.rulesGroups, 'ruleName'),
          cptValue0:
            bayesianModel?.bayesianModelScoreCard?.bayesianModelScoreModel?.bayesianModelScores[1].bayesianModelScoreName === 'Failure'
              ? bayesianModel?.bayesianModelScoreCard?.bayesianModelScoreModel?.bayesianModelScores[1].bayesianModelScore
              : bayesianModel?.bayesianModelScoreCard?.bayesianModelScoreModel?.bayesianModelScores[0].bayesianModelScore,
          cptValue1:
            bayesianModel?.bayesianModelScoreCard?.bayesianModelScoreModel?.bayesianModelScores[0].bayesianModelScoreName === 'Ready'
              ? bayesianModel?.bayesianModelScoreCard?.bayesianModelScoreModel?.bayesianModelScores[0].bayesianModelScore
              : bayesianModel?.bayesianModelScoreCard?.bayesianModelScoreModel?.bayesianModelScores[1].bayesianModelScore,
        });

        const bnData = {
          bayesianModelId: bayesianModelId,
          version: `v0.${version + 1}`,
          alerts,
          alert_groups: alertGroups,
          final_stage: [bayesianModel?.bayesianModelName],
          mappingFrom,
          mappingTo,
          cptInfo,
        };
        const url = config.ncBnApiDetail.ncBnUrl + config.ncBnApiDetail.ncBnRefreshModelPath;
        await axios.post(url, bnData);
        return { message: `[BN Model added or modified,${bayesianModel?.bayesianModelId}]` };
      } else {
        return;
      }
    } catch (error) {
      logger.error(`error=============================${error}`);
      console.log('errorr', error);
    }
  }
}

export default MetricOpsUtilService;
