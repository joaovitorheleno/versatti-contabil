import { Body, Controller, Get, Post } from "@nestjs/common";
import { ListUsersService, CreateUserService } from "./service";
import { ApiOperation } from "@nestjs/swagger";
import { CreateUserDto } from "./dto/create-user.dto";
import { Public } from "../auth/public.decorator";


@Controller('user')
export class UserController {
    constructor(
        private readonly createUserService: CreateUserService,
        private readonly listUsersService: ListUsersService
    ) {}

    @Post()
    @ApiOperation({ summary: 'Cria um novo usuário' })
    public async createUser(@Body() userData: CreateUserDto) {
        const createdUser = await this.createUserService.execute(userData);
        return createdUser;
    }

    @Public()
    @Get()
    @ApiOperation({ summary: 'Lista todos os usuários' })
    public async listUsers() {
        const listedUsers = await this.listUsersService.execute();
        return listedUsers;
    }
}