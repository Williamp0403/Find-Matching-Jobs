import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { JsearchService } from '../jsearch/jsearch.service';
import { JobsService } from './jobs.service';
import { JobsCronService } from './jobs-cron.service';
import { SearchJobsDto, UserRole } from '@find-matching-jobs/types';
import { JobsFilterDto } from './dto/jobs-filter.dto';

@Controller('jobs')
@ApiTags('jobs')
export class JobsController {
  constructor(
    private readonly jobsService: JobsService,
    private readonly jsearchService: JsearchService,
    private readonly jobsCronService: JobsCronService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query() query: JobsFilterDto) {
    return this.jobsService.findAll(query);
  }

  @Get('search')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Buscar vacantes en DB local' })
  searchLocal(@Query() searchDto: SearchJobsDto) {
    return this.jobsService.search(
      searchDto.query,
      searchDto.location,
      searchDto.page,
      searchDto.limit,
    );
  }

  @Post('sync')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async sync(@Query() searchDto: SearchJobsDto) {
    const jobs = await this.jsearchService.fetchJobs(
      searchDto.query,
      searchDto.location,
    );
    const result = await this.jobsService.saveJobs(jobs);
    return { provider: 'jsearch', ...result };
  }

  @Get('cron-sync')
  @Post('cron-sync')
  @ApiOperation({ summary: 'Vercel Cron: sincronización semanal de vacantes' })
  async cronSync(
    @Headers('authorization') authHeader?: string,
    @Headers('user-agent') userAgent?: string,
  ) {
    const secret = process.env.CRON_SECRET;
    const isVercelCron = userAgent && userAgent.includes('vercel-cron');
    const isSecretValid = secret && authHeader === `Bearer ${secret}`;

    // Si se definió CRON_SECRET en el entorno, validamos el token o la procedencia de Vercel Cron
    if (secret && !isSecretValid && !isVercelCron) {
      throw new UnauthorizedException('Invalid cron secret');
    }

    await this.jobsCronService.weeklySync();
    return { ok: true, message: 'Cron sync iniciado correctamente' };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.jobsService.findOne(id, user.userId);
  }
}
