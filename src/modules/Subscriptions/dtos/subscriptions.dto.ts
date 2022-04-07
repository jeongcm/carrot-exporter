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
  public subscriptionStatus : 'AC' |'SP' | 'TM'; // ## 'AC', 'Active', '계약중' ## 'SP', 'Suspended', '일시정지' ## 'TM', 'Terminated', '해지'

  @IsBoolean()
  @IsNotEmpty()
  public subscriptionConsent : boolean;

  @IsDateString()
  @IsNotEmpty()
  public subscriptionActivatedAt : Date;

  @IsDateString()
  @IsNotEmpty()
  public subscriptionTerminatedAt : Date;

  @IsString()
  @IsNotEmpty()
  public subscriptionCommitmentType : 'AC' | 'MM'; // ##'AC', 'Annual Contract', '연간계약' ## 'MM', 'Month to Month', '월간계약'


  @IsString()
  @IsNotEmpty()
  public catalogPlanId : string; 

}


/**
 * DTO with information to add new subscription
 * @typedef {Object} CreateSubscribedProductto
 * @property {string} subscribedProductStatus - Name of the new product plan to be created
 * @property {boolean} subscriptionConsent - 
 * @property {Date} subscribedProductFrom - Date to activate the subscription
 * @property {Date} subscribedProductTo - Date to terminate the subscription
 * @property {string} subscriptionId - MM (Month-to-Month), YR (Yearly contract)
 * @property {string} catalogPlanProductId - Plan id for which we need to add subscription
 * @property {string} resourceId - Plan id for which we need to add subscription
 */
 export class CreateSubscribedProductDto {

  @IsString()
  @IsNotEmpty()
  public subscribedProductStatus  : 'AC' |'EX' ; // ## 'AC', 'Active', '계약중' ## 'EX', 'Excluded', '제외됨'


  @IsDateString()
  @IsNotEmpty()
  public subscribedProductFrom  : Date;

  @IsDateString()
  @IsNotEmpty()
  public subscribedProductTo  : Date;


  @IsString()
  @IsNotEmpty()
  public subscriptionId : string; 

  @IsString()
  @IsNotEmpty()
  public catalogPlanProductId : string; 

  @IsString()
  @IsNotEmpty()
  public resourceId  : string; 

}


/**
 * DTO with information to add new subscription
 * @typedef {Object} CreateSubscribedProductto
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
  @IsNotEmpty()
  public subscriptionOldStatus  : 'AC' |'SP' | 'TM'; // ## 'AC', 'Active', '계약중' ## 'SP', 'Suspended', '일시정지' ## 'TM', 'Terminated', '해지'
 
  @IsString()
  @IsNotEmpty()
  public subscriptionNewStatus  : 'AC' |'SP' | 'TM'; // ## 'AC', 'Active', '계약중' ## 'SP', 'Suspended', '일시정지' ## 'TM', 'Terminated', '해지'


  @IsString()
  @IsNotEmpty()
  public subscriptionStatusChangeReason  : 'BD';// 'Suspended by billing delinquency', '연체 일시정지'

  @IsString()
  @IsNotEmpty()
  public subscriptionOldCommitment  : 'AC' | 'MM'; // ##'AC', 'Annual Contract', '연간계약' ## 'MM', 'Month to Month', '월간계약''

  @IsString()
  @IsNotEmpty()
  public subscriptionNewCommitment : 'AC' | 'MM'; // ##'AC', 'Annual Contract', '연간계약' ## 'MM', 'Month to Month', '월간계약''

  @IsDateString()
  @IsNotEmpty()
  public subscriptionChangeAt  : Date;


  @IsString()
  @IsNotEmpty()
  public subscriptionCommitmentChangeReason : "EA";  //'End of annual contract', '연간계약종료 '

  @IsString()
  @IsNotEmpty()
  public subscriptionId : string; 

}
