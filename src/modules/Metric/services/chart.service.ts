import { HttpException } from '@/common/exceptions/HttpException';
import { isEmpty } from '@/common/utils/util';
import DB from '@/database';
import sequelize, { Op } from 'sequelize';
import ServiceExtension from '@/common/extentions/service.extension';
import { IChart } from 'common/interfaces/chart.interface';

class ChartService extends ServiceExtension {
  public chart = DB.Chart;

  constructor() {
    super({
      tableName: 'Chart',
    });
  }

  public async getAllCharts(customerAccountKey: number): Promise<IChart[]> {
    const charts: IChart[] = await this.chart.findAll({
      where: { customerAccountKey: customerAccountKey, deletedAt: null },
      attributes: { exclude: ['customerAccountKey', 'deletedAt', 'updatedBy', 'createdBy'] },
      raw: true,
    });
    return charts.map((chart: IChart) => {
      if (chart?.configJson) {
        try {
          chart.configJson = JSON.parse(chart.configJson);
        } catch (e) {
          this.throwError('EXCEPTION', `${e}`);
        }
      }
      return chart;
    });
  }

  public async getResourceGroupChart(customerAccountKey: number, resourceGroupKey: number): Promise<IChart> {
    const chart: IChart = await this.chart.findOne({
      where: { customerAccountKey: customerAccountKey, resourceGroupKey, resourceKey: null, deletedAt: null },
      attributes: { exclude: ['customerAccountKey', 'resourceGroupKey', 'deletedAt', 'updatedBy', 'createdBy'] },
      raw: true,
    });

    if (chart?.configJson) {
      try {
        chart.configJson = JSON.parse(chart.configJson);
      } catch (e) {
        this.throwError('EXCEPTION', `${e}`);
      }
    }

    return chart;
  }

  public async upsertResourceGroupChart(customerAccountKey: number, resourceGroupKey: number, createdBy: string, configJsonObj: any): Promise<any> {
    const chart: IChart = await this.getResourceGroupChart(customerAccountKey, resourceGroupKey);

    let configJson = '';

    try {
      configJson = JSON.stringify(configJsonObj || {});
    } catch (e) {
      this.throwError('EXCEPTION', `Corrupt JSON format. Failed to stringify configJson`);
    }

    if (!chart) {
      const chartId = await this.createTableId();

      const result = await this.chart.create({
        chartId,
        resourceGroupKey,
        customerAccountKey,
        configJson: configJson || '{}',
        createdBy,
      });

      return {
        mode: 'create',
        result,
      };
    }

    const result = await this.chart.update(
      {
        configJson: configJson || '{}',
      },
      {
        where: {
          chartKey: chart.chartKey,
        },
      },
    );

    return {
      mode: 'update',
      result,
    };
  }
}

export default ChartService;
