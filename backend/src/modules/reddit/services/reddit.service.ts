import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../../../prisma/prisma.service';

interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  author: string;
  url: string;
  score: number;
  num_comments: number;
  created_utc: number;
  permalink: string;
}

interface RedditComment {
  id: string;
  body: string;
  author: string;
  score: number;
  created_utc: number;
}

interface RedditResponse {
  data: {
    children: Array<{
      data: RedditPost | RedditComment;
    }>;
  };
}

@Injectable()
export class RedditService {
  private readonly logger = new Logger(RedditService.name);
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Get OAuth token for Reddit API
   */
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    const clientId = this.configService.get<string>('REDDIT_CLIENT_ID');
    const clientSecret = this.configService.get<string>('REDDIT_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      // Use public API without auth (rate limited)
      this.logger.warn('Reddit credentials not set, using public API');
      return '';
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          'https://www.reddit.com/api/v1/access_token',
          'grant_type=client_credentials',
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
            },
          },
        ),
      );

      this.accessToken = response.data.access_token;
      const expiresIn = response.data.expires_in || 3600;
      this.tokenExpiry = new Date(Date.now() + (expiresIn - 60) * 1000);

      return this.accessToken;
    } catch (error) {
      this.logger.error('Failed to get Reddit access token', error);
      return '';
    }
  }

  /**
   * Fetch posts from a subreddit
   */
  async fetchPosts(subredditName: string, limit: number = 25): Promise<RedditPost[]> {
    try {
      const token = await this.getAccessToken();
      const headers: Record<string, string> = {
        'User-Agent': 'RedditLeadFinder/1.0',
      };

      const baseUrl = token 
        ? 'https://oauth.reddit.com' 
        : 'https://www.reddit.com';

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const url = `${baseUrl}/r/${subredditName}/new.json?limit=${limit}`;
      const response = await firstValueFrom(
        this.httpService.get<RedditResponse>(url, { headers }),
      );

      return response.data.data.children.map((child) => child.data as RedditPost);
    } catch (error) {
      this.logger.error(`Failed to fetch posts from r/${subredditName}`, error);
      throw error;
    }
  }

  /**
   * Fetch comments from a post
   */
  async fetchComments(postId: string, subredditName: string, limit: number = 100): Promise<RedditComment[]> {
    try {
      const token = await this.getAccessToken();
      const headers: Record<string, string> = {
        'User-Agent': 'RedditLeadFinder/1.0',
      };

      const baseUrl = token 
        ? 'https://oauth.reddit.com' 
        : 'https://www.reddit.com';

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Get comments from post (last week/month)
      const oneWeekAgo = Math.floor((Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000);
      const url = `${baseUrl}/r/${subredditName}/comments/${postId}.json?limit=${limit}`;
      
      const response = await firstValueFrom(
        this.httpService.get<any[]>(url, { headers }),
      );

      // Reddit comments API returns array: [post data, comments data]
      const commentsData = response.data[1]?.data?.children || [];
      const comments: RedditComment[] = [];

      const extractComments = (items: any[]): void => {
        for (const item of items) {
          if (item.kind === 't1' && item.data) {
            const comment = item.data;
            // Filter by time (last week/month)
            if (comment.created_utc >= oneWeekAgo) {
              comments.push({
                id: comment.id,
                body: comment.body || '',
                author: comment.author,
                score: comment.score || 0,
                created_utc: comment.created_utc,
              });
            }
            // Recursively extract replies
            if (comment.replies?.data?.children) {
              extractComments(comment.replies.data.children);
            }
          }
        }
      };

      extractComments(commentsData);

      return comments;
    } catch (error) {
      this.logger.error(`Failed to fetch comments for post ${postId}`, error);
      return [];
    }
  }

  /**
   * Save or update subreddit
   */
  async saveSubreddit(name: string) {
    return this.prisma.subreddit.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  /**
   * Save post to database
   */
  async savePost(redditPost: RedditPost, subredditId: string) {
    return this.prisma.post.upsert({
      where: { redditId: redditPost.id },
      update: {
        title: redditPost.title,
        content: redditPost.selftext || '',
        score: redditPost.score,
        numComments: redditPost.num_comments,
      },
      create: {
        redditId: redditPost.id,
        title: redditPost.title,
        content: redditPost.selftext || '',
        author: redditPost.author,
        url: `https://reddit.com${redditPost.permalink}`,
        score: redditPost.score,
        numComments: redditPost.num_comments,
        createdAt: new Date(redditPost.created_utc * 1000),
        subredditId,
      },
    });
  }

  /**
   * Save comment to database
   */
  async saveComment(redditComment: RedditComment, postId: string) {
    return this.prisma.comment.upsert({
      where: { redditId: redditComment.id },
      update: {
        content: redditComment.body,
        score: redditComment.score,
      },
      create: {
        redditId: redditComment.id,
        content: redditComment.body,
        author: redditComment.author,
        score: redditComment.score,
        createdAt: new Date(redditComment.created_utc * 1000),
        postId,
      },
    });
  }

  /**
   * Parse subreddits: fetch posts and comments
   */
  async parseSubreddits(subredditNames: string[], postsLimit: number = 25): Promise<{
    subreddit: string;
    postsCount: number;
    commentsCount: number;
  }[]> {
    const results = [];

    for (const subredditName of subredditNames) {
      try {
        const subreddit = await this.saveSubreddit(subredditName);
        const posts = await this.fetchPosts(subredditName, postsLimit);
        
        let commentsCount = 0;

        for (const redditPost of posts) {
          const post = await this.savePost(redditPost, subreddit.id);
          
          // Fetch comments for each post
          const comments = await this.fetchComments(redditPost.id, subredditName);
          commentsCount += comments.length;

          for (const redditComment of comments) {
            await this.saveComment(redditComment, post.id);
          }
        }

        results.push({
          subreddit: subredditName,
          postsCount: posts.length,
          commentsCount,
        });
      } catch (error) {
        this.logger.error(`Failed to parse subreddit r/${subredditName}`, error);
        results.push({
          subreddit: subredditName,
          postsCount: 0,
          commentsCount: 0,
          error: error.message,
        });
      }
    }

    return results;
  }
}
