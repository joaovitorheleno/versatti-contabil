import { Module } from "@nestjs/common";
import { CreateClientService } from "./service/create-client.service";
import { ClientController } from "./client.controller";
import { ListClientsService } from "./service";

@Module({
  controllers: [ClientController],
  providers: [CreateClientService, ListClientsService],
})
export class ClientModule {}