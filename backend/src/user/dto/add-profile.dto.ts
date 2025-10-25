import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
} from 'class-validator';

export class AddProfileDto {
  @IsOptional()
  @IsString()
  name: string;

    @IsOptional()
  @IsString()
  collegeName: string;

  @IsOptional()
  @IsString()
  bio: string;

  @IsOptional()
  // @IsArray()
  @IsString({ each: true })
  skillsToTeach: string[];

  @IsOptional()
  // @IsArray()
  @IsString({ each: true })
  skillsToLearn: string[];

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  domain?: string;
}
