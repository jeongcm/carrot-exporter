import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateResolutionActionDto {
    @IsString()
    @IsNotEmpty()
    public resolutionActionName: string;

    @IsString()
    @IsNotEmpty()
    public resolutionActionDescription: string;

    @IsNumber()
    @IsNotEmpty()
    public sudoryTemplateKey: number;

}
export class UpdateResolutionActionDto {
    @IsString()
    @IsOptional()
    public resolutionActionName: string;

    @IsString()
    @IsOptional()
    public resolutionActionDescription: string;

    @IsNumber()
    @IsOptional()
    public sudoryTemplateKey: number;

}
