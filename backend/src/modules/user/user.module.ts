import { Module } from '@nestjs/common';
import {
  ListUsersService,
  CreateUserService,
  InspectUserService,
  EditUserService,
  DeleteUserService,
} from './service';
import { UserController } from './user.controller';

@Module({
  controllers: [UserController],
  providers: [
    CreateUserService,
    ListUsersService,
    InspectUserService,
    EditUserService,
    DeleteUserService,
  ],
})
export class UserModule {}
