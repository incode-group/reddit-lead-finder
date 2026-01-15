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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>r/{stat.subreddit}</span>
          <Badge variant="outline">
            {(stat.posts.coefficient * 100).toFixed(1)}% leads
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Posts</span>
            <span className="font-medium">{stat.posts.leads} / {stat.posts.total}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${stat.posts.coefficient * 100}%` }}
            />
          </div>
        </div>

        <Separator />

        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Comments</span>
            <span className="font-medium">{stat.comments.leads} / {stat.comments.total}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${stat.comments.coefficient * 100}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
