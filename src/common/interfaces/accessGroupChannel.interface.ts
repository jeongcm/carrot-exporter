export interface AccessGroupChannel {
  pk: number;
  id: string;
  accessGroupPk: string;
  channelPk: string;
  createdAt: Date;
  createdBy: number;
  updatedAt: Date;
  updatedBy: number;
  isDeleted: boolean;
}
