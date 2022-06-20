import { IResource } from './resource.interface';
export interface IRelatedResource {
  resourceKey?: number;
  resourceId: string;
  resourceGroupKey: number;
  resourceGroupId?: string;
  resourceType: string;
  resourceName: string;
  resource?: IResource;
  relatedResources?: IRelatedResource[];
  parentResources?: IRelatedResource[];
  childResources?: IRelatedResource[];
}

export interface IRelatedResourceResultDto {
  namespace: string;
  nodes: IRelatedResource[];
  flat: IRelatedResource[];
}
