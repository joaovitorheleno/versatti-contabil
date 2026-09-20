import { Module } from "@nestjs/common";
import { ListUsersService, CreateUserService } from "./service";
import { UserController } from "./user.controller";

@Module({
  controllers: [UserController],
  providers: [
    CreateUserService,
    ListUsersService
  ],
})
export class UserModule {}