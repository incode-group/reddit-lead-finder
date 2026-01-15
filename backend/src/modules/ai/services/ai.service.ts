import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { PrismaService } from '../../../prisma/prisma.service';
import { LeadType } from '@prisma/client';

interface AiAnalysisResult {
  isLead: boolean;
  confidence: number;
  reason: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    } else {
      this.logger.warn('OpenAI API key not found. AI filtering will not work.');
    }
  }

  /**
   * Analyze if a text is a lead (request for IT services) or just advice/recommendation
   */
  async analyzeText(text: string, type: 'post' | 'comment' = 'post'): Promise<AiAnalysisResult> {
    if (!this.openai) {
      // Fallback: simple keyword matching if OpenAI is not configured
      return this.fallbackAnalysis(text);
    }

    const prompt = `Analyze the following Reddit ${type} and determine if it's a request for IT services (web development, software development, hiring developers, etc.) or just asking for advice/recommendations.

Rules:
- If the post/comment is asking to HIRE someone, looking for a DEVELOPER, or requesting a SERVICE - mark as LEAD (isLead: true)
- If it's just asking for ADVICE, RECOMMENDATIONS, or GENERAL QUESTIONS - mark as NOT a lead (isLead: false)
- Provide confidence score from 0 to 1
- Provide a brief reason

Text to analyze:
"${text.substring(0, 2000)}"

Respond in JSON format:
{
  "isLead": boolean,
  "confidence": number (0-1),
  "reason": "brief explanation"
}`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at identifying business leads from Reddit posts. Respond only with valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 200,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return this.fallbackAnalysis(text);
      }

      // Parse JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return {
          isLead: result.isLead || false,
          confidence: result.confidence || 0.5,
          reason: result.reason || 'AI analysis completed',
        };
      }

      return this.fallbackAnalysis(text);
    } catch (error) {
      this.logger.error('OpenAI API error', error);
      return this.fallbackAnalysis(text);
    }
  }

  /**
   * Fallback analysis using keyword matching
   */
  private fallbackAnalysis(text: string): AiAnalysisResult {
    const lowerText = text.toLowerCase();
    const leadKeywords = [
      'looking for',
      'need a developer',
      'hire',
      'hiring',
      'freelancer',
      'contractor',
      'budget',
      'quote',
      'estimate',
      'project',
      'build',
      'develop',
      'create',
    ];
    const adviceKeywords = ['advice', 'recommend', 'suggest', 'what should', 'how to', 'question'];

    const leadMatches = leadKeywords.filter((keyword) => lowerText.includes(keyword)).length;
    const adviceMatches = adviceKeywords.filter((keyword) => lowerText.includes(keyword)).length;

    const isLead = leadMatches > adviceMatches && leadMatches > 0;
    const confidence = Math.min(0.7, 0.3 + (leadMatches * 0.1));

    return {
      isLead,
      confidence,
      reason: `Keyword analysis: ${leadMatches} lead indicators, ${adviceMatches} advice indicators`,
    };
  }

  /**
   * Analyze and mark posts as leads
   */
  async analyzePosts(subredditIds?: string[]): Promise<{ analyzed: number; leads: number }> {
    const where: any = {
      isLead: false,
    };

    if (subredditIds && subredditIds.length > 0) {
      where.subredditId = { in: subredditIds };
    }

    const posts = await this.prisma.post.findMany({ where });
    let leadsCount = 0;

    for (const post of posts) {
      const analysis = await this.analyzeText(`${post.title}\n\n${post.content}`, 'post');
      
      await this.prisma.post.update({
        where: { id: post.id },
        data: {
          isLead: analysis.isLead,
          leadScore: analysis.confidence,
        },
      });

      if (analysis.isLead) {
        leadsCount++;
        // Create lead record
        await this.prisma.lead.create({
          data: {
            type: LeadType.post,
            confidence: analysis.confidence,
            aiReason: analysis.reason,
            postId: post.id,
          },
        });
      }
    }

    return { analyzed: posts.length, leads: leadsCount };
  }

  /**
   * Analyze and mark comments as leads
   */
  async analyzeComments(postIds?: string[]): Promise<{ analyzed: number; leads: number }> {
    const where: any = {
      isLead: false,
    };

    if (postIds && postIds.length > 0) {
      where.postId = { in: postIds };
    }

    const comments = await this.prisma.comment.findMany({ where });
    let leadsCount = 0;

    for (const comment of comments) {
      const analysis = await this.analyzeText(comment.content, 'comment');
      
      await this.prisma.comment.update({
        where: { id: comment.id },
        data: {
          isLead: analysis.isLead,
          leadScore: analysis.confidence,
        },
      });

      if (analysis.isLead) {
        leadsCount++;
        // Create lead record
        await this.prisma.lead.create({
          data: {
            type: LeadType.comment,
            confidence: analysis.confidence,
            aiReason: analysis.reason,
            commentId: comment.id,
          },
        });
      }
    }

    return { analyzed: comments.length, leads: leadsCount };
  }

  /**
   * Analyze all posts and comments for given subreddits
   */
  async analyzeAll(subredditIds: string[]): Promise<{
    posts: { analyzed: number; leads: number };
    comments: { analyzed: number; leads: number };
  }> {
    const postsResult = await this.analyzePosts(subredditIds);
    
    // Get post IDs for these subreddits
    const posts = await this.prisma.post.findMany({
      where: { subredditId: { in: subredditIds } },
      select: { id: true },
    });
    const postIds = posts.map((p) => p.id);
    
    const commentsResult = await this.analyzeComments(postIds);

    return {
      posts: postsResult,
      comments: commentsResult,
    };
  }
}
