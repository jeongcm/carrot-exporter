export interface ICatalogPlan {
  catalogPlanId: string;
  catalogPlanKey: number;
  catalogPlanName: string;
  catalogPlanType: string;
  catalogPlanDescription: string;
  billingPlanFrequencyId: number;
  billingPlanId: number;
  deletedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface ICatalogPlanProduct {
  catalogPlanProductKey: number;
  catalogPlanProductId: string;
  catalogPlanKey: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  deletedAt: Date;
  catalogPlanProductName: string;
  catalogPlanProductDescription: string;
  catalogPlanProductMonthlyPrice: number;
  catalogPlanProductUOM: string;
  catalogPlanProductCurrency: string;
  catalogPlanProductType: string;
  billingProductId: number;
}

export interface ICatalogPlanProductPrice {
  catalogPlanProductKey: number;
  catalogPlanProductPriceId: string;
  catalogPlanProductPriceKey: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  deletedAt: Date;
  catalogPlanProductMonthlyPriceFrom: Date;
  catalogPlanProductMonthlyPriceTo: Date;
  catalogPlanProductMonthlyPrice: number;
}
