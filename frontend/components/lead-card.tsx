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
      <Card className="hover:border-primary/30 transition-colors group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="text-base font-semibold tracking-tight leading-snug flex-1">
              <a
                href={lead.post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors flex items-start gap-2 group/link"
              >
                <span className="flex-1">{lead.post.title}</span>
                <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover/link:opacity-50 transition-opacity mt-0.5 flex-shrink-0" />
              </a>
            </CardTitle>
            <Badge variant={getConfidenceColor(lead.confidence) as any} className="ml-2 flex-shrink-0">
              {(lead.confidence * 100).toFixed(0)}%
            </Badge>
          </div>
          <CardDescription className="flex items-center gap-2 text-xs mt-2">
            <span className="text-muted-foreground">r/{lead.post.subreddit.name}</span>
            <span className="text-border">•</span>
            <span className="text-muted-foreground">u/{lead.post.author}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {lead.post.content}
          </p>
          {lead.aiReason && (
            <>
              <Separator className="bg-border" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                {lead.aiReason}
              </p>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  if (lead.comment) {
    return (
      <Card className="hover:border-primary/30 transition-colors group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-sm font-medium text-muted-foreground mb-1">
                Comment on
              </CardTitle>
              <CardTitle className="text-base font-semibold tracking-tight leading-snug">
                {lead.comment.post.title}
              </CardTitle>
            </div>
            <Badge variant={getConfidenceColor(lead.confidence) as any} className="ml-2 flex-shrink-0">
              {(lead.confidence * 100).toFixed(0)}%
            </Badge>
          </div>
          <CardDescription className="flex items-center gap-2 text-xs mt-2">
            <span className="text-muted-foreground">r/{lead.comment.post.subreddit.name}</span>
            <span className="text-border">•</span>
            <span className="text-muted-foreground">u/{lead.comment.author}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {lead.comment.content}
          </p>
          {lead.aiReason && (
            <>
              <Separator className="bg-border" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                {lead.aiReason}
              </p>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  return null;
}
