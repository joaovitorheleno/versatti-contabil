import { Module } from '@nestjs/common';
import { ClientController } from './client.controller';
import {
  CreateClientService,
  DeleteClientService,
  EditClientService,
  ListClientsService,
} from './service';

@Module({
  controllers: [ClientController],
  providers: [
    CreateClientService,
    ListClientsService,
    EditClientService,
    DeleteClientService,
  ],
})
export class ClientModule {}
