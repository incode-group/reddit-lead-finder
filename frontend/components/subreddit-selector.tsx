'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SubredditSelectorProps {
  subreddits: string[];
  onSubredditsChange: (subreddits: string[]) => void;
  suggestedSubreddits: string[];
  maxSubreddits?: number;
}

export function SubredditSelector({
  subreddits,
  onSubredditsChange,
  suggestedSubreddits,
  maxSubreddits = 5,
}: SubredditSelectorProps) {
  const [inputValue, setInputValue] = useState('');

  const addSubreddit = (name: string) => {
    const cleanName = name.trim().replace(/^r\//, '').replace(/\//g, '');
    if (cleanName && !subreddits.includes(cleanName) && subreddits.length < maxSubreddits) {
      onSubredditsChange([...subreddits, cleanName]);
      setInputValue('');
    }
  };

  const removeSubreddit = (name: string) => {
    onSubredditsChange(subreddits.filter((s) => s !== name));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSubreddit(inputValue);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Subreddits</CardTitle>
        <CardDescription>
          Choose up to {maxSubreddits} subreddits to analyze for leads
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="subreddit-input">Add Subreddit</Label>
          <div className="flex gap-2">
            <Input
              id="subreddit-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., webdev, forhire, startups"
              disabled={subreddits.length >= maxSubreddits}
            />
            <Button
              onClick={() => addSubreddit(inputValue)}
              disabled={subreddits.length >= maxSubreddits || !inputValue.trim()}
            >
              Add
            </Button>
          </div>
        </div>

        {suggestedSubreddits.length > 0 && (
          <div className="space-y-2">
            <Label>Suggested Subreddits</Label>
            <div className="flex flex-wrap gap-2">
              {suggestedSubreddits.map((sub) => (
                <Button
                  key={sub}
                  variant="outline"
                  size="sm"
                  onClick={() => addSubreddit(sub)}
                  disabled={subreddits.includes(sub) || subreddits.length >= maxSubreddits}
                >
                  r/{sub}
                </Button>
              ))}
            </div>
          </div>
        )}

        {subreddits.length > 0 && (
          <div className="space-y-2">
            <Label>Selected Subreddits ({subreddits.length}/{maxSubreddits})</Label>
            <div className="flex flex-wrap gap-2">
              {subreddits.map((sub) => (
                <Badge key={sub} variant="secondary" className="gap-1 pr-1">
                  <span>r/{sub}</span>
                  <button
                    onClick={() => removeSubreddit(sub)}
                    className="ml-1 rounded-full hover:bg-muted p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
