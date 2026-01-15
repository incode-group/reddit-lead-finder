import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { RedditService } from './services/reddit.service';
import { RedditController } from './controllers/reddit.controller';

@Module({
  imports: [HttpModule],
  controllers: [RedditController],
  providers: [RedditService],
  exports: [RedditService],
})
export class RedditModule {}
