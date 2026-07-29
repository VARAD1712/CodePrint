'use client';

import React, { useState } from 'react';
import { Card, Badge, Button, Input } from '@/components/UI/Primitives';
import { Document } from '@/lib/store';
import { BookOpen, ExternalLink, Search, Cpu, Database, FileText, Plus, File } from 'lucide-react';

interface DeepSearchCardsProps {
  documents?: Document[];
  onAddDocument?: (doc: { type: string; title: string; summary: string; url?: string }) => Promise<void> | void;
  isLoading?: boolean;
}

export const DeepSearchCards: React.FC<DeepSearchCardsProps> = ({
  documents = [],
  onAddDocument,
  isLoading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [docType, setDocType] = useState('RESEARCH_PAPER');
  const [docTitle, setDocTitle] = useState('');
  const [docSummary, setDocSummary] = useState('');
  const [docUrl, setDocUrl] = useState('');

  const filteredDocs = documents.filter((d) => {
    const matchesType = selectedType === 'ALL' || d.type === selectedType;
    const matchesQuery = d.title.toLowerCase().includes(searchQuery.toLowerCase()) || d.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesQuery;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'RESEARCH_PAPER': return <FileText className="h-4 w-4 text-blue-400" />;
      case 'TECH_STACK': return <Cpu className="h-4 w-4 text-indigo-400" />;
      case 'DATASET': return <Database className="h-4 w-4 text-emerald-400" />;
      default: return <BookOpen className="h-4 w-4 text-slate-400" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'RESEARCH_PAPER': return <Badge variant="blue">Literature / Reference</Badge>;
      case 'TECH_STACK': return <Badge variant="purple">Architecture Spec</Badge>;
      case 'DATASET': return <Badge variant="success">Data / Schema</Badge>;
      default: return <Badge variant="slate">{type}</Badge>;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !docSummary.trim()) return;
    setIsSubmitting(true);
    try {
      if (onAddDocument) {
        await onAddDocument({
          type: docType,
          title: docTitle.trim(),
          summary: docSummary.trim(),
          url: docUrl.trim() || undefined,
        });
      }
      setDocTitle('');
      setDocSummary('');
      setDocUrl('');
      setIsAdding(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-slate-900 border-slate-800 text-slate-100">
      <div className="space-y-4">
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-blue-400" />
            <h3 className="text-sm font-bold text-slate-200 uppercase font-mono tracking-wider">Project Reference Library & Architecture Specifications</h3>
            <Badge variant="slate">{documents.length} Items</Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={isAdding ? 'ghost' : 'secondary'}
              size="sm"
              onClick={() => setIsAdding(!isAdding)}
              className="text-xs font-mono"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> {isAdding ? 'Close' : 'Attach Document / Note'}
            </Button>
          </div>
        </div>

        {/* Real-Time Interactive Creation Form */}
        {isAdding && (
          <form onSubmit={handleSubmit} className="p-4 bg-slate-950/90 rounded-lg border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase font-mono">Attach Project Note or Technical Reference</h4>
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase font-mono mb-1">Document Category</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-md text-xs text-slate-100 py-2 px-3 focus:outline-none focus:border-blue-500"
                  disabled={isSubmitting}
                >
                  <option value="RESEARCH_PAPER">Literature Citation / Academic Reference</option>
                  <option value="TECH_STACK">Technology Stack / System Architecture Spec</option>
                  <option value="DATASET">Dataset Repository / Schema Definition</option>
                  <option value="API">API Specification / Protocol Doc</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <Input
                  label="Document / Note Title"
                  placeholder="e.g. Next.js App Router Architecture Documentation"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase font-mono mb-1">Technical Summary & Supervisory Notes</label>
              <textarea
                value={docSummary}
                onChange={(e) => setDocSummary(e.target.value)}
                rows={2}
                placeholder="Briefly describe why this architectural specification or reference is critical to your venture..."
                className="w-full bg-slate-900 border border-slate-700 rounded-md text-xs text-slate-100 p-2.5 focus:outline-none focus:border-blue-500"
                disabled={isSubmitting}
                required
              />
            </div>
            <div>
              <Input
                label="Reference URL (Optional)"
                placeholder="e.g. https://github.com/..."
                value={docUrl}
                onChange={(e) => setDocUrl(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAdding(false)}>Cancel</Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>Save Reference Note</Button>
            </div>
          </form>
        )}

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono overflow-x-auto shrink-0">
            {(['ALL', 'RESEARCH_PAPER', 'TECH_STACK', 'DATASET', 'API'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer whitespace-nowrap ${selectedType === t ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {t.replace('_', ' ')}
              </button>
            ))}
          </div>
          <div className="flex-1">
            <Input
              icon={<Search className="h-4 w-4" />}
              placeholder="Search reference titles, notes, or dependencies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="py-1.5 bg-slate-950/60"
            />
          </div>
        </div>

        {/* Documents Grid or Empty State */}
        {documents.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-800 rounded-lg bg-slate-950/40">
            <File className="h-8 w-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">No reference notes or architecture specifications attached</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Click &quot;Attach Document / Note&quot; to compile your academic bibliography, API endpoints, or architecture notes for supervisory grading.
            </p>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs">No matching specifications found for your current filter query.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="flex flex-col justify-between p-4 rounded-xl bg-slate-950/70 border border-slate-800 transition-colors hover:border-slate-700 space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 font-mono text-xs font-semibold text-slate-300 truncate">
                      {getTypeIcon(doc.type)}
                      <span className="truncate">{doc.type.replace('_', ' ')}</span>
                    </div>
                    {getTypeBadge(doc.type)}
                  </div>
                  <h4 className="text-sm font-bold text-slate-100 leading-snug">{doc.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{doc.summary}</p>
                </div>
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  {doc.url ? (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-mono transition-colors"
                    >
                      Open Reference URL <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-500 font-mono">Internal Supervisory Note</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
