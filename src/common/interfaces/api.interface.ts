export interface IApi {
    apiKey: number;
    apiId: string;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
    isDeleted: boolean;
    apiName: string;
    apiDescription: string;
    apiEndPoint1: string;
    apiEndPoint2: string;
    apiVisibleTF: string;
  }