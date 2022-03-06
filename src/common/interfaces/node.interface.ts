export interface INode {
  creationDateTime: string;
  description: string;
  enabled: boolean;
  id: number;
  name: string;
  nickName: string;
  projectId: string;
  uid: string;
}

export interface INodeDetail {
  additionalInformation: {};
  creationDateTime: string;
  description: string;
  enabled: boolean;
  id: number;
  name: string;
  nickName: string;
  projectId: string;
  uid: string;
}

export interface INodeAccessGroup {
  description: string;
  groupName: string;
  icon: string;
  id: number;
}
