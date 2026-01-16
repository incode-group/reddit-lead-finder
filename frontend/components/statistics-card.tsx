'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface SubredditStat {
  subreddit: string;
  posts: {
    total: number;
    leads: number;
    coefficient: number;
  };
  comments: {
    total: number;
    leads: number;
    coefficient: number;
  };
}

interface StatisticsCardProps {
  stat: SubredditStat;
}

export function StatisticsCard({ stat }: StatisticsCardProps) {
  return (
    <Card className="hover:border-primary/30 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold tracking-tight">
            r/{stat.subreddit}
          </CardTitle>
          <Badge variant="default" className="text-xs">
            {(stat.posts.coefficient * 100).toFixed(1)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">Posts</span>
            <span className="text-foreground font-medium">{stat.posts.leads} / {stat.posts.total}</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${stat.posts.coefficient * 100}%` }}
            />
          </div>
        </div>

        <Separator className="bg-border" />

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">Comments</span>
            <span className="text-foreground font-medium">{stat.comments.leads} / {stat.comments.total}</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${stat.comments.coefficient * 100}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
