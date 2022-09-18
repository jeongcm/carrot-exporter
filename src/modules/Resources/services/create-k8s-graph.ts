import each from 'lodash/each';
import { logger } from '@common/utils/logger';

export const REQUIRED_RESOURCE_TYPES = ['NS', 'SS', 'DS', 'RS', 'DP', 'PD', 'SV', 'VM', 'SC', 'CM', 'PV', 'EP', 'PC'];

export const TYPE_PER_NAME: any = {
  statefulset: 'SS',
  daemonset: 'DS',
  replicaset: 'RS',
  deployment: 'DP',
  pod: 'PD',
  service: 'SV',
  volume: 'VM',
  secret: 'SE',
  configmap: 'CM',
  storageclass: 'SC',
  pv: 'PV',
  pvc: 'PC',
  endpoint: 'EP',
  namespace: 'NS',
};

export const NAME_PER_TYPE: any = {
  NS: 'Namespace',
  SS: 'StatefulSet',
  DS: 'DaemonSet',
  RS: 'ReplicaSet',
  DP: 'Deployment',
  PD: 'Pod',
  SV: 'Service',
  VM: 'Volume',
  SE: 'Secret',
  CM: 'ConfigMap',
  SC: 'StorageClass',
  PV: 'PV',
  PC: 'PVC',
  EP: 'Endpoint',
};

const createK8sGraph = async (resources: any, injectedForNode: any) => {
  if (!resources) {
    return {
      nodes: [
        {
          children: [],
          edges: [],
        },
      ],
    };
  }

  const resourcePerNodeId: any = {};

  // STEP 1: Create nodes[] and data per ID object for STEP 2
  const nsNodes: any = {};

  (resources || []).map((resource: any, index: number) => {
    const nodeId = createNodeId(resource);
    let { resourceNamespace: namespace } = resource;

    // We injected resourceNamespace for PV as same as the target resource to make it the same namespace
    if (resource.resourceType === 'PV' && !resource.resourceNamespace) {
      namespace = resource.resourcePvClaimRef?.namespace;
    }

    if (!resourcePerNodeId[nodeId]) {
      resource._nodeId = nodeId;
      resourcePerNodeId[nodeId] = resource;
    }

    if (resource.resourceType === 'NS') {
      namespace = resource.resourceName;
      if (!nsNodes[namespace]) {
        nsNodes[namespace] = {
          children: [],
          edges: [],
        };
      }
      nsNodes[namespace] = {
        ...nsNodes[namespace],
        id: nodeId,
        type: 'group',
        position: { x: 0, y: 0 },
        data: {
          resource,
          ...injectedForNode,
        },
      };
    }

    if (!nsNodes[namespace]) {
      if (namespace) {
        nsNodes[namespace] = {
          children: [],
          edges: [],
        };
      } else {
        nsNodes['_no_namespace'] = {
          id: '_no_namespace',
          children: [],
          edges: [],
        };
      }
    }

    if (resource.resourceType !== 'NS') {
      nsNodes[namespace || '_no_namespace'].children.push({
        id: nodeId,
        type: 'k8s',
        position: { x: 0, y: 0 },
        height: 60,
        width: 80,
        data: {
          resource,
          ...injectedForNode,
        },
      });
    }
  });

  const existingEdgeIds: string[] = [];

  // STEP 2: Link them by creating edges
  (resources || []).map((resource: any, index: number) => {
    const { resourceType, _nodeId, resourceNamespace = 'default' } = resource;
    let resourceOwnerReferences;

    switch (resourceType) {
      case 'EP':
        if (Array.isArray(resource.resourceEndpoint)) {
          resource.resourceEndpoint.forEach((ep: any) => {
            (ep?.addresses || []).forEach((address: any) => {
              const { targetRef } = address;
              if (targetRef) {
                const target = `${targetRef.namespace}.${targetRef.uid}`;

                logger.info('EP target: ' + target + ' EP: ' + _nodeId);

                addEdge(
                  resourceNamespace,
                  {
                    source: _nodeId,
                    target,
                  },
                  nsNodes,
                  existingEdgeIds,
                  resourcePerNodeId,
                );
              }
            });
          });
        }
        break;

      case 'SV':
        const target = `${resource.resourceNamespace}.EP.${resource.resourceName}`;
        if (resourcePerNodeId[target]) {
          addEdge(
            resource.resourceNamespace,
            {
              source: _nodeId,
              target,
            },
            nsNodes,
            existingEdgeIds,
            resourcePerNodeId,
          );
        }
        break;

      case 'DS':
      case 'SS':
      case 'RS':
        if (resource.resourceOwnerReferences) {
          if (!Array.isArray(resource.resourceOwnerReferences)) {
            if (typeof resource.resourceOwnerReferences === 'string') {
              try {
                resourceOwnerReferences = JSON.parse(resource.resourceOwnerReferences);
              } catch (e) {
                console.error(e);
                resourceOwnerReferences = [];
              }
            }
          } else {
            resourceOwnerReferences = resource.resourceOwnerReferences;
          }
          const owner = resourceOwnerReferences;
          const uid = owner.uid;
          const target = `${resourceNamespace}.${uid}`;

          addEdge(
            resourceNamespace,
            {
              source: _nodeId,
              target,
            },
            nsNodes,
            existingEdgeIds,
            resourcePerNodeId,
          );
        }
        break;

      case 'PV':
        if (resource.resourcePvClaimRef) {
          const claim = resource.resourcePvClaimRef;
          const target = `${claim.namespace}.PC.${claim.name}`;
          addEdge(
            claim.namespace,
            {
              source: _nodeId,
              target,
              style: {
                strokeDasharray: 2.5,
                strokeWidth: 2,
              },
            },
            nsNodes,
            existingEdgeIds,
            resourcePerNodeId,
          );
        }
        break;

      case 'PD':
        logger.info('PD: ' + _nodeId);
        if (resource.resourceOwnerReferences) {
          if (!Array.isArray(resource.resourceOwnerReferences)) {
            if (typeof resource.resourceOwnerReferences === 'string') {
              try {
                resourceOwnerReferences = JSON.parse(resource.resourceOwnerReferences);
              } catch (e) {
                console.error(e);
                resourceOwnerReferences = [];
              }
            }
          } else {
            resourceOwnerReferences = resource.resourceOwnerReferences;
          }
          const owner = resourceOwnerReferences;

          const type = TYPE_PER_NAME[(owner.kind || '').toLowerCase()];
          const uid = owner.uid;
          const target = `${resourceNamespace}.${uid}`;

          addEdge(
            resourceNamespace,
            {
              source: _nodeId,
              target,
            },
            nsNodes,
            existingEdgeIds,
            resourcePerNodeId,
          );
        }
        let resourcePodVolume;
        console.log(resource.resourcePodVolume);
        if (resource.resourcePodVolume) {
          if (!Array.isArray(resource.resourcePodVolume)) {
            if (typeof resource.resourcePodVolume === 'string') {
              try {
                resourcePodVolume = JSON.parse(resource.resourcePodVolume);
              } catch (e) {
                console.error(e);
                resourcePodVolume = [];
              }
            }
          }
          console.log(resourcePodVolume);
          resourcePodVolume.forEach((volume: any) => {
            let target = '';
            if (volume.persistentVolumeClaim) {
              target = `${resourceNamespace}.PC.${volume.persistentVolumeClaim.claimName}`;
            } else if (volume.configMap) {
              target = `${resourceNamespace}.CM.${volume.configMap.name}`;
            } else if (volume.secret) {
              target = `${resourceNamespace}.SE.${volume.secret.secretName}`;
            }
            const edgeId = `${_nodeId}:${target}`;
            addEdge(
              resourceNamespace,
              {
                source: _nodeId,
                target,
              },
              nsNodes,
              existingEdgeIds,
              resourcePerNodeId,
            );
          });
        }
        console.log(resource.resourcePodContainer);
        if (resource.resourcePodContainer) {
          resource.resourcePodContainer.forEach((container: any) => {
            let target = '';
            if (container.env) {
              container.env.forEach((env: any) => {
                if (env.valueFrom?.configMapKeyRef) {
                  target = `${resourceNamespace}.CM.${env.valueFrom.configMapKeyRef.name}`;
                } else if (env.valueFrom?.secretKeyRef) {
                  target = `${resourceNamespace}.SE.${env.valueFrom.secretKeyRef.name}`;
                }
                addEdge(
                  resourceNamespace,
                  {
                    source: _nodeId,
                    target,
                  },
                  nsNodes,
                  existingEdgeIds,
                  resourcePerNodeId,
                );
              });
            }
          });
        }
        break;
    }
  });

  const nsNodesArr: any[] = [];

  each(nsNodes, (nsNode: any) => {
    nsNodesArr.push(nsNode);
  });

  return {
    nodes: nsNodesArr,
  };
};

export const createNodeId: any = (resource: any) => {
  const { resourceType, resourceNamespace } = resource;

  switch (resourceType) {
    case 'NS':
      return `NS.${resource.resourceName}`;
    case 'CM':
      return `${resourceNamespace}.CM.${resource.resourceName}`;
    case 'SE':
      return `${resourceNamespace}.SE.${resource.resourceName}`;
    case 'PC':
      return `${resourceNamespace}.PC.${resource.resourceName}`;
    case 'PV':
      // PV has no namespace but we will have to put it in for now
      return `${resource.resourcePvClaimRef?.namespace}.PV.${resource.resourceName}`;
    case 'EP':
      return `${resourceNamespace}.EP.${resource.resourceName}`;
    case 'SV':
      return `${resourceNamespace}.SV.${resource.resourceName}`;
    default:
      return `${resourceNamespace}.${resource.resourceTargetUuid}`;
  }
};

const addEdge = (namespace: string, edge: any, nsNodes: any, existingEdgeIds: string[], resourcePerNodeId: any) => {
  const edgeId = `${edge.source}__${edge.target}`;
  if (resourcePerNodeId[edge.target] && existingEdgeIds.indexOf(edgeId) === -1) {
    existingEdgeIds.push(edgeId);

    const style = edge.style || {};
    delete edge.style;
    nsNodes[namespace].edges.push({
      id: edgeId,
      type: 'straight',
      // animated: true,
      style: {
        stroke: `var(--experimental-blue)`,
        ...style,
      },
      ...edge,
    });
  }

  return nsNodes;
};

export default createK8sGraph;
