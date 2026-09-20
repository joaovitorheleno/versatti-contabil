import { BadRequestException, Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { ListUsersService, CreateUserService } from "./service";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { CreateUserDto } from "./dto/create-user.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";


@UseGuards(JwtAuthGuard)
@ApiTags('Usuários')
@Controller('user')
export class UserController {
    constructor(
        private readonly createUserService: CreateUserService,
        private readonly listUsersService: ListUsersService
    ) {}

    @Post()
    @ApiOperation({ summary: 'Cria um novo usuário' })
    public async createUser(
        @Body() userData: CreateUserDto,
        @Req() req: any
    ) {
        const currentUserId = req.user?.userId || req.user?.sub;

        if (!currentUserId) {
            throw new BadRequestException('Usuário logado não identificado na requisição.');
        }

        return await this.createUserService.execute(userData, currentUserId);
    }

    @Get()
    @ApiOperation({ summary: 'Lista todos os usuários' })
    public async listUsers() {
        const listedUsers = await this.listUsersService.execute();
        return listedUsers;
    }
}