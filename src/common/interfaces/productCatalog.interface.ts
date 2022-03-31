
export interface ICatalogPlan {
    catalogPlanId: string;
    catalogPlanKey:number;
    catalogPlanName: string;
    catalogPlanDescription: string;
    isDeleted:boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
}


export interface ICatalogPlanProduct{
    catalogPlanProductKey:number;
    catalogPlanProductId:string;
    catalogPlanKey:number;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    isDeleted:boolean;
    catalogPlanProductName:string
    catalogPlanProductDescription:string
    catalogPlanProductMonthlyPrice:number
    catalogPlanProductUOM:string
    catalogPlanProductCurrency:string

}

export interface ICatalogPlanProductPrice{
    catalogPlanProductKey:number;
    catalogPlanProductPricingId:string;
    catalogPlanProductPriceKey :number
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    isDeleted:boolean;
    catalogPlanProductMonthlyPriceFrom:Date;
    catalogPlanProductMonthlyPriceTo:Date;
    catalogPlanProductMonthlyPrice:number
}
