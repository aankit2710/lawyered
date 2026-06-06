import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

const WILL_STATUSES = ['DRAFT', 'INCOMPLETE', 'COMPLETE', 'FINALIZED', 'EXECUTED'] as const;

export class UpdateWillDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsIn(WILL_STATUSES)
  status?: (typeof WILL_STATUSES)[number];
}
