import { IsArray, IsString, IsOptional, IsNumber, Max, Min } from 'class-validator';

export class ParseSubredditsDto {
  @IsArray()
  @IsString({ each: true })
  subreddits: string[];

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  postsLimit?: number = 25;
}
