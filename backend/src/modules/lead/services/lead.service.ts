import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { RedditService } from '../../reddit/services/reddit.service';
import { AiService } from '../../ai/services/ai.service';

@Injectable()
export class LeadService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redditService: RedditService,
    private readonly aiService: AiService,
  ) {}

  /**
   * Parse subreddits and analyze for leads
   */
  async parseAndAnalyze(subreddits: string[], postsLimit: number = 25) {
    // Step 1: Parse subreddits (fetch posts and comments)
    const parseResults = await this.redditService.parseSubreddits(subreddits, postsLimit);

    // Step 2: Get subreddit IDs
    const subredditEntities = await Promise.all(
      subreddits.map((name) => this.prisma.subreddit.findUnique({ where: { name } })),
    );
    const subredditIds = subredditEntities
      .filter((s) => s !== null)
      .map((s) => s.id);

    // Step 3: Analyze posts and comments
    const analysisResults = await this.aiService.analyzeAll(subredditIds);

    // Step 4: Get statistics per subreddit
    const statistics = await Promise.all(
      subredditIds.map(async (subredditId) => {
        const subreddit = await this.prisma.subreddit.findUnique({
          where: { id: subredditId },
        });

        const posts = await this.prisma.post.findMany({
          where: { subredditId },
        });

        const comments = await this.prisma.comment.findMany({
          where: {
            post: {
              subredditId,
            },
          },
        });

        const leadPosts = posts.filter((p) => p.isLead).length;
        const leadComments = comments.filter((c) => c.isLead).length;

        return {
          subreddit: subreddit.name,
          posts: {
            total: posts.length,
            leads: leadPosts,
            coefficient: posts.length > 0 ? leadPosts / posts.length : 0,
          },
          comments: {
            total: comments.length,
            leads: leadComments,
            coefficient: comments.length > 0 ? leadComments / comments.length : 0,
          },
        };
      }),
    );

    return {
      parseResults,
      analysis: analysisResults,
      statistics,
    };
  }

  /**
   * Get all leads
   */
  async getLeads(subredditIds?: string[]) {
    const where: any = {};

    if (subredditIds && subredditIds.length > 0) {
      where.OR = [
        {
          post: {
            subredditId: { in: subredditIds },
          },
        },
        {
          comment: {
            post: {
              subredditId: { in: subredditIds },
            },
          },
        },
      ];
    }

    return this.prisma.lead.findMany({
      where,
      include: {
        post: {
          include: {
            subreddit: true,
          },
        },
        comment: {
          include: {
            post: {
              include: {
                subreddit: true,
              },
            },
          },
        },
      },
      orderBy: [
        { confidence: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  /**
   * Get statistics
   */
  async getStatistics(subredditIds?: string[]) {
    const where: any = {};

    if (subredditIds && subredditIds.length > 0) {
      where.id = { in: subredditIds };
    }

    const subreddits = await this.prisma.subreddit.findMany({ where });

    const statistics = await Promise.all(
      subreddits.map(async (subreddit) => {
        const posts = await this.prisma.post.findMany({
          where: { subredditId: subreddit.id },
        });

        const comments = await this.prisma.comment.findMany({
          where: {
            post: {
              subredditId: subreddit.id,
            },
          },
        });

        const leadPosts = posts.filter((p) => p.isLead).length;
        const leadComments = comments.filter((c) => c.isLead).length;

        return {
          subreddit: subreddit.name,
          posts: {
            total: posts.length,
            leads: leadPosts,
            coefficient: posts.length > 0 ? leadPosts / posts.length : 0,
          },
          comments: {
            total: comments.length,
            leads: leadComments,
            coefficient: comments.length > 0 ? leadComments / comments.length : 0,
          },
        };
      }),
    );

    return statistics;
  }
}
