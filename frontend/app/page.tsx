'use client';

import { useState, useEffect } from 'react';
import { Search, Settings2 } from 'lucide-react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SubredditSelector } from '@/components/subreddit-selector';
import { StatisticsCard } from '@/components/statistics-card';
import { LeadCard } from '@/components/lead-card';
import { LoadingState, StatisticsSkeleton } from '@/components/loading-state';
import { ErrorMessage } from '@/components/error-message';
import { Separator } from '@/components/ui/separator';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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

export default function Home() {
  const [subreddits, setSubreddits] = useState<string[]>([]);
  const [suggestedSubreddits, setSuggestedSubreddits] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [statistics, setStatistics] = useState<SubredditStat[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [postsLimit, setPostsLimit] = useState(25);

  useEffect(() => {
    fetchSuggestedSubreddits();
  }, []);

  const fetchSuggestedSubreddits = async () => {
    try {
      const response = await axios.get(`${API_URL}/reddit/subreddits`);
      setSuggestedSubreddits(response.data.suggested || []);
    } catch (err) {
      console.error('Failed to fetch suggested subreddits', err);
    }
  };

  const handleParseAndAnalyze = async () => {
    if (subreddits.length === 0) {
      setError('Please select at least one subreddit');
      return;
    }

    setError(null);
    setAnalyzing(true);
    setStatistics([]);
    setLeads([]);

    try {
      const response = await axios.post(`${API_URL}/leads/parse-and-analyze`, {
        subreddits,
        postsLimit,
      });

      setStatistics(response.data.statistics || []);

      // Fetch leads
      const leadsResponse = await axios.get(`${API_URL}/leads`);
      setLeads(leadsResponse.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to parse and analyze');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Reddit Lead Finder
          </h1>
          <p className="text-muted-foreground">
            Discover IT service opportunities from Reddit posts and comments
          </p>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Controls */}
          <div className="lg:col-span-1 space-y-6">
            <SubredditSelector
              subreddits={subreddits}
              onSubredditsChange={setSubreddits}
              suggestedSubreddits={suggestedSubreddits}
              maxSubreddits={5}
            />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings2 className="h-4 w-4" />
                  Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="posts-limit">Posts Limit per Subreddit</Label>
                  <Input
                    id="posts-limit"
                    type="number"
                    value={postsLimit}
                    onChange={(e) => setPostsLimit(parseInt(e.target.value) || 25)}
                    min="1"
                    max="100"
                  />
                </div>
                <Button
                  onClick={handleParseAndAnalyze}
                  disabled={analyzing || subreddits.length === 0}
                  className="w-full"
                >
                  <Search className="h-4 w-4 mr-2" />
                  {analyzing ? 'Analyzing...' : 'Parse & Analyze'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-2 space-y-6">
            {error && <ErrorMessage message={error} />}

            {analyzing && <LoadingState />}

            {!analyzing && statistics.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Statistics</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {statistics.map((stat) => (
                    <StatisticsCard key={stat.subreddit} stat={stat} />
                  ))}
                </div>
              </div>
            )}

            {!analyzing && leads.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold">
                    Found Leads ({leads.length})
                  </h2>
                </div>
                <div className="grid gap-4">
                  {leads.map((lead) => (
                    <LeadCard key={lead.id} lead={lead} />
                  ))}
                </div>
              </div>
            )}

            {!analyzing && statistics.length === 0 && leads.length === 0 && !error && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Search className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No results yet</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-md">
                    Select subreddits and click "Parse & Analyze" to start finding leads
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
