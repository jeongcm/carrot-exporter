import { IsString, IsNotEmpty, IsAlpha, IsOptional, IsBoolean, IsDate, IsDateString } from 'class-validator';

/**
 * DTO with information to add new subscription
 * @typedef {Object} CreateSubscriptionDto
 * @property {string} subscriptionStatus - Name of the new product plan to be created
 * @property {boolean} subscriptionConsent -
 * @property {Date} subscriptionActivatedAt - Date to activate the subscription
 * @property {Date} subscriptionTerminatedAt - Date to terminate the subscription
 * @property {string} subscriptionCommitmentType - MM (Month-to-Month), YR (Yearly contract)
 * @property {string} catalogPlanId - Plan id for which we need to add subscription
 */
export class CreateSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  public subscriptionStatus: string; // ## 'AC', 'Active', '계약중' ## 'SP', 'Suspended', '일시정지' ## 'TM', 'Terminated', '해지'

  @IsBoolean()
  @IsNotEmpty()
  public subscriptionConsent: boolean;

  @IsDateString()
  @IsNotEmpty()
  public subscriptionActivatedAt: Date;

  @IsDateString()
  @IsOptional()
  public subscriptionTerminatedAt: Date;

  @IsString()
  @IsNotEmpty()
  public subscriptionCommitmentType: string; // ##'AC', 'Annual Contract', '연간계약' ## 'MM', 'Month to Month', '월간계약'

  @IsString()
  @IsNotEmpty()
  public catalogPlanId: string;
}

/**
 * DTO with information to add new subscription
 * @typedef {Object} UpdateSubscriptionDto
 * @property {string} subscriptionStatus - Name of the new product plan to be created
 * @property {boolean} subscriptionConsent -
 * @property {Date} subscriptionActivatedAt - Date to activate the subscription
 * @property {Date} subscriptionTerminatedAt - Date to terminate the subscription
 * @property {string} subscriptionCommitmentType - MM (Month-to-Month), YR (Yearly contract)
 * @property {string} catalogPlanId - Plan id for which we need to add subscription
 */
export class UpdateSubscriptionDto {
  @IsString()
  public subscriptionStatus: string; // ## 'AC', 'Active', '계약중' ## 'SP', 'Suspended', '일시정지' ## 'TM', 'Terminated', '해지'

  @IsBoolean()
  public subscriptionConsent: boolean;

  @IsDateString()
  public subscriptionActivatedAt: Date;

  @IsDateString()
  @IsOptional()
  public subscriptionTerminatedAt: Date;

  @IsString()
  public subscriptionCommitmentType: string; // ##'AC', 'Annual Contract', '연간계약' ## 'MM', 'Month to Month', '월간계약'
}

/**
 * DTO with information to add new subscribed product
 * @typedef {Object} CreateSubscribedProductto
 * @property {string} subscribedProductStatus - Name of the new product plan to be created
 * @property {boolean} subscriptionConsent -
 * @property {Date} subscribedProductFrom - Date to activate the subscription
 * @property {Date} subscribedProductTo - Date to terminate the subscription
 * @property {string} catalogPlanProductType - Plan type  for which we need to add subscription
 * @property {string} resourceId - Plan id for which we need to add subscription
 */
export class CreateSubscribedProductDto {
  @IsString()
  @IsNotEmpty()
  public subscribedProductStatus: string; // ## 'AC', 'Active', '계약중' ## 'EX', 'Excluded', '제외됨'

  @IsDateString()
  @IsNotEmpty()
  public subscribedProductFrom: Date;

  @IsDateString()
  @IsNotEmpty()
  public subscribedProductTo: Date;

  @IsString()
  @IsNotEmpty()
  public catalogPlanProductType: string;

  @IsString()
  @IsNotEmpty()
  public resourceId: string;

  @IsString()
  @IsNotEmpty()
  public subscriptionId: string;

  @IsString()
  @IsNotEmpty()
  public catalogPlanProductId: string;
}

/**
 * DTO with information to add new subscribed product
 * @typedef {Object} UpdateSubscribedProductto
 * @property {string} subscribedProductStatus - Name of the new product plan to be created
 * @property {boolean} subscriptionConsent -
 * @property {Date} subscribedProductFrom - Date to activate the subscription
 * @property {Date} subscribedProductTo - Date to terminate the subscription
 * @property {string} catalogPlanProductType - Plan type  for which we need to add subscription
 * @property {string} resourceId - Plan id for which we need to add subscription
 */
export class UpdateSubscribedProductto {
  @IsString()
  @IsOptional()
  public subscribedProductStatus: string; // ## 'AC', 'Active', '계약중' ## 'EX', 'Excluded', '제외됨'

  @IsDateString()
  @IsOptional()
  public subscribedProductFrom: Date;

  @IsDateString()
  @IsOptional()
  public subscribedProductTo: Date;

  @IsString()
  @IsOptional()
  public catalogPlanProductType: string;

  @IsString()
  @IsOptional()
  public resourceId: string;
}

/**
 * DTO with information to add new subscription
 * @typedef {Object} CreateSubscriptionHistoryDto
 * @property {string} subscribedProductStatus - Name of the new product plan to be created
 * @property {boolean} subscriptionConsent -
 * @property {Date} subscribedProductFrom - Date to activate the subscription
 * @property {Date} subscribedProductTo - Date to terminate the subscription
 * @property {string} subscriptionId - MM (Month-to-Month), YR (Yearly contract)
 * @property {string} catalogPlanProductId - Plan id for which we need to add subscription
 * @property {string} resourceId - Plan id for which we need to add subscription
 */
export class CreateSubscriptionHistoryDto {
  @IsString()
  @IsOptional()
  public subscriptionOldStatus: 'AC' | 'SP' | 'TM' | null; // ## 'AC', 'Active', '계약중' ## 'SP', 'Suspended', '일시정지' ## 'TM', 'Terminated', '해지'

  @IsString()
  @IsOptional()
  public subscriptionNewStatus: 'AC' | 'SP' | 'TM' | null; // ## 'AC', 'Active', '계약중' ## 'SP', 'Suspended', '일시정지' ## 'TM', 'Terminated', '해지'

  @IsString()
  @IsOptional()
  public subscriptionStatusChangeReason: 'BD' | null; // 'Suspended by billing delinquency', '연체 일시정지'

  @IsString()
  @IsOptional()
  public subscriptionOldCommitment: 'AC' | 'MM' | null; // ##'AC', 'Annual Contract', '연간계약' ## 'MM', 'Month to Month', '월간계약''

  @IsString()
  @IsOptional()
  public subscriptionNewCommitment: 'AC' | 'MM' | null; // ##'AC', 'Annual Contract', '연간계약' ## 'MM', 'Month to Month', '월간계약''

  @IsDateString()
  @IsOptional()
  public subscriptionChangeAt: Date;

  @IsString()
  @IsOptional()
  public subscriptionCommitmentChangeReason: 'EA' | null; //'End of annual contract', '연간계약종료 '
}
