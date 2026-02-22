import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CodingProfileDto {
  @IsOptional()
  @IsString()
  leetcodeUsername?: string;

  @IsOptional()
  @IsString()
  githubUsername?: string;

  @IsOptional()
  @IsString()
  portfolioUrl?: string;

  @IsOptional()
  resume?: string;
}
