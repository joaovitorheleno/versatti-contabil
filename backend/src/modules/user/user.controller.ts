import { Body, Controller, Post } from "@nestjs/common";
import { CreateUserService } from "./service";
import { ApiOperation } from "@nestjs/swagger";
import { CreateUserDto } from "./dto/create-user.dto";
import { Public } from "../auth/public.decorator";


@Controller('user')
export class UserController {
    constructor(private readonly createUserService: CreateUserService) {}

    @Public()
    @Post()
    @ApiOperation({ summary: 'Cria um novo usuário' })
    public async createUser(@Body() userData: CreateUserDto) {
        const createdUser = await this.createUserService.execute(userData);
        return createdUser;
    }
}