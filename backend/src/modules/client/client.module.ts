import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ClientController } from './client.controller';
import {
  ConsultCepService,
  CreateClientService,
  DeleteClientService,
  EditClientService,
  ListClientsService,
  ListClientUsersService,
  ListUserClientsService,
} from './service';

@Module({
  imports: [HttpModule],
  controllers: [ClientController],
  providers: [
    CreateClientService,
    ListClientsService,
    EditClientService,
    DeleteClientService,
    ConsultCepService,
    ListUserClientsService,
    ListClientUsersService,
  ],
})
export class ClientModule {}
