import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SeedResponse } from './types/seed-response.type';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from '../items/entities/item.entity';
import { User } from '../users/entities/user.entity';
import { SEED_ITEMS, SEED_USERS } from './data/seed-data';
import { UsersService } from '../users/users.service';
import { ItemsService } from '../items/items.service';

@Injectable()
export class SeedService {
  private isProd: boolean;
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly itemsService: ItemsService,
    @InjectRepository(Item) private readonly itemsRepository: Repository<Item>,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {
    this.isProd = configService.get('STATE') === 'prod';
  }

  async executeSeed(): Promise<SeedResponse> {
    //* Prevent running SEED on production
    //? Reason: Seeding DB deletes users and items that already exists
    if (this.isProd) {
      throw new UnauthorizedException('Cannot execute seed on production');
    }
    //* Clean DB
    await this.deleteDatabase();
    //* Create users
    const users = await this.loadUsers();

    //* Create items
    await this.loadItems(users);
    return {
      msg: 'Seed executed',
      ok: true,
    };
  }

  async deleteDatabase() {
    await this.itemsRepository
      .createQueryBuilder()
      .delete()
      .where({})
      .execute();

    await this.usersRepository
      .createQueryBuilder()
      .delete()
      .where({})
      .execute();
  }

  async loadUsers(): Promise<User[]> {
    const users: User[] = [];

    for (const user of SEED_USERS) {
      users.push(await this.usersService.create(user));
    }

    return users;
  }

  async loadItems(users: User[]): Promise<void> {
    const itemsPromises: Promise<Item>[] = [];
    const numUsers = users.length;
    const numItems = SEED_ITEMS.length;

    for (let i = 0; i < numItems; i++) {
      const item = SEED_ITEMS[i];
      const user = users[i % numUsers]; // Distribute items among users cyclically

      itemsPromises.push(this.itemsService.create(item, user));
    }

    await Promise.all(itemsPromises);
  }
}
