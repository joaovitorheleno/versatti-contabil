import { Controller, Post, Body, UseGuards, Get, Request, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Public } from './public.decorator';
import { ValidateCpfService, AuthService, CreatePasswordService } from './services';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly validateCpfService: ValidateCpfService,
    private readonly createPasswordService: CreatePasswordService
  ) {}

  @Public()
  @Post('login/user')
  async login(@Body() body: { cpf: string; password: string }) {
    const user = await this.authService.validateUser(body.cpf, body.password);

    if (!user) {
      throw new UnauthorizedException('CPF ou senha inválidos.');
    }

    return this.authService.login(user);
  }

  @Public()
  @Post('login/validate-cpf')
  async validateCpf(@Body() cpf: string ) {
    const user = await this.validateCpfService.execute(cpf);

    if (!user) {
      throw new UnauthorizedException('CPF inválido.');
    }

    return user;
  }

  @Public()
  @Post('login/create-password')
  async createPassword(@Body() body: { cpf: string; password: string }) {
    const user = await this.createPasswordService.execute(body.password, body.cpf);

    if (!user) {
      throw new UnauthorizedException('CPF inválido.');
    }

    return user;
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('perfil')
  getPerfil(@Request() req) {
    return req.user;
  }
}