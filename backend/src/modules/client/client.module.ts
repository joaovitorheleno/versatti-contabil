import { Module } from "@nestjs/common";
import { CreateClientService } from "./service/create-client.service";
import { ClientController } from "./client.controller";

@Module({
  controllers: [ClientController],
  providers: [CreateClientService],
})
export class ClientModule {}