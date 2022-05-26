import { IsString, IsNotEmpty, IsAlpha, IsOptional, IsNumber } from 'class-validator';

/**
 * DTO with information to create a new catalog plan
 * @typedef {Object} CreateCatalogPlanDto
 * @property {string} catalogPlanName - Name of the new product plan to be created
 * @property {string} catalogPlanDescription - Description
 */
export class CreateCatalogPlanDto {
  @IsString()
  @IsNotEmpty()
  public catalogPlanName : string;

  @IsString()
  @IsNotEmpty()
  public catalogPlanDescription : string;
  
  @IsString()
  @IsNotEmpty()
  public catalogPlanType  :  string;
  // - OB (Observability)
  // - MO (MetricOps;

}


/**
 * DTO with information to create a new catalog  plan product
 * @typedef {Object} CreateCatalogPlanProductDto
 * @property {string} catalogPlanProductName - Name of the new product plan to be created
 * @property {string} catalogPlanProductDescription - Description
 * @property {number} catalogPlanProductMonthlyPrice - monthly price
 * @property {string} catalogPlanProductUOM - ProductUOM
 * @property {string} catalogPlanProductCurrency - currency
 * @property {string} catalogPlanKey - catalogPlan id 
 */
export class CreateCatalogPlanProductDto {
    @IsString()
    @IsNotEmpty()
    public catalogPlanProductName: string;
  
    @IsString()
    @IsNotEmpty()
    public catalogPlanProductDescription: string;

    @IsNumber()
    @IsNotEmpty()
    public catalogPlanProductMonthlyPrice: number;
    
    @IsString()
    @IsNotEmpty()
    public catalogPlanProductType: 'ON' | 'MN' | 'MS' | 'MC';
    //   ON (ObservabilityNode)
    // - MN (MetricOps Node)
    // - MS (MetricOps Service)
    // - MC (MetricOps Cluster);

    @IsString()
    @IsNotEmpty()
    public catalogPlanProductUOM: string;

    @IsString()
    @IsNotEmpty()
    public catalogPlanProductCurrency: string;

    @IsString()
    @IsNotEmpty()
    public catalogPlanId: string;

  }

/**
 * DTO with information to create a new catalog  plan product pricing
 * @typedef {Object} CreateProductPricingDto
 * @property {string} catalogPlanProductPriceFrom - Name of the new product plan to be created
 * @property {string} catalogPlanProductPriceTo - Description
 * @property {number} catalogPlanProductMonthlyPrice - monthly price
 * @property {string} catalogPlanProductKey - catalog Plan product key
 */
  export class CreateProductPricingDto {
    @IsString()
    @IsNotEmpty()
    public catalogPlanProductMonthlyPriceFrom: Date;
  
    @IsString()
    @IsNotEmpty()
    public catalogPlanProductMonthlyPriceTo: Date;

    @IsString()
    @IsNotEmpty()
    public catalogPlanProductMonthlyPrice: number;

    @IsString()
    @IsNotEmpty()
    public catalogPlanProductId: string;

  }