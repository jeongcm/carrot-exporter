  
import { IsString, IsOptional, IsNotEmpty, IsNumber } from 'class-validator';
export class InvitationDto {
  @IsNumber()
  @IsNotEmpty()
  public messageId: string;

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