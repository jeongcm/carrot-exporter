import { IsString, IsEmail, IsNotEmpty, IsAlpha, IsOptional, IsJSON, IsObject, IsDate } from 'class-validator';

export class CreateNotificationDto {
  notificationChannelType: string;
  notificationType: string;
  notificationChannel: string;
  notificationMessage: JSON;
  notificationStatus: string;
}

export class UpdateNotificationDto {

  @IsString()
  @IsNotEmpty()
  public notificationStatus: string;
}
