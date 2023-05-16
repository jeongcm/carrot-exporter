import getRegionListQuery from '@modules/Resources/query/ncp/region/region';
import getNetworkInterfaceListQuery from '@modules/Resources/query/ncp/networkInterface/networkInterface';
import getServerInstanceListQuery from '@modules/Resources/query/ncp/serverInstance/serverInstance';
import getInitScriptListQuery from '@modules/Resources/query/ncp/initScript/initScript';
import getPlacementGroupListQuery from '@modules/Resources/query/ncp/placementGroup/placementGroup';
import getServerImageProductListQuery from '@modules/Resources/query/ncp/serverImage/serverImage';
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

class QueryService {
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
        queryResult = await getRegionListQuery(result, clusterUuid);
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
      case '70000000000000000000000000000005':
        queryResult = await getServerImageProductListQuery(result, clusterUuid);
        break;
      case 'placementGroup':
        queryResult = await getPlacementGroupListQuery(result, clusterUuid);
        break;
      case 'initScript':
        queryResult = await getInitScriptListQuery(result, clusterUuid);
        break;
      case '70000000000000000000000000000040':
        queryResult = await getContractDemandCostQuery(result, clusterUuid);
        break;
      case '70000000000000000000000000000042':
        queryResult = await getContractUsageQuery(result, clusterUuid);
        break;
    }

    return queryResult;
  }
}

export default QueryService;
