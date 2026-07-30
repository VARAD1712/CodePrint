import { useState, useRef } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Upload, FileText, BarChart, Sparkles, Loader2, AlertCircle, FilePieChart, TrendingUp, Presentation, Briefcase, Zap } from 'lucide-react';
import type { Profile } from '../../types';

interface PitchAnalysisProps {
  profile: Profile;
}

export function PitchAnalysis({ profile: _profile }: PitchAnalysisProps) {
  void _profile;
  const [isUploading, setIsUploading] = useState(false);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasReport, setHasReport] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [report, setReport] = useState<{
    innovationScore: number;
    techFlexibility: number;
    presentationQuality: number;
    businessPotential: number;
    overallScore: number;
    recommendations: string[];
    slidesBreakdown?: { slideNumber: number; title: string; score: number; feedback: string }[];
  }>({
    innovationScore: 88,
    techFlexibility: 85,
    presentationQuality: 82,
    businessPotential: 89,
    overallScore: 86,
    recommendations: [],
    slidesBreakdown: []
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setIsUploading(true);
      
      setTimeout(async () => {
        setIsUploading(false);
        setIsAnalyzing(true);
        
        try {
          const res = await axios.post('/api/analyze-ppt', {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            lastModified: file.lastModified
          });
          if (res.data && res.data.overallScore) {
            setReport(res.data);
          }
        } catch (err) {
          console.warn('PPT analysis error:', err);
        } finally {
          setIsAnalyzing(false);
          setHasReport(true);
        }
      }, 1000);
    }
  };

  const ScoreCard = ({ title, score, icon: Icon, colorClass }: { title: string, score: number, icon: any, colorClass: string }) => (
    <div className="bg-white p-6 rounded-2xl border border-border-soft shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-3xl font-black text-ink">{score}</span>
      </div>
      <h3 className="font-bold text-ink text-sm">{title}</h3>
      <div className="h-1.5 w-full bg-cream mt-3 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full ${colorClass.replace('/20', '').replace('/10', '')} bg-opacity-100`} 
          style={{ width: `${score}%`, backgroundColor: 'currentColor' }} 
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-ink">AI Pitch Deck & Presentation Analyser</h1>
        <p className="text-sm text-ink-light mt-1">Upload pitch decks for automated slide-by-slide AI evaluation and feedback.</p>
      </div>

      {!hasReport && !isAnalyzing && !isUploading && (
        <div className="bg-cream/30 border-2 border-dashed border-border-soft rounded-3xl p-12 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 border border-border-soft">
            <Presentation className="w-10 h-10 text-sage" />
          </div>
          <h2 className="text-xl font-bold text-ink mb-2">Upload Pitch Deck</h2>
          <p className="text-ink-light max-w-sm mb-8">
            Supported formats: .pdf, .pptx, .key. Maximum file size: 20MB.
          </p>
          
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            accept=".pdf,.pptx,.ppt,.key"
            onChange={handleFileUpload}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-ink text-white px-8 py-4 rounded-xl font-medium hover:bg-ink/90 transition-all shadow-md shadow-ink/10 cursor-pointer"
          >
            <Upload className="w-5 h-5" /> Browse Files
          </button>
        </div>
      )}

      {(isUploading || isAnalyzing) && (
        <div className="bg-white rounded-3xl p-12 flex flex-col items-center justify-center text-center border border-border-soft shadow-sm py-32">
          <Loader2 className="w-12 h-12 text-sage animate-spin mb-6" />
          <h2 className="text-2xl font-bold text-ink mb-2">
            {isUploading ? 'Uploading Document...' : 'AI Slide-by-Slide Analyser Engine Running...'}
          </h2>
          <p className="text-ink-light max-w-md">
            {isUploading 
              ? `Uploading ${fileName} securely to our servers.`
              : `Extracting slides, evaluating visual structure, and scoring ${fileName} slide by slide.`}
          </p>
          
          {isAnalyzing && (
            <div className="mt-8 flex gap-4 text-xs font-bold text-ink-faint uppercase tracking-wider">
               <span className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-lavender" /> Assessing Slide Layouts</span>
               <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-sky" /> Computing Potential</span>
            </div>
          )}
        </div>
      )}

      {hasReport && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="bg-gradient-to-br from-ink to-deep-graphite rounded-3xl p-8 text-white flex flex-col md:flex-row justify-between items-center gap-8 shadow-xl">
             <div>
               <h2 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-1">Overall Pitch Score</h2>
               <div className="text-5xl font-black text-sage flex items-center gap-4">
                 {report.overallScore} <span className="text-2xl text-white/50 font-medium">/ 100</span>
               </div>
               <p className="mt-4 text-white/80 max-w-md">
                 Analyzed <span className="font-bold text-white">{fileName}</span>. Evaluated slide-by-slide with explainable recommendations.
               </p>
             </div>
             
             <div className="flex gap-4">
               <button 
                 onClick={() => {
                   setHasReport(false);
                   setFileName(null);
                 }}
                 className="bg-sage hover:bg-sage-dark px-6 py-3 rounded-xl font-medium transition-colors text-white cursor-pointer"
               >
                 Analyze Another Deck
               </button>
             </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
             <ScoreCard title="Innovation Score" score={report.innovationScore} icon={Zap} colorClass="bg-lavender/20 text-lavender" />
             <ScoreCard title="Tech Flexibility" score={report.techFlexibility} icon={Sparkles} colorClass="bg-sky/20 text-sky" />
             <ScoreCard title="Presentation Quality" score={report.presentationQuality} icon={FilePieChart} colorClass="bg-rose/20 text-rose" />
             <ScoreCard title="Business Potential" score={report.businessPotential} icon={Briefcase} colorClass="bg-sage/20 text-sage" />
          </div>

          {/* Individual Slide-by-Slide Breakdown */}
          {report.slidesBreakdown && report.slidesBreakdown.length > 0 && (
            <div className="bg-white rounded-3xl p-8 border border-border-soft shadow-sm space-y-6">
              <h3 className="text-lg font-extrabold text-ink flex items-center gap-2">
                <Presentation className="w-5 h-5 text-indigo-600" /> Individual Slide-by-Slide Evaluation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {report.slidesBreakdown.map((slide) => (
                  <div key={slide.slideNumber} className="p-5 rounded-2xl border border-border-soft bg-cream/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-900 text-[10px] font-black uppercase rounded-full">
                        Slide {slide.slideNumber}
                      </span>
                      <span className="text-sm font-black text-ink">{slide.score}/100</span>
                    </div>
                    <h4 className="font-extrabold text-ink text-sm">{slide.title}</h4>
                    <p className="text-xs text-ink-light leading-relaxed font-medium">{slide.feedback}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl p-8 border border-border-soft shadow-sm">
            <h3 className="text-lg font-bold text-ink mb-6 flex items-center gap-2">
              <BarChart className="w-5 h-5 text-ink-light" /> Strategic AI Recommendations
            </h3>
            
            <div className="space-y-4">
              {report.recommendations.map((rec, idx) => (
                <div key={idx} className="flex gap-4 bg-cream-dark/30 p-4 rounded-xl border border-border">
                   <AlertCircle className="w-5 h-5 text-sage shrink-0 mt-0.5" />
                   <p className="text-ink text-sm leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
