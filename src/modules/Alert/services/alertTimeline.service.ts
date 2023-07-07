import {DB} from '@/database';
import chalk from 'chalk';
import { QueryTypes } from "sequelize";
import { logger } from '@/common/utils/logger';
import { IAlertReceived } from '@/common/interfaces/alertReceived.interface';
import { IAlertTimeline } from '@/common/interfaces/alertTimeline.interface';
import { IResource } from '@/common/interfaces/resource.interface';


const FIRING_STATE = 'firing';
class AlertTimelineProcessService {
  private alertTimeline = DB.AlertTimeline;
  private resource = DB.Resource;

  // MAIN: this is the main method
  public async processAlertTimeline(customerAccountKey: number) {
    const started = Date.now();

    // STEP 1. Get target alertReceiveds using OVER PARTITION BY
    const alertReceiveds: IAlertReceived[] = await this.getLatestAlertReceivedPerGroup(customerAccountKey);

    console.log(alertReceiveds)
    // STEP 2: get all the timelines as objects to compare to mimic the "upsert"
    // we will recycle this data to create notification so to make it cheaper
    let timelines: IAlertTimeline[] = await this.getAlertTimelines(customerAccountKey);

    const timelinesProcessed = timelines?.length;

    console.log(timelines)
    // STEP 3: get new timeline to create, to resolve and to delete
    const { timelinesToCreate, timelineKeysToResolve, timelineKeysToDelete, timelineKeysToEndAsPending } =
      await this.processTimelineAgainstAlertReceiveds(customerAccountKey, alertReceiveds, timelines);

    // STEP 4: DB Operations
    // STEP 4-1: If there are new timelines to create, then create
    let timelinesCreated: any[] = [];
    if (timelinesToCreate.length > 0) {
      // TODO: handle failure
      timelinesCreated = await this.alertTimeline.bulkCreate(timelinesToCreate, {
        returning: [
          'alertTimelineKey',
          'alertTimelineHash',
          'alertRuleId',
          'alertRuleKey',
          'alertRuleName',
          'alertRuleGroup',
          'resourceGroupKey',
          'resourceGroupName',
          'resourceGroupUuid',
          'alertReceivedNamespace',
          'alertReceivedNode',
          'alertReceivedService',
          'alertReceivedPod',
          'alertReceivedInstance',
          'alertReceivedPersistentvolumeclaim',
          'alertReceivedAffectedResourceType',
          'alertReceivedAffectedResourceName',
        ],
      });
      timelines = [...timelines, ...timelinesCreated.map((item: any) => item.dataValues)];
    }

    // STEP 4-2. If there are timelines to resolve, then resolve using bulk update.
    // NOTE: with bulk update you can't save alertReceivedId resolving the timeline.
    // but we might not need it.
    let resolvedUpdateResult: any[] = [];

    if (timelineKeysToResolve.length > 0) {
      // TODO: handle failure
      resolvedUpdateResult = await this.alertTimeline.update(
        {
          alertTimelineEndAt: new Date(),
          alertTimelineState: 'resolved',
        },
        {
          where: {
            customerAccountKey,
            alertTimelineKey: timelineKeysToResolve,
          },
        },
      );
    }

    // STEP 4-3. We add alertTimelineEndAt to 'pending' timelines that are
    // escalated to 'firing'
    if (timelineKeysToEndAsPending.length > 0) {
      // TODO: handle failure
      resolvedUpdateResult = await this.alertTimeline.update(
        {
          alertTimelineEndAt: new Date(),
          alertTimelineState: 'resolved',
        },
        {
          where: {
            customerAccountKey,
            alertTimelineKey: timelineKeysToEndAsPending,
          },
        },
      );
    }

    // STEP 4-4. Remove alertTimelines by adding deletedAt
    let deletedUpdateResult: any[] = [];
    if (timelineKeysToDelete.length > 0) {
      // TODO: handle failure
      deletedUpdateResult = await this.alertTimeline.update(
        {
          alertTimelineEndAt: new Date(),
          deletedAt: new Date(),
          deletedBy: 'NC_NOTI_SYSTEM',
        },
        {
          where: {
            customerAccountKey,
            alertTimelineKey: timelineKeysToDelete,
          },
        },
      );
    }

    const activeTimeLines = timelines.filter(at => timelineKeysToResolve.indexOf(at.alertTimelineKey) === -1);

    if (deletedUpdateResult[0] || resolvedUpdateResult[0] || timelinesCreated.length || activeTimeLines.length) {
      logger.info(
        `${chalk.green('PROCESSED')} (key: ${customerAccountKey}): ${chalk.red(`${deletedUpdateResult[0] || 0} CANCELLED`)} ${chalk.green(
          `${resolvedUpdateResult[0] || 0} RESOLVED`,
        )} ${chalk.blue(`${timelinesCreated.length} NEW`)} ${chalk.cyan(`${activeTimeLines.length} ACTIVE`)} in total to be scheduled (time ${
          Date.now() - started
        }ms)`,
      );
    } else {
      // MUTED
      // logger.info(`${chalk.green('PROCESSED')} (key: ${customerAccountKey}): Nothing is processed (time ${Date.now() - started}ms)`);
    }


    // console.log('#DEBUG 1. activeTimeLines ------------------------------', JSON.stringify(activeTimeLines));
    // this.alertNotiSchedulerService.scheduleAlertNotiFromAlertTimelines(customerAccountKey, activeTimeLines);
  }

  private async getLatestAlertReceivedPerGroup(customerAccountKey: number): Promise<IAlertReceived[]> {
    const start = Date.now();

    let query = `WITH recent_alerts AS (
      SELECT m.*, ROW_NUMBER() OVER (
        PARTITION BY alert_received_name, alert_rule_key, alert_received_namespace, alert_received_node, alert_received_service, alert_received_pod, alert_received_persistentvolumeclaim, alert_received_state, alert_received_affected_resource_type, alert_received_affected_resource_name, alert_received_hash
        ORDER BY alert_received_active_at DESC) AS rn
        FROM AlertReceived AS m
        WHERE customer_account_key = ${customerAccountKey} AND deleted_at IS NULL AND alert_received_hash IS NOT NULL
      )
      SELECT
        recent_alerts.alert_received_key as alertReceivedKey,
        recent_alerts.alert_received_id as alertReceivedId,
        recent_alerts.created_at as createdAt,
        recent_alerts.updated_at as updatedAt,
        recent_alerts.alert_received_active_at as alertReceivedActiveAt,
        recent_alerts.alert_received_name as alertReceivedName,
        recent_alerts.alert_received_value as alertReceivedValue,
        recent_alerts.alert_received_state as alertReceivedState,
        recent_alerts.alert_received_namespace as alertReceivedNamespace,
        recent_alerts.alert_received_severity as alertReceivedSeverity,
        recent_alerts.alert_received_description as alertReceivedDescription,
        recent_alerts.alert_received_summary as alertReceivedSummary,
        recent_alerts.alert_received_active_at as alertReceivedActive,
        recent_alerts.alert_received_node as alertReceivedNode,
        recent_alerts.alert_received_service as alertReceivedService,
        recent_alerts.alert_received_pod as alertReceivedPod,
        recent_alerts.alert_received_instance as alertReceivedInstance,
        recent_alerts.alert_received_persistentvolumeclaim as alertReceivedPersistentvolumeclaim,
        recent_alerts.alert_received_affected_resource_name as alertReceivedAffectedResourceName,
        recent_alerts.alert_received_affected_resource_type as alertReceivedAffectedResourceType,
        recent_alerts.alert_received_labels as alertReceivedLabels,
        recent_alerts.alert_received_pinned as alertReceivedPinned,
        recent_alerts.alert_received_hash as alertReceivedHash,
        recent_alerts.deleted_at as deletedAt,
        JSON_OBJECT(
          'alertRuleId', AlertRule.alert_rule_id,
          'alertRuleKey', AlertRule.alert_rule_key,
          'alertRuleName', AlertRule.alert_rule_name,
          'alertRuleGroup', AlertRule.alert_rule_group,
          'deletedAt', AlertRule.deleted_at
        ) AS alertRule,
        JSON_OBJECT(
          'customerAccountKey', ResourceGroup.customer_account_key,
          'resourceGroupKey', ResourceGroup.resource_group_key,
          'resourceGroupUuid', ResourceGroup.resource_group_uuid,
          'resourceGroupId', ResourceGroup.resource_group_id,
          'resourceGroupName', ResourceGroup.resource_group_name,
          'resourceGroupDeletedAt', ResourceGroup.deleted_at
        ) AS resourceGroup
      FROM recent_alerts
      INNER JOIN AlertRule ON recent_alerts.alert_rule_key = AlertRule.alert_rule_key
      INNER JOIN ResourceGroup ON AlertRule.resource_group_uuid = ResourceGroup.resource_group_uuid
      WHERE rn = 1
      GROUP BY recent_alerts.alert_received_namespace, recent_alerts.alert_received_node, recent_alerts.alert_received_service, recent_alerts.alert_received_pod, recent_alerts.alert_received_persistentvolumeclaim, recent_alerts.alert_received_instance, recent_alerts.alert_received_state, recent_alerts.alert_rule_key, recent_alerts.alert_received_affected_resource_type, recent_alerts.alert_received_affected_resource_name, recent_alerts.alert_received_hash
      ORDER BY recent_alerts.alert_received_active_at DESC;
    `
    const alertReceiveds = await DB.sequelize.query(query, { type: QueryTypes.SELECT });

    if (alertReceiveds && alertReceiveds.length > 0) {
      return alertReceiveds as IAlertReceived[];
    } else {
      return [];
    }
  }

  private async getAlertTimelines(customerAccountKey: number): Promise<IAlertTimeline[]> {
    const start = Date.now();

    const timelinesResult = await this.alertTimeline.findAll({
      where: {
        customerAccountKey,
        deletedAt: null,
        alertTimelineEndAt: null,
      },
      attributes: [
        'alertTimelineKey',
        'alertTimelineHash',
        'alertTimelineState',
        'alertTimelineOriginalState',
        'alertRuleId',
        'alertRuleKey',
        'alertRuleName',
        'alertRuleGroup',
        'resourceGroupKey',
        'resourceGroupName',
        'resourceGroupUuid',
        'alertReceivedNamespace',
        'alertReceivedNode',
        'alertReceivedService',
        'alertReceivedPod',
        'alertReceivedPersistentvolumeclaim',
        'alertReceivedSeverity',
        'alertReceivedAffectedResourceType',
        'alertReceivedAffectedResourceName',
        'alertReceivedInstance',
        'deletedAt',
        'alertTimelineEndAt',
      ],
      raw: true,
    });

    return timelinesResult;
  }

  private async processTimelineAgainstAlertReceiveds(customerAccountKey: number, alertReceiveds: IAlertReceived[], timelines: IAlertTimeline[]) {
    const timelinePerHash = {};
    timelines.forEach(hs => {
      timelinePerHash[hs.alertTimelineHash] = hs;
    });

    const timelineKeysToResolve = [];
    const timelineKeysToDelete = [];
    const timelineKeysToEndAsPending = [];

    // podsMissingServicesHash and epWhere are only used to get pods missing services
    // TODO: use JSON_CONTAINS to narrow down the query and make sure it performs
    const podsMissingServicesHash = {};
    const epWhere = {
      where: {
        resourceGroupKey: [],
        resourceNamespace: [],
        resourceType: ['EP'],
      },
      attributes: ['resourceGroupKey', 'resourceNamespace', 'resourceName', 'resourceEndpoint'],
      raw: true,
    };
    let newTimelines = {};

    // STEP 3: create new alertTimeline objects by comparing alertTimelineHashs
    // TODO: consider using HashBytes to save the hash?
    alertReceiveds.forEach((item: any, index) => {
      if (!item.alertReceivedState) {
        return;
      }

      if (typeof item.alertRule === 'string') {
        try {
          item.alertRule = JSON.parse(item.alertRule);
        } catch (e) {
          item.alertRule = {};
        }
      }

      let resourceGroup = item.resourceGroup || {};

      if (typeof resourceGroup === 'string') {
        try {
          resourceGroup = JSON.parse(resourceGroup);
        } catch (e) {
          resourceGroup = {};
        }
      }

      const alertRuleId = item.alertRule?.alertRuleId;
      const customerAccountKey = resourceGroup?.customerAccountKey;
      const resourceGroupKey = resourceGroup?.resourceGroupKey;
      const resourceGroupUuid = resourceGroup?.resourceGroupUuid;
      const alertReceivedNamespace = item.alertReceivedNamespace;
      const alertTimelineHash = item.alertReceivedHash;

      // 3-0: When there is no alertReceivedHash, it's not a healthy alert
      if (!alertTimelineHash) {
        return;
      }

      const { alertTimelineKey, alertTimelineState } = timelinePerHash[alertTimelineHash] || {};

      // TODO 3-1: if alertTimelineKey DOES NOT exist, it means that there is NO alertTimelines realted to this alertReceived
      // which means it is now irrelvant. We will delete timelinePerHash that's irrevant and then deal with the leftovers.

      // STEP 3-2. We collect all the pods that have no service names per resourceGroupKey
      if (item.alertReceivedPod && !item.alertReceivedService) {
        if (epWhere.where.resourceGroupKey.indexOf(resourceGroupKey) === -1) {
          epWhere.where.resourceGroupKey.push(resourceGroupKey);
        }
        if (epWhere.where.resourceNamespace.indexOf(alertReceivedNamespace) === -1) {
          epWhere.where.resourceNamespace.push(alertReceivedNamespace);
        }
        if (!podsMissingServicesHash[`${resourceGroupKey}:${alertReceivedNamespace}:${item.alertReceivedPod}`]) {
          podsMissingServicesHash[`${resourceGroupKey}:${alertReceivedNamespace}:${item.alertReceivedPod}`] = alertTimelineHash;
        }
      }

      // STEP 3-3. We collect timelines to be deleted, whose resourceGroup or alertRule are deleted
      if (resourceGroup?.deletedAt || item.alertRule?.deletedAt) {
        if (alertTimelineKey) {
          if (timelineKeysToDelete.indexOf(alertTimelineKey) === -1) {
            timelineKeysToDelete.push(alertTimelineKey);
          }
        }
        return;
      }

      if (item.alertReceivedState === 'resolved') {
        // STEP 3-4. We collect 'resolved' timelines
        if (alertTimelineKey) {
          timelineKeysToResolve.push(alertTimelineKey);
        }
        return;
      }

      // STEP 3-5. We collect 'pending' timeline whose related alertReceived just turned 'firing'
      if (alertTimelineState === 'pending' && item.alertReceivedState === 'firing') {
        if (alertTimelineKey) {
          timelineKeysToEndAsPending.push(alertTimelineKey);
        }
        // IMPORTNAT: this cluase falls through
      }

      // STEP 3-6. Collect alertTimelines to be created
      if (!alertTimelineKey) {
        newTimelines[alertTimelineHash] = {
          alertTimelineOriginalState: item.alertReceivedState,
          alertTimelineState: item.alertReceivedState,
          alertTimelineStartAt: item.alertReceivedActiveAt,
          customerAccountKey,
          alertTimelineHash,
          resourceGroupKey,
          resourceGroupName: resourceGroup?.resourceGroupName,
          resourceGroupUuid,
          alertReceivedIdStart: item.alertReceivedId,
          alertReceivedHash: item.alertReceivedHash,
          alertReceivedName: item.alertReceivedName,
          alertReceivedNamespace,
          alertReceivedNode: item.alertReceivedNode,
          alertReceivedService: item.alertReceivedService,
          alertReceivedPod: item.alertReceivedPod,
          alertReceivedSeverity: item.alertReceivedSeverity,
          alertReceivedInstance: item.alertReceivedInstance,
          alertReceivedPersistentvolumeclaim: item.alertReceivedPersistentvolumeclaim,
          alertReceivedAffectedResourceType: item.alertReceivedAffectedResourceType || 'NA',
          alertReceivedAffectedResourceName: item.alertReceivedAffectedResourceName || 'NA',
          alertRuleId,
          alertRuleKey: item.alertRule?.alertRuleKey,
          alertRuleName: item.alertRule?.alertRuleName,
          alertRuleGroup: item.alertRule?.alertRuleGroup,
          createdBy: 'NC_NOTI_SYSTEM',
          updatedBy: 'NC_NOIT_SYSTEM',
        };
      }
    });

    // STEP 3-5: if alertReceived have pods but no services, we extract services using endpoint(EP) resource
    if (Object.keys(podsMissingServicesHash).length > 0) {
      const eps: IResource[] = await this.resource.findAll(epWhere);
      newTimelines = await this.addServicesToTimelines(customerAccountKey, newTimelines, eps, podsMissingServicesHash);
    }

    const timelinesToCreate = Object.values(newTimelines);

    return {
      timelinesToCreate,
      timelineKeysToDelete,
      timelineKeysToResolve,
      timelineKeysToEndAsPending,
    };
  }

  private async addServicesToTimelines(
    customerAccountKey: number,
    newTimelines: { [key: string]: IAlertTimeline },
    eps: IResource[],
    podsMissingServicesHash: any,
  ) {
    const start = Date.now();

    const podWhere = {
      where: {
        resourceGroupKey: [],
        resourceNamespace: [],
        resourceType: ['PD'],
        resourceTargetUuid: [],
      },
      attributes: ['resourceGroupKey', 'resourceNamespace', 'resourceTargetUuid', 'resourceName'],
      raw: true,
    };

    const epNamePerHashWithUid = {};

    (eps || []).forEach((ep: any) => {
      (ep.resourceEndpoint || []).forEach((ref: any) => {
        (ref.addresses || []).forEach((address: any) => {
          if (!address?.targetRef?.uid) return;

          if (podWhere.where.resourceGroupKey.indexOf(ep.resourceGroupKey) === -1) {
            podWhere.where.resourceGroupKey.push(ep.resourceGroupKey);
          }

          if (podWhere.where.resourceNamespace.indexOf(ep.resourceNamespace) === -1) {
            podWhere.where.resourceNamespace.push(ep.resourceNamespace);
          }

          if (podWhere.where.resourceTargetUuid.indexOf(address.targetRef.uid) === -1) {
            podWhere.where.resourceTargetUuid.push(address.targetRef.uid);
          }
          epNamePerHashWithUid[`${ep.resourceGroupKey}:${ep.resourceNamespace}:${address.targetRef?.uid}`] = ep.resourceName;
        });
      });
    });

    const pods = await this.resource.findAll(podWhere);

    (pods || []).forEach((pod: any) => {
      const hash = podsMissingServicesHash[`${pod.resourceGroupKey}:${pod.resourceNamespace}:${pod.resourceName}`];
      const serviceName = epNamePerHashWithUid[`${pod.resourceGroupKey}:${pod.resourceNamespace}:${pod.resourceTargetUuid}`];
      if (hash && newTimelines[hash] && serviceName) {
        newTimelines[hash].alertReceivedService = serviceName;
        logger.info(`insert service name for ${hash}, service name: ${serviceName}`);
      }
    });

    return newTimelines;
  }
}

export default AlertTimelineProcessService;
