import { IsString, IsNotEmpty, IsOptional, IsNumber, IsJSON, IsObject } from 'class-validator';

export class CreateSudoryTemplateDto {
    @IsString()
    @IsNotEmpty()
    public sudoryTemplateName: string;

    @IsString()
    @IsNotEmpty()
    public sudoryTemplateDescription: string;

    @IsString()
    @IsNotEmpty()
    public sudoryTemplateUuid: string;

    @IsObject()
    @IsOptional()
    public sudoryTemplateArgs: JSON;

}
export class UpdateSudoryTemplateDto {
    @IsString()
   @IsOptional()
    public sudoryTemplateName: string;

    @IsString()
   @IsOptional()
    public sudoryTemplateDescription: string;

    @IsString()
   @IsOptional()
    public sudoryTemplateUuid: string;

    @IsObject()
    @IsOptional()
    public sudoryTemplateArgs: JSON;

}
