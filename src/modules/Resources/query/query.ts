import getRegionListQuery from '@modules/Resources/query/ncp/region/region';
import getNetworkInterfaceListQuery from '@modules/Resources/query/ncp/networkInterface/networkInterface';
import getServerInstanceListQuery from '@modules/Resources/query/ncp/serverInstance/serverInstance';
import getInitScriptListQuery from '@modules/Resources/query/ncp/initScript/initScript';
import getPlacementGroupListQuery from '@modules/Resources/query/ncp/placementGroup/placementGroup';
import getMemberServerImageListQuery from '@modules/Resources/query/ncp/serverImage/serverImage';
import getBlockStorageInstanceListQuery from '@modules/Resources/query/ncp/blockStorageInstance/blockStorageInstance';
import getPublicIpInstanceListQuery from '@modules/Resources/query/ncp/publicIpInstance/publicIpInstance';
import getAccessControlGroupListQuery from '@modules/Resources/query/ncp/accessControlGroup/accessControlGroup';
import getBlockStorageSnapshotInstanceListQuery from '@modules/Resources/query/ncp/blockStorageSnapshotInstance/blockStorageSnapshotInstance';
import getEventListQuery from '@modules/Resources/query/k8s/event';
import getConfigMapListQuery from '@modules/Resources/query/k8s/configMap';
import getServiceListQuery from '@modules/Resources/query/k8s/service';
import getNodeListQuery from '@modules/Resources/query/k8s/node';
import getNamespaceListQuery from '@modules/Resources/query/k8s/namespace';
import getPodListQuery from '@modules/Resources/query/k8s/pod';
import getDeploymentListQuery from '@modules/Resources/query/k8s/deployment';
import getStatefulSetListQuery from '@modules/Resources/query/k8s/statefulSet';
import getDaemonSetListQuery from '@modules/Resources/query/k8s/daemonSet';
import getReplicaSetListQuery from '@modules/Resources/query/k8s/replicaSet';
import getPersistentVolumeClaimListQuery from '@modules/Resources/query/k8s/persistentVolumeClaim';
import getSecretListQuery from '@modules/Resources/query/k8s/secret';
import getEndpointListQuery from '@modules/Resources/query/k8s/endpoint';
import getIngressListQuery from '@modules/Resources/query/k8s/ingress';
import getPersistentVolumeListQuery from '@modules/Resources/query/k8s/persistentVolume';
import getStorageClassListQuery from '@modules/Resources/query/k8s/storageClass';
import getJobListQuery from '@modules/Resources/query/k8s/job';
import getCronJobListQuery from '@modules/Resources/query/k8s/cronJob';
import getProjectListQuery from '@modules/Resources/query/openstack/project';
import getVirtualMachineListQuery from '@modules/Resources/query/openstack/virtualMachine';
import getContractDemandCostQuery from '@/modules/Cost/query/ncp/contractDemandCost';
import getContractUsageQuery from '@modules/Cost/query/ncp/contractUsage';
import CloudDBMysqlService from '@modules/Resources/query/ncp/cloudDB/mysql';
import CloudDBMongoDBService from '@modules/Resources/query/ncp/cloudDB/mongoDB';
import CloudDBRedisService from '@modules/Resources/query/ncp/cloudDB/redis';
import CloudDBPostgresqlService from '@modules/Resources/query/ncp/cloudDB/pgsql';
import getResourceQuery from '@modules/Resources/query/ncp/resource/resource';
import getResourceGroupQuery from '@modules/Resources/query/ncp/resourceGroup/resourceGroup';
import { HttpException } from '@common/exceptions/HttpException';
import getProductPriceQuery from '@modules/Cost/query/ncp/productPrice';
import getLoadBalancerQuery from '@modules/Resources/query/ncp/loadBalancer/loadBalancer';
import getNksQuery from '@modules/Resources/query/ncp/nks/nks';
import getNasVolumeQuery from '@modules/Resources/query/ncp/nas/nas';
import getTargetGroupListQuery from '@modules/Resources/query/ncp/targetGroup/targetGroup';
import getRouteTableQuery from '@modules/Resources/query/ncp/routeTable/routeTable';
import getSubnetListQuery from '@modules/Resources/query/ncp/subnet/subnet';
import getVpcListQuery from '@modules/Resources/query/ncp/vpc/vpc';
import getZoneListQuery from '@modules/Resources/query/ncp/zone/zone';
import getDemandCostQuery from '@modules/Cost/query/ncp/demandCost';
import getNetworkAclListQuery from '@modules/Resources/query/ncp/networkAcl/networkAcl';
import getCostRelationCodeList from '@modules/Cost/query/ncp/costRelationCode';
import getNatGatewayListQuery from '@modules/Resources/query/ncp/natGateway/natGateway';

class QueryService {
  public cloudDBMysqlService = new CloudDBMysqlService();
  public cloudDBMongoDBService = new CloudDBMongoDBService();
  public cloudDBRedisService = new CloudDBRedisService();
  public cloudDBPostgresqlService = new CloudDBPostgresqlService();

  public async getResourceQuery(totalMsg, clusterUuid) {
    let queryResult = {};
    const result = totalMsg.result;
    switch (totalMsg.template_uuid) {
      // k8s
      case '00000000000000000000000000000004':
        queryResult = await getNamespaceListQuery(result, clusterUuid);
        break;
      case '00000000000000000000000000000002':
        queryResult = await getPodListQuery(result, clusterUuid);
        break;
      case '00000000000000000000000000001002':
        queryResult = await getDeploymentListQuery(result, clusterUuid);
        break;
      case '00000000000000000000000000001004':
        queryResult = await getStatefulSetListQuery(result, clusterUuid);
        break;
      case '00000000000000000000000000001006':
        queryResult = await getDaemonSetListQuery(result, clusterUuid);
        break;
      case '00000000000000000000000000001008':
        queryResult = await getReplicaSetListQuery(result, clusterUuid);
        break;
      case '00000000000000000000000000000014':
        queryResult = await getSecretListQuery(result, clusterUuid);
        break;
      case '00000000000000000000000000000016':
        queryResult = await getEndpointListQuery(result, clusterUuid);
        break;
      case '00000000000000000000000000000012':
        queryResult = await getPersistentVolumeListQuery(result, clusterUuid);
        break;
      case '00000000000000000000000000003002':
        queryResult = await getStorageClassListQuery(result, clusterUuid);
        break;
      case '00000000000000000000000000005002':
        queryResult = await getJobListQuery(result, clusterUuid);
        break;
      case '00000000000000000000000000005003':
        queryResult = await getCronJobListQuery(result, clusterUuid);
        break;
      case '00000000000000000000000000002002':
        queryResult = await getIngressListQuery(result, clusterUuid);
        break;
      case '00000000000000000000000000000018':
        queryResult = await getPersistentVolumeClaimListQuery(result, clusterUuid);
        break;
      case '00000000000000000000000000000020':
        queryResult = await getServiceListQuery(result, clusterUuid);
        break;
      case '00000000000000000000000000000006':
        queryResult = await getConfigMapListQuery(result, clusterUuid);
        break;
      case '00000000000000000000000000000010':
        queryResult = await getNodeListQuery(result, clusterUuid);
        break;
      case '00000000000000000000000000000008':
        queryResult = await getEventListQuery(result, clusterUuid);
        break;

      // openstack
      case '50000000000000000000000000000002':
        queryResult = await getProjectListQuery(result, clusterUuid);
        break;
      case '50000000000000000000000000000004':
        queryResult = await getVirtualMachineListQuery(result, clusterUuid);
        break;

      // ncp
      case '70000000000000000000000000000001':
      case '70000000000000000000000000000002':
      case '70000000000000000000000000000003':
      case '70000000000000000000000000000004':
      case '70000000000000000000000000000009':
      case '70000000000000000000000000000012':
      case '70000000000000000000000000000006':
      case '70000000000000000000000000000014':
      case '70000000000000000000000000000007':
      case '70000000000000000000000000000015':
      case '70000000000000000000000000000066':
      case '70000000000000000000000000000065':
      case '70000000000000000000000000000040':
      case '70000000000000000000000000000042':
      case 'NCM00000000000000000000000000006':
      case 'NCM00000000000000000000000000007':
      case 'NCM00000000000000000000000000008':
      case 'NCM00000000000000000000000000009':
      case 'NCM00000000000000000000000000010':
      case 'NCM00000000000000000000000000011':
      case 'NCM00000000000000000000000000012':
      case 'NCM00000000000000000000000000013':
      case '70000000000000000000000000000029':
      case 'NCM00000000000000000000000000014':
      case 'NCM00000000000000000000000000015':
      case 'NCM00000000000000000000000000016':
      case '70000000000000000000000000000043':
      case '70000000000000000000000000000045':
      case 'NCM00000000000000000000000000018':
      case 'NCM00000000000000000000000000017':
      case '70000000000000000000000000000016':
      case '70000000000000000000000000000041':
      case 'NCM00000000000000000000000000019':
      case '70000000000000000000000000000028':
      case '70000000000000000000000000000017':
        queryResult = await this.getNcpResourceQuery(totalMsg);
        break;
      default:
        throw new HttpException(400, 'invalid template uuid');
    }

    return queryResult;
  }

  private async getNcpResourceQuery(totalMsg): Promise<any> {
    let queryResult = {};
    const result = totalMsg.result;
    const inputs = totalMsg.inputs;

    const credentialName = inputs.credential_key || inputs.ncp_key || null;

    if (!credentialName) {
      throw new HttpException(400, 'invalid credential name');
    }
    const clusterUuid = credentialName.split('.')[1];
    if (clusterUuid === '') {
      throw new HttpException(400, `invalid cluster uuid from credential name(${credentialName})`);
    }

    switch (totalMsg.template_uuid) {
      // ncp
      case '70000000000000000000000000000001':
        queryResult = await getRegionListQuery(result, clusterUuid);
        break;
      case '70000000000000000000000000000002':
        queryResult = await getZoneListQuery(result, clusterUuid);
        break;
      case '70000000000000000000000000000003':
        queryResult = await getNetworkInterfaceListQuery(result, clusterUuid);
        break;
      case '70000000000000000000000000000004':
        queryResult = await getServerInstanceListQuery(result, clusterUuid);
        break;
      case '70000000000000000000000000000009':
        queryResult = await getAccessControlGroupListQuery(result, clusterUuid);
        break;
      case '70000000000000000000000000000012':
        queryResult = await getPublicIpInstanceListQuery(result, clusterUuid);
        break;
      case '70000000000000000000000000000006':
        queryResult = await getBlockStorageInstanceListQuery(result, clusterUuid);
        break;
      case '70000000000000000000000000000014':
        queryResult = await getBlockStorageSnapshotInstanceListQuery(result, clusterUuid);
        break;
      case '70000000000000000000000000000016':
        queryResult = await getSubnetListQuery(result, clusterUuid);
        break;
      case '70000000000000000000000000000007':
        queryResult = await getMemberServerImageListQuery(result, clusterUuid);
        break;
      case '70000000000000000000000000000015':
        queryResult = await getVpcListQuery(result, clusterUuid);
        break;
      case '70000000000000000000000000000017':
        queryResult = await getNatGatewayListQuery(result, clusterUuid);
        break;
      case '70000000000000000000000000000028':
        queryResult = await getTargetGroupListQuery(result, clusterUuid);
        break;
      case '70000000000000000000000000000066':
        queryResult = await getPlacementGroupListQuery(result, clusterUuid);
        break;
      case '70000000000000000000000000000065':
        queryResult = await getInitScriptListQuery(result, clusterUuid);
        break;
      case '70000000000000000000000000000040':
        queryResult = await getContractDemandCostQuery(result, clusterUuid);
        break;
      case '70000000000000000000000000000041':
        queryResult = await getDemandCostQuery(result, clusterUuid);
        break;
      case '70000000000000000000000000000042':
        queryResult = await getContractUsageQuery(result, clusterUuid);
        break;
      case '70000000000000000000000000000043':
        queryResult = await getProductPriceQuery(result, clusterUuid);
        break;
      case '70000000000000000000000000000045':
        queryResult = await getCostRelationCodeList(result, clusterUuid);
        break;
      case 'NCM00000000000000000000000000006':
        queryResult = await this.cloudDBMysqlService.getCloudDBMysqlInstanceListQuery(result, clusterUuid);
        break;
      case 'NCM00000000000000000000000000007':
        queryResult = await this.cloudDBMongoDBService.getCloudDBMongoDbInstanceListQuery(result, clusterUuid);
        break;
      case 'NCM00000000000000000000000000008':
        queryResult = await this.cloudDBRedisService.getCloudDBRedisInstanceListQuery(result, clusterUuid);
        break;
      case 'NCM00000000000000000000000000009':
        queryResult = await this.cloudDBPostgresqlService.getCloudDBPostgresqlInstanceListQuery(result, clusterUuid);
        break;
      case 'NCM00000000000000000000000000010':
        queryResult = await this.cloudDBMysqlService.getCloudDBMysqlServerInstanceListQuery(result, clusterUuid);
        break;
      case 'NCM00000000000000000000000000011':
        queryResult = await this.cloudDBMongoDBService.getCloudDBMongoDbServerInstanceListQuery(result, clusterUuid);
        break;
      case 'NCM00000000000000000000000000012':
        queryResult = await this.cloudDBRedisService.getCloudDBRedisServerInstanceListQuery(result, clusterUuid);
        break;
      case 'NCM00000000000000000000000000013':
        queryResult = await this.cloudDBPostgresqlService.getCloudDBPostgresqlServerInstanceListQuery(result, clusterUuid);
        break;
      case '70000000000000000000000000000029':
        queryResult = await getResourceQuery(result, clusterUuid);
        break;
      case 'NCM00000000000000000000000000014':
        queryResult = await getResourceGroupQuery(result, clusterUuid);
        break;
      case 'NCM00000000000000000000000000018':
        queryResult = await getLoadBalancerQuery(result, clusterUuid);
        break;
      case 'NCM00000000000000000000000000017':
        queryResult = await getNksQuery(result, clusterUuid);
        break;
      case 'NCM00000000000000000000000000015':
        queryResult = await getNasVolumeQuery(result, clusterUuid);
        break;
      case 'NCM00000000000000000000000000016':
        queryResult = await getRouteTableQuery(result, clusterUuid);
        break;
      case 'NCM00000000000000000000000000019':
        queryResult = await getNetworkAclListQuery(result, clusterUuid);
        break;
      default:
        throw new HttpException(400, `invalid template uuid ${totalMsg.template_uuid}`);
    }

    return queryResult;
  }
}

export default QueryService;
