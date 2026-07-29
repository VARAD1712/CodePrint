'use client';

import React from 'react';
import { Card, Badge, Button } from '@/components/UI/Primitives';
import { FolderGit2, GitPullRequest, GitCommit, GitBranch, RefreshCw, AlertCircle } from 'lucide-react';

interface GitHubStatusWidgetProps {
  repoName?: string | null;
  commitsCount?: number;
  openPRsCount?: number;
  onSyncRepo?: () => void;
  isLoading?: boolean;
}

export const GitHubStatusWidget: React.FC<GitHubStatusWidgetProps> = ({
  repoName = null,
  commitsCount = 0,
  openPRsCount = 0,
  onSyncRepo,
  isLoading = false,
}) => {
  return (
    <Card className="flex flex-col justify-between h-full bg-slate-900 border-slate-800 text-slate-100">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 min-w-0">
            <FolderGit2 className="h-4 w-4 text-blue-400 shrink-0" />
            <span className="text-sm font-bold text-slate-200 tracking-tight font-mono truncate">
              {repoName ? repoName : 'GitHub Repository Sync'}
            </span>
          </div>
          {repoName && (
            <Badge variant="slate" className="font-mono text-[10px] flex items-center gap-1 shrink-0">
              <GitBranch className="h-3 w-3 text-emerald-400" /> main
            </Badge>
          )}
        </div>

        {!repoName ? (
          <div className="text-center py-8 border border-dashed border-slate-800 rounded-lg bg-slate-950/40 space-y-2">
            <FolderGit2 className="h-8 w-8 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">No repository connected</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Connect a real GitHub repository endpoint when creating your project to enable automatic commit frequency tracking and supervisory audit verification.
            </p>
          </div>
        ) : (
          <>
            {/* Live Metrics Cards */}
            <div className="grid grid-cols-3 gap-3 font-mono">
              <div className="p-3 rounded bg-slate-950/80 border border-slate-800 flex flex-col justify-center">
                <span className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
                  <GitCommit className="h-3 w-3 text-blue-400" /> Total Commits
                </span>
                <span className="text-xl font-bold text-white mt-1">{commitsCount}</span>
              </div>
              <div className="p-3 rounded bg-slate-950/80 border border-slate-800 flex flex-col justify-center">
                <span className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
                  <GitPullRequest className="h-3 w-3 text-emerald-400" /> Open PRs
                </span>
                <span className="text-xl font-bold text-emerald-400 mt-1">{openPRsCount}</span>
              </div>
              <div className="p-3 rounded bg-slate-950/80 border border-slate-800 flex flex-col justify-center">
                <span className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
                  Commit Velocity
                </span>
                <span className="text-xl font-bold text-blue-400 mt-1">Active</span>
              </div>
            </div>

            {/* Sync Controls & Provenance info */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border-t border-slate-800 font-mono">
              <span className="text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Synchronized with GitHub WebHooks
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={onSyncRepo}
                isLoading={isLoading}
                className="text-xs w-full sm:w-auto"
              >
                <RefreshCw className="h-3 w-3 mr-1.5" /> Refresh Commit Stream
              </Button>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};
