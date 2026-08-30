import { Body, Controller, Post } from "@nestjs/common";
import { CreateClientDto } from "./dto/create-client.dto";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { CreateClientService } from "./service";

@ApiTags('Carrinho')
@Controller('client')
export class ClientController {
    constructor(
        private readonly createClientService: CreateClientService
    ){}

    @Post()
    @ApiOperation({ summary: 'Cria um novo cliente' })
    public async createClient(@Body() clientData: CreateClientDto) {
        const createdClient = await this.createClientService.execute(clientData);
        return createdClient;
    }
}