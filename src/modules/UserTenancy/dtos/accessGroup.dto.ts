import { IsString, IsNotEmpty, IsAlpha, IsOptional } from 'class-validator';

/**
 * DTO with information to create a new access group
 * @typedef {Object} CreateAccessGroupDto
 * @property {string} groupName - Name of the new access group to be created
 * @property {string} description - Description
 * @property {string} icon - Icon name
 * @property {string} createdBy - UUID of a user created the access group
 * @property {string} groupName - UUID of a user last updated the access group
 */
export class CreateAccessGroupDto {
  @IsString()
  @IsNotEmpty()
  public groupName: string;

  @IsString()
  @IsNotEmpty()
  public description: string;

  @IsAlpha()
  @IsNotEmpty()
  public icon: string;

  @IsString()
  @IsOptional()
  public createdBy: number;

  @IsString()
  @IsOptional()
  public updatedBy: number;
}
