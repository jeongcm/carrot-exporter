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
