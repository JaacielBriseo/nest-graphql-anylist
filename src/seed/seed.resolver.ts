import { Mutation, Resolver } from '@nestjs/graphql';
import { SeedService } from './seed.service';
import { SeedResponse } from './types/seed-response.type';

@Resolver()
export class SeedResolver {
  constructor(private readonly seedService: SeedService) {}

  @Mutation(() => SeedResponse, {
    name: 'executeSeed',
    description: 'Fill DB with some data for development',
  })
  async executeSeed(): Promise<SeedResponse> {
    return this.seedService.executeSeed();
  }
}
