import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'lists' })
@ObjectType()
export class List {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Field(() => String)
  @Column()
  name: string;

  // Relation , index('userId-list-index')
  @ManyToOne(() => User, (user) => user.lists, { nullable: false, lazy: true })
  @Index('userId-list-index')
  @Field(() => User)
  user: User;
}