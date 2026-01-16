'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, Users, MessageSquare, Target, Zap, BarChart3 } from 'lucide-react';

interface AnalyticsDashboardProps {
  statistics: any[];
  leads: any[];
}

export function AnalyticsDashboard({ statistics, leads }: AnalyticsDashboardProps) {
  // Calculate metrics
  const totalPosts = statistics.reduce((sum, stat) => sum + stat.posts.total, 0);
  const totalComments = statistics.reduce((sum, stat) => sum + stat.comments.total, 0);
  const totalLeads = statistics.reduce((sum, stat) => sum + stat.posts.leads + stat.comments.leads, 0);
  const totalItems = totalPosts + totalComments;
  const conversionRate = totalItems > 0 ? (totalLeads / totalItems) * 100 : 0;

  // Calculate average confidence
  const avgConfidence = leads.length > 0
    ? leads.reduce((sum, lead) => sum + lead.confidence, 0) / leads.length
    : 0;

  // Leads by type
  const leadsByType = {
    posts: leads.filter(l => l.type === 'post').length,
    comments: leads.filter(l => l.type === 'comment').length,
  };

  // Confidence distribution
  const confidenceDistribution = {
    high: leads.filter(l => l.confidence >= 0.8).length,
    medium: leads.filter(l => l.confidence >= 0.6 && l.confidence < 0.8).length,
    low: leads.filter(l => l.confidence < 0.6).length,
  };

  // Top subreddits by leads
  const topSubreddits = statistics
    .map(stat => ({
      name: stat.subreddit,
      leads: stat.posts.leads + stat.comments.leads,
      posts: stat.posts.total,
      coefficient: (stat.posts.coefficient + stat.comments.coefficient) / 2,
    }))
    .sort((a, b) => b.leads - a.leads)
    .slice(0, 5);

  const metrics = [
    {
      label: 'Total Analyzed',
      value: totalItems.toLocaleString(),
      description: `${totalPosts} posts, ${totalComments} comments`,
      icon: BarChart3,
      color: 'text-blue-400',
    },
    {
      label: 'Leads Found',
      value: totalLeads.toLocaleString(),
      description: `${conversionRate.toFixed(1)}% conversion rate`,
      icon: Target,
      color: 'text-green-400',
    },
    {
      label: 'Avg Confidence',
      value: `${(avgConfidence * 100).toFixed(0)}%`,
      description: 'AI confidence score',
      icon: Zap,
      color: 'text-yellow-400',
    },
    {
      label: 'Top Subreddit',
      value: topSubreddits[0]?.name ? `r/${topSubreddits[0].name}` : 'N/A',
      description: topSubreddits[0]?.leads ? `${topSubreddits[0].leads} leads` : '',
      icon: TrendingUp,
      color: 'text-purple-400',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="hover:border-primary/30 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {metric.label}
                </CardTitle>
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-semibold tracking-tight mb-1">
                {metric.value}
              </div>
              <p className="text-xs text-muted-foreground">{metric.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Leads by Type */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold tracking-tight flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Leads by Type
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-sm font-medium">Posts</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    {leadsByType.posts} leads
                  </span>
                  <Badge variant="default" className="text-xs">
                    {totalPosts > 0 ? ((leadsByType.posts / totalPosts) * 100).toFixed(1) : 0}%
                  </Badge>
                </div>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{
                    width: `${totalPosts > 0 ? (leadsByType.posts / totalPosts) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <Separator className="bg-border" />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-sm font-medium">Comments</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    {leadsByType.comments} leads
                  </span>
                  <Badge variant="success" className="text-xs">
                    {totalComments > 0 ? ((leadsByType.comments / totalComments) * 100).toFixed(1) : 0}%
                  </Badge>
                </div>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-400 rounded-full transition-all duration-500"
                  style={{
                    width: `${totalComments > 0 ? (leadsByType.comments / totalComments) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Confidence Distribution */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold tracking-tight flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Confidence Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-sm font-medium">High (≥80%)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    {confidenceDistribution.high} leads
                  </span>
                  <Badge variant="success" className="text-xs">
                    {totalLeads > 0 ? ((confidenceDistribution.high / totalLeads) * 100).toFixed(0) : 0}%
                  </Badge>
                </div>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-400 rounded-full transition-all duration-500"
                  style={{
                    width: `${totalLeads > 0 ? (confidenceDistribution.high / totalLeads) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-yellow-400" />
                  <span className="text-sm font-medium">Medium (60-79%)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    {confidenceDistribution.medium} leads
                  </span>
                  <Badge variant="default" className="text-xs">
                    {totalLeads > 0 ? ((confidenceDistribution.medium / totalLeads) * 100).toFixed(0) : 0}%
                  </Badge>
                </div>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                  style={{
                    width: `${totalLeads > 0 ? (confidenceDistribution.medium / totalLeads) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <Separator className="bg-border" />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <span className="text-sm font-medium">Low (&lt;60%)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    {confidenceDistribution.low} leads
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {totalLeads > 0 ? ((confidenceDistribution.low / totalLeads) * 100).toFixed(0) : 0}%
                  </Badge>
                </div>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-400 rounded-full transition-all duration-500"
                  style={{
                    width: `${totalLeads > 0 ? (confidenceDistribution.low / totalLeads) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Subreddits */}
        {topSubreddits.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold tracking-tight flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Top Subreddits by Leads
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {topSubreddits.map((sub, index) => (
                  <div key={sub.name} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-muted-foreground w-6">
                          #{index + 1}
                        </span>
                        <span className="text-sm font-semibold">r/{sub.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {(sub.coefficient * 100).toFixed(1)}% rate
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-muted-foreground">
                          {sub.posts} posts
                        </span>
                        <span className="text-sm font-semibold">
                          {sub.leads} leads
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{
                          width: `${topSubreddits[0].leads > 0 ? (sub.leads / topSubreddits[0].leads) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
