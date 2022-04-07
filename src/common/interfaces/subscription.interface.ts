
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
    subscriptionStatus :string;
    subscriptionConsent :boolean;
    subscriptionCommitmentType:string
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
    subscriptionOldStatus  :string;
    subscriptionNewStatus  :string;
    subscriptionStatusChangeReason  :string;
    subscriptionOldCommitment:string;
    subscriptionNewCommitment:string
    subscriptionCommitmentChangeReason:string
    subscriptionChangedAt :Date

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
    subscribedProductStatus :number
}
