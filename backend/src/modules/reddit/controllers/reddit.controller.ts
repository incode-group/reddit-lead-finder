import { Controller, Post, Body, Get } from '@nestjs/common';
import { RedditService } from '../services/reddit.service';
import { ParseSubredditsDto } from '../dto/parse-subreddits.dto';

@Controller('reddit')
export class RedditController {
  constructor(private readonly redditService: RedditService) {}

  @Post('parse')
  async parseSubreddits(@Body() dto: ParseSubredditsDto) {
    return this.redditService.parseSubreddits(dto.subreddits, dto.postsLimit);
  }

  @Get('subreddits')
  async getSubreddits() {
    // Return list of available subreddits (can be extended with search)
    return {
      suggested: [
        'webdev',
        'forhire',
        'startups',
        'entrepreneur',
        'smallbusiness',
        'freelance',
        'SideProject',
        'indiebiz',
      ],
    };
  }
}
