import { Controller, Post, Body, UseGuards, Get, Request, Patch } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Public } from './public.decorator';
import { ValidateCpfService, AuthService, CreatePasswordService, RecoverPasswordService, ChangePasswordService } from './services';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly validateCpfService: ValidateCpfService,
    private readonly createPasswordService: CreatePasswordService,
    private readonly recoverPasswordService: RecoverPasswordService,
    private readonly changePasswordService: ChangePasswordService
  ) {}

  @Public()
  @Post('login/user')
  async login(@Body() body: { cpf: string; password: string }) {
    const user = await this.authService.validateUser(body.cpf, body.password);
    return this.authService.login(user);
  }

  @Public()
  @Post('login/validate-cpf')
  async validateCpf(@Body() body: { cpf: string }) {
    return this.validateCpfService.execute(body.cpf);
  }

  @Public()
  @Post('login/create-password')
  async createPassword(@Body() body: { cpf: string; password: string }) {
    return this.createPasswordService.execute(body.password, body.cpf);
  }

  @Public()
  @Post('login/recover-password')
  async recoverPassword(@Body() body: { email: string }) {
    return this.recoverPasswordService.execute(body.email);
  }

  @Public()
  @Patch('login/reset-password')
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    return this.changePasswordService.execute(body.token, body.newPassword);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('perfil')
  getPerfil(@Request() req) {
    return req.user;
  }
}