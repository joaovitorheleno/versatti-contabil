import { Controller, Post, Body, UseGuards, Get, Request, Req, Patch } from '@nestjs/common';
import { AuditActionEnum } from '../../enum/audit-action.enum';
import { AuditService } from '../audit/audit.service';
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
    private readonly changePasswordService: ChangePasswordService,
    private readonly auditService: AuditService,
  ) {}

  @Public()
  @Post('login/user')
  async login(@Body() body: { cpf: string; password: string }, @Req() req: any) {
    let user: Awaited<ReturnType<AuthService['validateUser']>>;
    try {
      user = await this.authService.validateUser(body.cpf, body.password);
    } catch (e) {
      await this.auditService.record({ action: AuditActionEnum.LOGIN_FAILED, userId: null }, req);
      throw e;
    }

    await this.auditService.record({ action: AuditActionEnum.LOGIN, userId: user.id }, req);
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