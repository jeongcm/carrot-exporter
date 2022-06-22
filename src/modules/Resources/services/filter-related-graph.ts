import each from 'lodash/each';
import { IResource } from '@/common/interfaces/resource.interface';
import { createNodeId } from './create-k8s-graph';

const filterRelatedGraph = (nodesIn: any[], targetResource: IResource) => {
  let flat: any[] = [];
  const nodes = nodesIn.map((nsNodes: any) => {
    const result = filterRelatedNsGraph(nsNodes, targetResource);

    flat = [...flat, ...result.flat];
    return {
      id: 'default',
      type: 'group',
      children: result.children,
      edges: result.edges,
    };
  });

  return { nodes, flat };
};

const filterRelatedNsGraph = (nsNodes: any, targetResource: IResource) => {
  const { children, edges } = nsNodes;

  const targetEdgeId = createNodeId(targetResource);

  const nodesPerId = {};
  const edgesPerId = {};

  children.forEach((node: any) => {
    nodesPerId[node.id] = node;
  });

  edges.forEach((edge: any) => {
    if (!edgesPerId[edge.source]) {
      edgesPerId[edge.source] = {
        Id: edge.source,
        edge,
        connected: [edge.target],
      };
    } else {
      if (edgesPerId[edge.source].connected.indexOf(edge.target) === -1) {
        edgesPerId[edge.source].connected.push(edge.target);
      }
    }
    if (!edgesPerId[edge.target]) {
      edgesPerId[edge.target] = {
        id: edge.target,
        edge,
        connected: [edge.source],
      };
    } else {
      if (edgesPerId[edge.target].connected.indexOf(edge.source) === -1) {
        edgesPerId[edge.target].connected.push(edge.source);
      }
    }
  });

  const { resourceId, resourceName, resourceType } = targetResource;
  const opts = {
    children: [nodesPerId[targetEdgeId]],
    edges: [edgesPerId[targetEdgeId].edge],
    flat: [
      {
        resourceId,
        resourceName,
        resourceType,
      },
    ],
    nodesPerId,
    edgesPerId,
    added: [targetEdgeId],
  };

  const result = traverseEdges(edgesPerId[targetEdgeId], opts);

  return {
    flat: result.flat,
    children: result.children,
    edges: result.edges,
  };
};

function traverseEdges(targetEdge, opts) {
  if (!targetEdge) {
    return opts;
  }

  (targetEdge.connected || []).forEach((id: string) => {
    if (opts.added.indexOf(id) === -1) {
      opts.added.push(id);
      const resource = opts.nodesPerId[id] || {};
      if (resource?.data?.resource) {
        const { resourceId, resourceName, resourceType } = resource?.data?.resource || {};
        opts.flat.push({
          resourceId,
          resourceName,
          resourceType,
        });
        opts.children.push(resource);
      }

      const edge = opts.edgesPerId[id];
      opts.edges.push(edge.edge);
      opts = traverseEdges(edge, opts);
    }
  });

  return opts;
}

export default filterRelatedGraph;
