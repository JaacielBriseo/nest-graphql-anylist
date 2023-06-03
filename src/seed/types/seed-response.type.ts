import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SeedResponse {
  @Field(() => Boolean)
  ok: boolean;

  @Field(() => String)
  msg: string;
}
