import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CreateClientService,
  DeleteClientService,
  EditClientService,
  ListClientUsersService,
  ListClientsService,
  ListUserClientsService,
} from './service';
import { EditClientDto } from './dto/edit-cliient.dto';
import { AdminGuard } from '../auth/admin.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@ApiTags('Clientes')
@Controller('client')
export class ClientController {
  constructor(
    private readonly createClientService: CreateClientService,
    private readonly listClientService: ListClientsService,
    private readonly editClientService: EditClientService,
    private readonly deleteClientService: DeleteClientService,
    private readonly listUserClientsService: ListUserClientsService,
    private readonly listClientUsersService: ListClientUsersService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo cliente' })
  public async createClient(
    @Body() clientData: CreateClientDto,
    @Req() req: any,
  ) {
    const currentUserId = req.user?.userId || req.user?.sub;

    const response = await this.createClientService.execute(
      clientData,
      currentUserId,
    );
    return response;
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os clientes' })
  public async listClients() {
    const response = await this.listClientService.execute();
    return response;
  }

  @Get('userClients')
  @ApiOperation({ summary: 'Lista os clientes de um usuário específico' })
  public async listUserClients(@Req() req: any) {
    const currentUserId = req.user?.userId || req.user?.sub;
    const response = await this.listUserClientsService.execute(currentUserId);
    return response;
  }

  @Get(':id/users')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Lista os usuários vinculados à empresa' })
  public async listClientUsers(@Param('id', ParseUUIDPipe) id: string) {
    return this.listClientUsersService.execute(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edita o cliente' })
  public async editClient(
    @Param('id') id: string,
    @Body() newClient: EditClientDto,
    @Req() req: any,
  ) {
    const currentUserId = req.user?.userId || req.user?.sub;

    const response = await this.editClientService.execute(
      id,
      newClient,
      currentUserId,
    );
    return response;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deleta o cliente' })
  public async deleteClient(@Param('id') id: string, @Req() req: any) {
    const currentUserId = req.user?.userId || req.user?.sub;

    if (!currentUserId) {
      throw new BadRequestException(
        'Usuário logado não identificado na requisição.',
      );
    }

    const response = await this.deleteClientService.execute(id, currentUserId);
    return response;
  }
}
