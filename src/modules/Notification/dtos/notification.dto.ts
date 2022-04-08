import { IsString, IsEmail, IsNotEmpty, IsAlpha, IsOptional, IsJSON, IsObject, IsDate } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  public messageId: string;
}

export class UpdateNotificationDto {
  @IsString()
  @IsNotEmpty()
  public notificationStatus: string;
}
