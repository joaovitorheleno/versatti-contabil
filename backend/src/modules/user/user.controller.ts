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
  UseGuards,
} from '@nestjs/common';
import {
  ListUsersService,
  CreateUserService,
  InspectUserService,
  EditUserService,
  DeleteUserService,
} from './service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@ApiTags('Usuários')
@Controller('user')
export class UserController {
  constructor(
    private readonly createUserService: CreateUserService,
    private readonly listUsersService: ListUsersService,
    private readonly inspectUserService: InspectUserService,
    private readonly editUserService: EditUserService,
    private readonly deleteUserService: DeleteUserService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo usuário' })
  public async createUser(@Body() userData: CreateUserDto, @Req() req: any) {
    const currentUserId = req.user?.userId || req.user?.sub;

    if (!currentUserId) {
      throw new BadRequestException(
        'Usuário logado não identificado na requisição.',
      );
    }

    return await this.createUserService.execute(userData, currentUserId);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os usuários' })
  public async listUsers() {
    const listedUsers = await this.listUsersService.execute();
    return listedUsers;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Inspeciona um usuário pelo ID' })
  public async inspectUser(@Param('id') id: string) {
    const user = await this.inspectUserService.execute(id);
    return user;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edita um usuário pelo ID' })
  public async editUser(
    @Req() req: any,
    @Param('id') id: string,
    @Body() userData: any,
  ) {
    const currentUserId = req.user?.userId || req.user?.sub;

    if (!currentUserId) {
      throw new BadRequestException(
        'Usuário logado não identificado na requisição.',
      );
    }

    const user = await this.editUserService.execute(
      id,
      userData,
      currentUserId,
    );
    return user;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deleta um usuário pelo ID' })
  public async deleteUser(@Req() req: any, @Param('id') id: string) {
    const currentUserId = req.user?.userId || req.user?.sub;

    if (!currentUserId) {
      throw new BadRequestException(
        'Usuário logado não identificado na requisição.',
      );
    }

    return await this.deleteUserService.execute(id, currentUserId);
  }
}
