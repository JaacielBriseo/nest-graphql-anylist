import { ArgsType, Field } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';

@ArgsType()
export class SearchArgs {
  @Field(() => String, { name: 'search', nullable: true })
  @IsOptional()
  @IsString()
  search?: string;
}
