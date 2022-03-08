export interface AccessGroupChannel {
  id: number;
  uuid: string;
  accessGroupId: number;
  channelId: number;
  createdAt: Date;
  createdBy: number;
  updatedAt: Date;
  updatedBy: number;
  isDeleted: boolean;
}
