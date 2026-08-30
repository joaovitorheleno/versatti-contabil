import { Module } from "@nestjs/common";
import { CreateUserService } from "./service";
import { UserController } from "./user.controller";

@Module({
  controllers: [UserController],
  providers: [CreateUserService],
})
export class UserModule {}