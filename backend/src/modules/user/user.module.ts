import { Module } from '@nestjs/common';
import {
  ListUsersService,
  CreateUserService,
  InspectUserService,
} from './service';
import { UserController } from './user.controller';

@Module({
  controllers: [UserController],
  providers: [CreateUserService, ListUsersService, InspectUserService],
})
export class UserModule {}
