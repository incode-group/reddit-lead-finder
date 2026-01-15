'use client';

import { ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface Lead {
  id: string;
  type: 'post' | 'comment';
  confidence: number;
  aiReason: string | null;
  post?: {
    id: string;
    title: string;
    content: string;
    url: string;
    author: string;
    subreddit: {
      name: string;
    };
  };
  comment?: {
    id: string;
    content: string;
    author: string;
    post: {
      title: string;
      subreddit: {
        name: string;
      };
    };
  };
}

interface LeadCardProps {
  lead: Lead;
}

export function LeadCard({ lead }: LeadCardProps) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'success';
    if (confidence >= 0.6) return 'default';
    return 'secondary';
  };

  if (lead.post) {
    return (
      <Card className="hover:border-primary/50 transition-colors">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="text-lg leading-tight">
              <a
                href={lead.post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors flex items-center gap-2"
              >
                {lead.post.title}
                <ExternalLink className="h-4 w-4 opacity-50" />
              </a>
            </CardTitle>
            <Badge variant={getConfidenceColor(lead.confidence) as any}>
              {(lead.confidence * 100).toFixed(0)}%
            </Badge>
          </div>
          <CardDescription className="flex items-center gap-2 text-xs">
            <span>r/{lead.post.subreddit.name}</span>
            <span>•</span>
            <span>u/{lead.post.author}</span>
            <span>•</span>
            <span>Post</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
            {lead.post.content}
          </p>
          {lead.aiReason && (
            <>
              <Separator className="my-3" />
              <p className="text-xs text-muted-foreground italic">
                AI: {lead.aiReason}
              </p>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  if (lead.comment) {
    return (
      <Card className="hover:border-primary/50 transition-colors">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="text-base">
              Comment on: {lead.comment.post.title}
            </CardTitle>
            <Badge variant={getConfidenceColor(lead.confidence) as any}>
              {(lead.confidence * 100).toFixed(0)}%
            </Badge>
          </div>
          <CardDescription className="flex items-center gap-2 text-xs">
            <span>r/{lead.comment.post.subreddit.name}</span>
            <span>•</span>
            <span>u/{lead.comment.author}</span>
            <span>•</span>
            <span>Comment</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
            {lead.comment.content}
          </p>
          {lead.aiReason && (
            <>
              <Separator className="my-3" />
              <p className="text-xs text-muted-foreground italic">
                AI: {lead.aiReason}
              </p>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  return null;
}
