import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateResolutionActionDto {
    @IsString()
    @IsNotEmpty()
    public resolutionActionName: string;

    @IsString()
    @IsNotEmpty()
    public resolutionActionDescription: string;

    @IsString()
    @IsNotEmpty()
    public sudoryTemplateId: string;

    @IsOptional()
    public resolutionActionTemplateSteps: JSON;

}
export class UpdateResolutionActionDto {
    @IsString()
    @IsOptional()
    public resolutionActionName: string;

    @IsString()
    @IsOptional()
    public resolutionActionDescription: string;

    @IsString()
    @IsOptional()
    public sudoryTemplateId: string;
    
    @IsOptional()
    public resolutionActionTemplateSteps: JSON;


}
