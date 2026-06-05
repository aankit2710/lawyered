import { IsString, MinLength } from 'class-validator';

export class ClarifyRequestDto {
  @IsString()
  @MinLength(1)
  clarification!: string;
}
