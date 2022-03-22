
export interface ICatalogPlan {
    catalogPlanId: string;
    catalogPlanName: string;
    catalogPlanDescription: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
}


export interface ICatalogPlanProduct{
    catalogPlanProductKey:string;
    catalogPlanKey:string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    catalogPlanProductName:string
    catalogPlanProductDescription:string
    catalogPlanProductMonthlyPrice:number
    catalogPlanProductUOM:string
    catalogPlanProductCurrency:string

}

export interface ICatalogPlanProductPrice{
    catalogPlanProductKey:string,
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    catalogPlanProductMonthlyPriceFrom:Date;
    catalogPlanProductMonthlyPriceTo:Date;
    catalogPlanProductMonthlyPrice:number
}
