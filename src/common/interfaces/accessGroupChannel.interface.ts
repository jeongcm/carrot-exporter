export interface AccessGroupChannel {
  pk: number;
  id: string;
  accessGroupPk: number;
  channelPk: number;
  createdAt: Date;
  createdBy: number;
  updatedAt: Date;
  updatedBy: number;
  isDeleted: boolean;
}
