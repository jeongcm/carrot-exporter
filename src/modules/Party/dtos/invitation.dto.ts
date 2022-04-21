
  
import { IsString, IsOptional, IsNotEmpty, IsNumber } from 'class-validator';
import { isString } from 'lodash';

export class InvitationDto {
  @IsNumber()
  @IsNotEmpty()
  public messageId: number;

  @IsString()
  @IsNotEmpty()
  public invitedTo: string;

  @IsString()
  @IsOptional()
  public customMsg: string;
}

export class UpdateInvitation{
  @IsString()
  @IsNotEmpty()
  public email: string
}