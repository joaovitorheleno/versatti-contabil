import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrivacyService } from './privacy.service';

class AcceptTermsDto {
  @ApiProperty({ example: '2026-10' })
  @IsString()
  @IsNotEmpty()
  version!: string;
}

@ApiTags('Privacidade (LGPD)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('privacy')
export class PrivacyController {
  constructor(private readonly privacyService: PrivacyService) {}

  @Get('status')
  @ApiOperation({ summary: 'Versão atual dos termos e se o usuário já aceitou' })
  status(@Req() req: any) {
    return this.privacyService.status(req.user?.userId);
  }

  @Post('accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Registra o aceite dos termos de uso e privacidade' })
  accept(@Req() req: any, @Body() dto: AcceptTermsDto) {
    return this.privacyService.accept(req.user?.userId, dto.version, req);
  }

  @Get('my-data')
  @ApiOperation({ summary: 'Exporta os dados pessoais do próprio usuário (art. 18 da LGPD)' })
  myData(@Req() req: any) {
    return this.privacyService.myData(req.user?.userId, req);
  }
}
