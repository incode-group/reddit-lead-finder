import { Module } from '@nestjs/common';
import { LeadController } from './controllers/lead.controller';
import { LeadService } from './services/lead.service';
import { RedditModule } from '../reddit/reddit.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [RedditModule, AiModule],
  controllers: [LeadController],
  providers: [LeadService],
})
export class LeadModule {}
