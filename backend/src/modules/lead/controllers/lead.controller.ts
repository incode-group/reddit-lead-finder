import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { LeadService } from '../services/lead.service';
import { ParseSubredditsDto } from '../../reddit/dto/parse-subreddits.dto';

@Controller('leads')
export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  @Post('parse-and-analyze')
  async parseAndAnalyze(@Body() dto: ParseSubredditsDto) {
    if (dto.subreddits.length > 5) {
      throw new Error('Maximum 5 subreddits allowed');
    }
    return this.leadService.parseAndAnalyze(dto.subreddits, dto.postsLimit);
  }

  @Get()
  async getLeads(@Query('subredditIds') subredditIds?: string) {
    const ids = subredditIds ? subredditIds.split(',') : undefined;
    return this.leadService.getLeads(ids);
  }

  @Get('statistics')
  async getStatistics(@Query('subredditIds') subredditIds?: string) {
    const ids = subredditIds ? subredditIds.split(',') : undefined;
    return this.leadService.getStatistics(ids);
  }
}
