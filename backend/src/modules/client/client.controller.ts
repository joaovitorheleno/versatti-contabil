import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CreateClientService,
  DeleteClientService,
  EditClientService,
  ListClientsService,
} from './service';
import { EditClientDto } from './dto/edit-cliient.dto';

@ApiTags('Clientes')
@Controller('client')
export class ClientController {
  constructor(
    private readonly createClientService: CreateClientService,
    private readonly listClientService: ListClientsService,
    private readonly editClientService: EditClientService,
    private readonly deleteClientService: DeleteClientService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo cliente' })
  public async createClient(@Body() clientData: CreateClientDto) {
    const response = await this.createClientService.execute(clientData);
    return response;
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os clientes' })
  public async listClients() {
    const response = await this.listClientService.execute();
    return response;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edita o cliente' })
  public async editClient(
    @Param('id') id: string,
    @Body() newClient: EditClientDto,
  ) {
    const response = await this.editClientService.execute(id, newClient);
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
