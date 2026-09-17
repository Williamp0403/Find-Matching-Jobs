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
@UseGuards(JwtAuthGuard)
export class JobsController {
  constructor(
    private readonly jobsService: JobsService,
    private readonly jsearchService: JsearchService,
    private readonly jobsCronService: JobsCronService,
  ) {}

  @Get()
  findAll(@Query() query: JobsFilterDto) {
    return this.jobsService.findAll(query);
  }

  @Get('search')
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

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.jobsService.findOne(id, user.userId);
  }

  @Post('cron-sync')
  @UseGuards() // Sobrescribe el guard a nivel de controlador: sin JWT
  @ApiOperation({ summary: 'Vercel Cron: sincronización semanal de vacantes' })
  async cronSync(@Headers('authorization') authHeader: string) {
    const secret = process.env.CRON_SECRET;
    const expected = `Bearer ${secret}`;
    if (!secret || authHeader !== expected) {
      throw new UnauthorizedException('Invalid cron secret');
    }
    await this.jobsCronService.weeklySync();
    return { ok: true, message: 'Cron sync iniciado correctamente' };
  }
}
