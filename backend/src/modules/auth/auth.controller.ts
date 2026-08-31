import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login/user')
  async login(@Body() body: { cpf: string; password: string }) {
    const user = await this.authService.validateUser(body.cpf, body.password);
    return this.authService.login(user);
  }

  @Public()
  @Post('login/client')
  async loginClient(@Body() body: { cnpj: string; password: string }) {
    const client = await this.authService.validateClient(body.cnpj, body.password);
    return this.authService.login(client);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('perfil')
  getPerfil(@Request() req) {
    return req.user;
  }
}