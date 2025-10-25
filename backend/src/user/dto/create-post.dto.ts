import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
  // @IsNotEmpty()
  @IsString()
  wantToLearn: string; // or change to string[] if you want multiple skills

  // @IsNotEmpty()
  @IsString()
  wantToTeach: string; // or change to string[] if you want multiple skills

  @IsOptional()
  @IsString()
  specificTopic?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  trendingSkills?: string[];

  @IsOptional()
  @IsString()
  postImageUrl?: string;

  @IsOptional()
  @IsString()
  postImagePublicId?: string;

  @IsOptional()
  @IsString()
  postUrl?: string;

  @IsOptional()
  @IsString()
  postPdf?: string;
}
