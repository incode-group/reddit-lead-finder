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
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold tracking-tight">Select Subreddits</CardTitle>
        <CardDescription className="text-xs">
          Choose up to {maxSubreddits} subreddits to analyze
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div className="space-y-2">
          <Label htmlFor="subreddit-input" className="text-xs font-medium">Add Subreddit</Label>
          <div className="flex gap-2">
            <Input
              id="subreddit-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="webdev, forhire, startups"
              disabled={subreddits.length >= maxSubreddits}
              className="text-sm"
            />
            <Button
              onClick={() => addSubreddit(inputValue)}
              disabled={subreddits.length >= maxSubreddits || !inputValue.trim()}
              size="sm"
            >
              Add
            </Button>
          </div>
        </div>

        {suggestedSubreddits.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">Suggested</Label>
            <div className="flex flex-wrap gap-2">
              {suggestedSubreddits.map((sub) => (
                <Button
                  key={sub}
                  variant="outline"
                  size="sm"
                  onClick={() => addSubreddit(sub)}
                  disabled={subreddits.includes(sub) || subreddits.length >= maxSubreddits}
                  className="text-xs h-7"
                >
                  r/{sub}
                </Button>
              ))}
            </div>
          </div>
        )}

        {subreddits.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">
              Selected ({subreddits.length}/{maxSubreddits})
            </Label>
            <div className="flex flex-wrap gap-2">
              {subreddits.map((sub) => (
                <Badge key={sub} variant="secondary" className="gap-1.5 pr-1.5 h-7 text-xs">
                  <span>r/{sub}</span>
                  <button
                    onClick={() => removeSubreddit(sub)}
                    className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5 transition-colors"
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
