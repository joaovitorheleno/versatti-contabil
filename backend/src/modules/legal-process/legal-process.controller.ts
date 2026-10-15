import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { currentUserFrom } from '../../common/utils/client-access';
import { AdminGuard } from '../auth/admin.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  AddLegalProcessStepDto,
  CreateLegalProcessDto,
  ListLegalProcessQueryDto,
  UpdateLegalProcessDto,
  UpdateLegalProcessStepDto,
} from './dto/legal-process.dto';
import { LegalProcessService } from './legal-process.service';

@ApiTags('Processos paralegais')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('legal-process')
export class LegalProcessController {
  constructor(private readonly service: LegalProcessService) {}

  @Get()
  @ApiOperation({ summary: 'Lista processos (admin: todos; cliente: os das suas empresas)' })
  list(@Req() req: any, @Query() query: ListLegalProcessQueryDto) {
    return this.service.list(currentUserFrom(req), query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe do processo com as etapas' })
  get(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.get(currentUserFrom(req), id);
  }

  @Post()
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Cria um processo com as etapas padrão do tipo' })
  create(@Req() req: any, @Body() dto: CreateLegalProcessDto) {
    return this.service.create(currentUserFrom(req), dto);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Altera título, descrição, previsão ou situação' })
  update(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLegalProcessDto,
  ) {
    return this.service.update(currentUserFrom(req), id, dto);
  }

  @Post(':id/steps')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Adiciona uma etapa ao processo' })
  addStep(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddLegalProcessStepDto,
  ) {
    return this.service.addStep(currentUserFrom(req), id, dto);
  }

  @Patch(':id/steps/:stepId')
  @UseGuards(AdminGuard)
  @ApiOperation({
    summary: 'Marca/desmarca etapa ou altera a observação. Avisa o cliente por e-mail ao concluir',
  })
  updateStep(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('stepId', ParseUUIDPipe) stepId: string,
    @Body() dto: UpdateLegalProcessStepDto,
  ) {
    return this.service.updateStep(currentUserFrom(req), id, stepId, dto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Exclui o processo (soft delete)' })
  remove(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(currentUserFrom(req), id);
  }
}
