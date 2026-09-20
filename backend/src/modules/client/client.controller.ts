import { Body, Controller, Get, Post } from "@nestjs/common";
import { CreateClientDto } from "./dto/create-client.dto";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { CreateClientService, ListClientsService } from "./service";

@ApiTags('Clientes')
@Controller('client')
export class ClientController {
    constructor(
        private readonly createClientService: CreateClientService,
        private readonly listClientService: ListClientsService
    ){}

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
}