import { IResource } from '../interfaces/resource.interface';
import { IResourceGroup } from '../interfaces/resourceGroup.interface';

const createResourceHash = (resourceGroup: IResourceGroup, resource: IResource) => {
  return `${resource.resourceType}:${resourceGroup.resourceGroupUuid}:${resource.resourceNamespace}:${resource.resourceName}`;
};

export default createResourceHash;
