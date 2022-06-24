import { IsString, IsOptional, IsNotEmpty, IsObject, IsArray, IsBoolean } from 'class-validator';

export class SchedulerDto {
  @IsString()
  @IsNotEmpty()
  public name: string;

  @IsString()
  @IsNotEmpty()
  public summary: string;

  @IsString()
  @IsNotEmpty()
  public apiUrl: string;

  @IsObject()
  @IsNotEmpty()
  public apiBody: object;

  @IsString()
  @IsNotEmpty()
  public cronTab: string;

  @IsString()
  @IsNotEmpty()
  public clusterId: string;

  @IsString()
  @IsNotEmpty()
  public scheduleFrom: string;

  @IsString()
  @IsNotEmpty()
  public scheduleTo: string;

  @IsBoolean()
  public reRunRequire: boolean;
}
