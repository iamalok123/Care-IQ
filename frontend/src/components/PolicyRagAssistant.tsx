import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  BookOpen,
  Quote,
  ShieldCheck,
  AlertCircle,
  Loader2,
  FileText,
  Copy,
  Check,
  RotateCcw,
  User,
  ThumbsUp,
  ArrowRight,
  Lightbulb,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { api } from '../services/api';

interface PolicyRagAssistantProps {
  selectedPolicyId?: string;
  policyName?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citations?: {
    pageNumber: number;
    sectionTitle: string;
    quoteExcerpt: string;
    policyName: string;
    relevanceScore: number;
  }[];
  confidence?: 'HIGH' | 'MEDIUM' | 'LOW';
  uncertaintyNotes?: string[];
  disclaimer?: string;
}

export const PolicyRagAssistant: React.FC<PolicyRagAssistantProps> = ({
  selectedPolicyId,
  policyName
}) => {
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedCitations, setExpandedCitations] = useState<{ [msgId: string]: boolean }>({});
  const [likedMessages, setLikedMessages] = useState<{ [msgId: string]: boolean }>({});

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const promptSuggestions = [
    {
      title: 'Room Rent Limits',
      desc: 'Does proportionate deduction apply if I choose a Deluxe room?',
      icon: '🛏️',
      query: 'What is the room rent limit and does proportionate deduction apply?'
    },
    {
      title: 'Robotic Surgery',
      desc: 'Is robotic knee or joint replacement surgery covered?',
      icon: '🤖',
      query: 'Is robotic knee surgery covered under this policy?'
    },
    {
      title: 'PED Waiting Period',
      desc: 'What is the waiting period for pre-existing diabetes or hypertension?',
      icon: '⏳',
      query: 'What is the pre-existing disease waiting period for diabetes?'
    },
    {
      title: 'IRDAI Consumables',
      desc: 'Are gloves, PPE kits, and admission file charges covered?',
      icon: '🧤',
      query: 'Are gloves, PPE kits, and admission consumables covered?'
    }
  ];

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed || loading) return;

    const userMessageId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);
    setError(null);

    try {
      const data = await api.queryPolicyRag(trimmed, selectedPolicyId);

      const assistantMsgId = `ai-${Date.now()}`;
      const assistantMsg: ChatMessage = {
        id: assistantMsgId,
        role: 'assistant',
        content: data.answer || 'No direct clause match found for this query in the policy schedule.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: data.citations || [],
        confidence: data.confidence || 'HIGH',
        uncertaintyNotes: data.uncertaintyNotes || [],
        disclaimer: data.disclaimer || 'Non-clinical decision support. Citations are verified against policy terms.'
      };

      setMessages((prev) => [...prev, assistantMsg]);
      // Default to showing citations if present
      if (data.citations && data.citations.length > 0) {
        setExpandedCitations((prev) => ({ ...prev, [assistantMsgId]: true }));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve grounded answer from policy RAG.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setError(null);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleCitations = (msgId: string) => {
    setExpandedCitations((prev) => ({
      ...prev,
      [msgId]: !prev[msgId]
    }));
  };

  const toggleLike = (msgId: string) => {
    setLikedMessages((prev) => ({
      ...prev,
      [msgId]: !prev[msgId]
    }));
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md overflow-hidden flex flex-col transition-all duration-300">

      {/* 🔮 Gemini / ChatGPT Style Top Bar */}
      <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 px-5 py-4 text-white flex flex-wrap items-center justify-between gap-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-indigo-500 via-purple-500 to-teal-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-2 ring-white/15">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-2">
                CareIQ Policy Copilot
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full font-mono font-semibold border border-teal-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Grounded in Policy PDF
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Interactive policy clause intelligence with page-level citations & exclusion warnings.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {policyName && (
            <div className="hidden sm:inline-flex items-center gap-1.5 text-xs bg-white/10 backdrop-blur-md text-slate-200 px-3 py-1.5 rounded-xl border border-white/15">
              <BookOpen className="w-3.5 h-3.5 text-teal-400" />
              <span className="text-[11px] text-slate-400">Context:</span>
              <span className="font-bold text-teal-300 truncate max-w-40">{policyName}</span>
            </div>
          )}

          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15 transition-colors cursor-pointer"
              title="Start a fresh conversation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>New Chat</span>
            </button>
          )}
        </div>
      </div>

      {/* 💬 Chat Stream / Message Area */}
      <div className="p-4 sm:p-6 min-h-95 max-h-145 overflow-y-auto space-y-5 bg-linear-to-b from-slate-50/50 via-white to-slate-50/30 flex-1">

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start gap-3 animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-red-900">Query Error</div>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* 🌟 Welcome / Empty Chat Screen (Gemini / ChatGPT Style) */}
        {messages.length === 0 && (
          <div className="py-6 sm:py-8 px-2 flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
            <div className="w-14 h-14 rounded-3xl bg-linear-to-br from-indigo-500/15 via-teal-500/15 to-purple-500/15 border border-indigo-200/60 flex items-center justify-center mb-3 shadow-inner">
              <Sparkles className="w-7 h-7 text-indigo-600 animate-pulse" />
            </div>

            <h4 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              How can I assist with your policy coverage?
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
              Ask any question in plain English. CareIQ searches your indexed policy clauses, calculates room rent deduction risks, and cites exact page numbers.
            </p>

            {/* 4 Clickable Scenario Cards (ChatGPT style prompt starters) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mt-6 text-left">
              {promptSuggestions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(item.query)}
                  className="bg-white hover:bg-indigo-50/40 border border-slate-200 hover:border-indigo-300 rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs group text-left flex items-start gap-3 hover:scale-[1.01] active:scale-[0.99]"
                >
                  <span className="text-2xl shrink-0 p-1.5 rounded-xl bg-slate-50 group-hover:bg-indigo-100/50 transition-colors">
                    {item.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 flex items-center justify-between">
                      <span>{item.title}</span>
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-600" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 📜 Messages Stream */}
        {messages.map((msg) => (
          <div key={msg.id} className="space-y-2 animate-in fade-in duration-200">
            {msg.role === 'user' ? (
              /* 👤 User Message Bubble (Right-aligned) */
              <div className="flex justify-end items-start gap-2.5 pl-8">
                <div className="bg-linear-to-r from-slate-900 to-indigo-950 text-white rounded-2xl rounded-tr-xs px-4 py-3 shadow-sm max-w-xl">
                  <p className="text-xs sm:text-sm leading-relaxed">{msg.content}</p>
                  <span className="block text-[10px] text-slate-400 text-right mt-1 font-mono">
                    {msg.timestamp}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-1 shadow-xs">
                  <User className="w-4 h-4" />
                </div>
              </div>
            ) : (
              /* 🤖 Assistant Message Bubble (Left-aligned, Gemini/ChatGPT Card) */
              <div className="flex items-start gap-3 pr-2 sm:pr-8">
                <div className="w-8 h-8 rounded-2xl bg-linear-to-br from-indigo-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0 mt-1">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>

                <div className="flex-1 space-y-3 bg-white border border-slate-200/90 rounded-2xl rounded-tl-xs p-4 sm:p-5 shadow-xs">
                  {/* Top Bar: Confidence & Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900">
                        CareIQ Policy Copilot
                      </span>
                      {msg.confidence && (
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${msg.confidence === 'HIGH'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                        >
                          <ShieldCheck className="w-3 h-3" />
                          {msg.confidence} Confidence
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => copyToClipboard(msg.content, msg.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Copy answer"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => toggleLike(msg.id)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${likedMessages[msg.id]
                            ? 'text-teal-600 bg-teal-50'
                            : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                          }`}
                        title="Helpful response"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Grounded AI Text */}
                  <div className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line font-normal">
                    {msg.content}
                  </div>

                  {/* Uncertainty Caveats if any */}
                  {msg.uncertaintyNotes && msg.uncertaintyNotes.length > 0 && (
                    <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                      <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="font-bold">Important Caveats:</span>
                        <ul className="list-disc pl-4 text-[11px] space-y-0.5">
                          {msg.uncertaintyNotes.map((note, idx) => (
                            <li key={idx}>{note}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Citations Accordion / Panel */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <button
                        onClick={() => toggleCitations(msg.id)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-900 cursor-pointer"
                      >
                        <Quote className="w-3.5 h-3.5 text-indigo-600" />
                        <span>
                          {expandedCitations[msg.id] ? 'Hide' : 'View'} Verified Policy Citations ({msg.citations.length})
                        </span>
                        {expandedCitations[msg.id] ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {expandedCitations[msg.id] && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1 animate-in fade-in duration-200">
                          {msg.citations.map((c, cIdx) => (
                            <div
                              key={cIdx}
                              className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1.5 hover:border-indigo-300 transition-colors"
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-bold text-indigo-950 text-[11px] flex items-center gap-1 truncate">
                                  <FileText className="w-3 h-3 text-indigo-600 shrink-0" />
                                  <span className="truncate">{c.sectionTitle}</span>
                                </span>
                                <span className="bg-indigo-100 text-indigo-800 font-bold text-[10px] px-2 py-0.5 rounded-full shrink-0">
                                  Page {c.pageNumber}
                                </span>
                              </div>

                              <p className="text-[11px] text-slate-700 italic border-l-2 border-indigo-400 pl-2 leading-relaxed">
                                "{c.quoteExcerpt}"
                              </p>

                              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                                <span className="truncate max-w-35">{c.policyName}</span>
                                <span className="text-emerald-700 font-bold">
                                  {(c.relevanceScore * 100).toFixed(0)}% Match
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Disclaimer */}
                  {msg.disclaimer && (
                    <div className="text-[10px] text-slate-400 pt-1 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-teal-600 shrink-0" />
                      <span>{msg.disclaimer}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* ⏳ Assistant Thinking Animation (ChatGPT / Gemini style) */}
        {loading && (
          <div className="flex items-start gap-3 animate-in fade-in duration-200">
            <div className="w-8 h-8 rounded-2xl bg-linear-to-br from-indigo-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
              <Sparkles className="w-4 h-4 text-white animate-spin" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-4 shadow-xs space-y-2 max-w-md">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                <span>Searching indexed clauses & verifying citations...</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="bg-linear-to-r from-teal-500 via-indigo-500 to-teal-500 h-full w-2/3 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* ⌨️ ChatGPT / Gemini Floating Prompt Input Bar */}
      <div className="p-4 bg-slate-50 border-t border-slate-200/80">
        {/* Quick prompt suggestions pills above prompt input when messages exist */}
        {messages.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 no-scrollbar">
            <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1 shrink-0">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Ask:
            </span>
            {promptSuggestions.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(item.query)}
                className="inline-flex items-center gap-1 text-[11px] bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-900 px-3 py-1 rounded-xl border border-slate-200 hover:border-indigo-200 transition-colors shrink-0 cursor-pointer shadow-2xs"
              >
                <span>{item.icon}</span>
                <span>{item.title}</span>
              </button>
            ))}
          </div>
        )}

        {/* Input Box Container */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputQuery);
          }}
          className="relative flex items-center bg-white border border-slate-300 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 rounded-2xl shadow-xs transition-all p-1.5"
        >
          <div className="pl-3 pr-2 text-slate-400">
            <Sparkles className="w-4 h-4 text-indigo-500" />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask anything about your policy (e.g. Is robotic surgery covered? Room rent limits?)"
            className="w-full text-xs sm:text-sm py-2 px-1 text-slate-900 placeholder-slate-400 bg-transparent outline-hidden font-normal"
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading || !inputQuery.trim()}
            className="w-9 h-9 rounded-xl bg-linear-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 disabled:opacity-40 text-white flex items-center justify-center shadow-xs transition-all cursor-pointer shrink-0 disabled:cursor-not-allowed"
            title="Send prompt"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Send className="w-4 h-4 text-white" />
            )}
          </button>
        </form>

        <p className="text-[10px] text-slate-400 text-center mt-2 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3 h-3 text-teal-600" />
          CareIQ Decision Support • Grounded in policy clauses without hallucination.
        </p>
      </div>

    </div>
  );
};
