import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { ItemsModule } from '../items/items.module';
import { ListsModule } from '../lists/lists.module';
import { User } from './entities/user.entity';

@Module({
  providers: [UsersResolver, UsersService],
  imports: [TypeOrmModule.forFeature([User]), ItemsModule, ListsModule],
  exports: [TypeOrmModule, UsersService],
})
export class UsersModule {}
