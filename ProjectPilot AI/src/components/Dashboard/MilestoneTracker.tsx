'use client';

import React, { useState } from 'react';
import { Card, Badge, Button, Input } from '@/components/UI/Primitives';
import { Milestone } from '@/lib/store';
import { CheckCircle, Circle, Calendar, Plus, GitCommit, Check, RefreshCw } from 'lucide-react';

interface MilestoneTrackerProps {
  milestones?: Milestone[];
  onToggleComplete?: (id: string, isCompleted: boolean) => void;
  onAddMilestone?: (title: string, dueDate?: string) => Promise<void> | void;
  isLoading?: boolean;
}

export const MilestoneTracker: React.FC<MilestoneTrackerProps> = ({
  milestones = [],
  onToggleComplete,
  onAddMilestone,
  isLoading = false,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredList = milestones.filter((m) => {
    if (filter === 'PENDING') return !m.isCompleted;
    if (filter === 'COMPLETED') return m.isCompleted;
    return true;
  });

  const completedCount = milestones.filter((m) => m.isCompleted).length;
  const progressPercent = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setIsSubmitting(true);
    try {
      if (onAddMilestone) {
        await onAddMilestone(newTitle.trim(), newDueDate || undefined);
      }
      setNewTitle('');
      setNewDueDate('');
      setIsAdding(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="flex flex-col justify-between h-full bg-slate-900 border-slate-800 text-slate-100">
      <div className="space-y-4">
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <GitCommit className="h-4 w-4 text-blue-400" />
            <h3 className="text-sm font-bold text-slate-200 uppercase font-mono tracking-wider">Project Milestones & Execution Roadmap</h3>
            <Badge variant="slate">{completedCount} / {milestones.length} Completed</Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
              {(['ALL', 'PENDING', 'COMPLETED'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${filter === f ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  {f}
                </button>
              ))}
            </div>
            <Button
              variant={isAdding ? 'ghost' : 'secondary'}
              size="sm"
              onClick={() => setIsAdding(!isAdding)}
              className="text-xs font-mono"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> {isAdding ? 'Close' : 'Add Milestone'}
            </Button>
          </div>
        </div>

        {/* Real-Time Interactive Add Milestone Form */}
        {isAdding && (
          <form onSubmit={handleCreate} className="p-3.5 bg-slate-950/80 rounded-lg border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase font-mono">Schedule New Engineering Milestone</h4>
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <Input
                  placeholder="e.g. Architect PostgreSQL relational schema & migrations"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
              <div>
                <Input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAdding(false)}>Cancel</Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>Save Milestone</Button>
            </div>
          </form>
        )}

        {/* Gantt Velocity Visualizer */}
        <div className="space-y-1.5 bg-slate-950/50 p-3 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 font-medium">Project Completion Velocity</span>
            <span className="text-blue-400 font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Milestones List */}
        {milestones.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-800 rounded-lg bg-slate-950/40">
            <GitCommit className="h-8 w-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">No milestones scheduled for this project</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Click &quot;Add Milestone&quot; above to organize your engineering sprint tasks and track completion velocity in real time.
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {filteredList.map((m) => (
              <div
                key={m.id}
                onClick={() => onToggleComplete && onToggleComplete(m.id, !m.isCompleted)}
                className={`group flex items-start justify-between p-3 rounded-lg border transition-colors cursor-pointer select-none ${
                  m.isCompleted
                    ? 'bg-slate-950/60 border-slate-800/80 text-slate-500'
                    : 'bg-slate-900 border-slate-700/80 text-slate-200 hover:border-blue-500/50'
                }`}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className="mt-0.5 shrink-0">
                    {m.isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-600 group-hover:text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${m.isCompleted ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                      {m.title}
                    </p>
                    {m.dueDate && (
                      <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-500 font-mono">
                        <Calendar className="h-3 w-3" />
                        <span>Due: {new Date(m.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
                <Badge variant={m.isCompleted ? 'success' : 'default'} className="ml-4 shrink-0 text-[10px]">
                  {m.isCompleted ? 'COMPLETED' : 'PENDING'}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
