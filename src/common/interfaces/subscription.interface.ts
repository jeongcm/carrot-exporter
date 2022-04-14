
export interface ISubscriptions {
    subscriptionKey: number;
    catalogPlanKey:number;
    customerAccountKey: number;
    subscriptionId: string;
    deletedAt:Date;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    subscriptionActivatedAt :Date;
    subscriptionTerminatedAt:Date;
    subscriptionStatus  : 'AC' | 'SP' | 'TM';
    subscriptionConsent :boolean;
    subscriptionCommitmentType:'AC' | 'MM'
}


export interface ISubscriptionHistory{
    subscriptionHistoryKey:number;
    subscriptionKey: number;
    subscriptionHistoryId: string;
    deletedAt:Date;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    subscriptionOldStatus  :'AC' | 'SP' | 'TM';
    subscriptionNewStatus  :'AC' | 'SP' | 'TM';
    subscriptionStatusChangeReason  :'BD';
    subscriptionOldCommitment:'AC' | 'MM';
    subscriptionNewCommitment:'AC' | 'MM';
    subscriptionCommitmentChangeReason:'EA';
    subscriptionChangedAt :Date;

}

export interface ISubscribedProduct{
    subscribedProductKey:number;
    subscriptionKey:number;
    catalogPlanProductKey :number
    resourceKey  :number
    subscribedProductId  :string
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    deletedAt:Date;
    subscribedProductFrom :Date;
    subscribedProductTo :Date;
    subscribedProductStatus :string
}
