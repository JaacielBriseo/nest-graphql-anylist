import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';

import { SeedResponse } from './types/seed-response.type';
import { SEED_ITEMS, SEED_LISTS, SEED_USERS } from './data/seed-data';

import { Item } from '../items/entities/item.entity';
import { User } from '../users/entities/user.entity';
import { List } from '../lists/entities/list.entity';
import { ListItem } from '../list-item/entities/list-item.entity';

import { UsersService } from '../users/users.service';
import { ItemsService } from '../items/items.service';
import { ListsService } from '../lists/lists.service';
import { ListItemService } from '../list-item/list-item.service';

@Injectable()
export class SeedService {
  private isProd: boolean;
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly itemsService: ItemsService,
    private readonly listsService: ListsService,
    private readonly listItemsService: ListItemService,
    @InjectRepository(Item) private readonly itemsRepository: Repository<Item>,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(List) private readonly listsRepository: Repository<List>,
    @InjectRepository(ListItem)
    private readonly listItemsRepository: Repository<ListItem>,
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

    //* Create lists
    const lists = await this.loadLists(users);

    //* Create list items

    await this.loadListItems(lists, users);
    return {
      msg: 'Seed executed',
      ok: true,
    };
  }

  async deleteDatabase() {
    await this.listItemsRepository
      .createQueryBuilder()
      .delete()
      .where({})
      .execute();

    await this.listsRepository
      .createQueryBuilder()
      .delete()
      .where({})
      .execute();

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

  async loadLists(users: User[]): Promise<List[]> {
    const listsPromises = [];
    const listItemsPromises = [];
    const numUsers = users.length;
    const numLists = SEED_LISTS.length;

    for (let i = 0; i < numLists; i++) {
      const list = SEED_LISTS[i];
      const user = users[i % numUsers]; // Distribute lists among users cyclically

      listsPromises.push(this.listsService.create(list, user));
    }

    return await Promise.all(listsPromises);
  }

  async loadListItems(lists: List[], users: User[]) {
    const listItemsPromises = [];
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const list = lists[i % lists.length];

      const items = await this.itemsService.findAll(
        user,
        { limit: 200, offset: 0 },
        {},
      );

      for (const item of items) {
        listItemsPromises.push(
          this.listItemsService.create({
            quantity: Math.round(Math.random() * 10),
            completed: Math.round(Math.random()) === 0 ? false : true,
            itemId: item.id,
            listId: list.id,
          }),
        );
      }
      await Promise.all(listItemsPromises);
    }
  }
}
