import { IsString, MaxLength, MinLength } from 'class-validator';

export class ClarifyRequestDto {
  @IsString()
  @MinLength(1)
  @MaxLength(8000)
  clarification!: string;
}
