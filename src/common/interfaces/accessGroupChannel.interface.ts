export interface AccessGroupChannel {
  id: number;
  uuid: string;
  accessGroupId: number;
  channelId: number;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  isDeleted: boolean;
}
