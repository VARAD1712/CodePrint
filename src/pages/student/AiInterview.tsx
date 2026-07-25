import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Video, Mic, MicOff, VideoOff, MessageSquare, Loader2 } from 'lucide-react';
import type { Profile } from '../../types';

interface AiInterviewProps {
  profile: Profile;
}

export function AiInterview({ profile }: AiInterviewProps) {
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  
  const [messages, setMessages] = useState<{ speaker: 'AI' | 'Student'; text: string }[]>([]);
  const [inputText, setInputText] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const startInterview = () => {
    setIsStarted(true);
    // Initial AI greeting
    setTimeout(() => {
      setMessages([
        { speaker: 'AI', text: `Hi ${profile.full_name?.split(' ')[0] || 'there'}. I'm your AI Interviewer. We'll be doing a technical assessment today. Are you ready to begin?` }
      ]);
    }, 1000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = { speaker: 'Student' as const, text: inputText };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsAiThinking(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponses = [
        "That's a good approach. Let's dive deeper. Can you explain the time complexity of your solution?",
        "Interesting. How would you handle state management in a large-scale React application?",
        "Can you give me an example of a time you had to debug a complex issue in production?",
        "Thank you for that explanation. We're done with the technical portion. Do you have any questions for me?"
      ];
      
      const responseText = messages.length > 6 
        ? "Thank you for completing this interview. I will generate a report for the hiring team."
        : aiResponses[Math.floor(Math.random() * aiResponses.length)];
      
      setMessages(prev => [...prev, { speaker: 'AI', text: responseText }]);
      setIsAiThinking(false);
      
      if (messages.length > 6) {
        setTimeout(() => setIsCompleted(true), 2000);
      }
    }, 2000);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiThinking]);

  if (isCompleted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-sage/10 rounded-full flex items-center justify-center mb-6">
          <MessageSquare className="w-10 h-10 text-sage" />
        </div>
        <h1 className="text-3xl font-bold text-ink mb-4">Interview Completed</h1>
        <p className="text-ink-light max-w-md mx-auto">
          Thank you for completing the AI Interview. Your responses have been recorded and your technical & communication scores are being calculated. The company will review your report shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto h-[80vh] flex flex-col bg-white rounded-3xl border border-border-soft shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border-soft flex items-center justify-between bg-cream/30">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-rose animate-pulse" />
          <h2 className="font-bold text-ink">Technical Interview</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setMicOn(!micOn)} className={`p-2 rounded-full ${micOn ? 'bg-ink text-white' : 'bg-red-100 text-red-500'}`}>
            {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>
          <button onClick={() => setCameraOn(!cameraOn)} className={`p-2 rounded-full ${cameraOn ? 'bg-ink text-white' : 'bg-red-100 text-red-500'}`}>
            {cameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {!isStarted ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-cream/20">
          <div className="w-24 h-24 bg-lavender/10 rounded-full flex items-center justify-center mb-6 relative">
            <div className="absolute inset-0 rounded-full border-4 border-lavender/30 border-t-lavender animate-spin" />
            <Video className="w-10 h-10 text-lavender" />
          </div>
          <h1 className="text-2xl font-bold text-ink mb-2">Ready for your interview?</h1>
          <p className="text-ink-light max-w-md mx-auto mb-8">
            Ensure your microphone and camera are working. The AI agent will ask you technical and behavioral questions.
          </p>
          <button
            onClick={startInterview}
            className="px-8 py-4 bg-ink text-white font-bold rounded-xl hover:bg-ink/90 transition-colors shadow-lg shadow-ink/20"
          >
            Start Interview
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden">
          {/* Video Feed Area */}
          <div className="lg:w-1/2 p-4 flex flex-col gap-4 bg-ink">
             <div className="flex-1 bg-deep-graphite rounded-2xl relative overflow-hidden flex items-center justify-center border border-white/10">
                <div className="absolute top-4 left-4 bg-black/50 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">AI Agent</div>
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-lavender to-sky flex items-center justify-center relative">
                   <div className="absolute inset-0 bg-white/20 rounded-full animate-ping" />
                   <MessageSquare className="w-12 h-12 text-white" />
                </div>
             </div>
             <div className="h-1/3 bg-deep-graphite rounded-2xl relative overflow-hidden flex items-center justify-center border border-white/10">
                <div className="absolute top-4 left-4 bg-black/50 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">You</div>
                {!cameraOn ? (
                   <VideoOff className="w-8 h-8 text-white/20" />
                ) : (
                   <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                     <span className="text-white/50">Camera On</span>
                   </div>
                )}
             </div>
          </div>

          {/* Chat Interface */}
          <div className="lg:w-1/2 flex flex-col border-l border-border-soft">
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-cream/20">
              {messages.map((msg, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={idx} 
                  className={`flex flex-col ${msg.speaker === 'Student' ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-xs font-bold text-ink-faint mb-1 px-1">{msg.speaker}</span>
                  <div className={`px-5 py-3 rounded-2xl max-w-[85%] ${
                    msg.speaker === 'Student' 
                      ? 'bg-ink text-white rounded-tr-none' 
                      : 'bg-white border border-border-soft text-ink rounded-tl-none shadow-sm'
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {isAiThinking && (
                <div className="flex flex-col items-start">
                  <span className="text-xs font-bold text-ink-faint mb-1 px-1">AI</span>
                  <div className="px-5 py-4 rounded-2xl rounded-tl-none bg-white border border-border-soft flex gap-2 items-center">
                    <div className="w-2 h-2 rounded-full bg-lavender animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-lavender animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 rounded-full bg-lavender animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-border-soft">
              <div className="relative">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={isAiThinking}
                  placeholder={isAiThinking ? "AI is typing..." : "Type your answer or speak..."}
                  className="w-full pl-4 pr-12 py-3 bg-cream border border-border-soft rounded-xl focus:outline-none focus:border-sage disabled:opacity-50"
                />
                <button 
                  type="submit"
                  disabled={!inputText.trim() || isAiThinking}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-sage text-white rounded-lg hover:bg-sage-dark disabled:opacity-50 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
              <p className="text-center text-[10px] text-ink-faint mt-2">
                In a real scenario, this would use speech-to-text integration.
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
