import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  BookOpen,
  Quote,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check,
  RotateCcw,
  User,
  ThumbsUp,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import { api, ApiError } from '../../services/api';
import type { RagCitation } from '../../types/domain';
import { InfoPopover } from '../common/InfoPopover';
import { AiMarkdown } from '../common/AiMarkdown';
import { Loader } from '../common/Loader';
import { Spinner } from '../common/Spinner';

export interface PolicyRagAssistantProps {
  selectedPolicyId?: string;
  policyName?: string;
  isOpen?: boolean;
  onClose?: () => void;
  isFloating?: boolean;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citations?: RagCitation[];
  confidence?: 'HIGH' | 'MEDIUM' | 'LOW';
  uncertaintyNotes?: string[];
  disclaimer?: string;
}

export const PolicyRagAssistant: React.FC<PolicyRagAssistantProps> = ({
  selectedPolicyId,
  policyName,
  isOpen = true,
  onClose,
  isFloating = false
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
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, loading, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

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

    const assistantMsgId = `ai-${Date.now()}`;
    const initialAssistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      citations: [],
      confidence: 'MEDIUM'
    };

    setMessages((prev) => [...prev, userMsg, initialAssistantMsg]);
    setInputQuery('');
    setLoading(true);
    setError(null);

    try {
      let accumulated = '';
      const data = await api.streamPolicyRag(trimmed, selectedPolicyId, (chunk) => {
        accumulated += chunk;
        setMessages((prev) =>
          prev.map((msg) => (msg.id === assistantMsgId ? { ...msg, content: accumulated } : msg))
        );
      });

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                content: data.answer || accumulated || 'No direct clause match found for this query in the policy schedule.',
                citations: data.citations ?? [],
                confidence: data.confidence,
                uncertaintyNotes: data.uncertaintyNotes ?? [],
                disclaimer: data.disclaimer
              }
            : msg
        )
      );

      if (data.citations && data.citations.length > 0) {
        setExpandedCitations((prev) => ({ ...prev, [assistantMsgId]: true }));
      }
    } catch (err) {
      setError(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : 'Could not reach the policy copilot. Try again in a moment.'
      );
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

  if (!isOpen && isFloating) {
    return null;
  }

  const containerClasses = isFloating
    ? 'fixed inset-x-2 bottom-20 top-14 sm:top-auto sm:inset-x-auto sm:bottom-20 sm:right-6 z-50 sm:w-[480px] md:w-[520px] sm:max-h-[82vh] sm:h-[640px] bg-white rounded-2xl sm:rounded-3xl border border-slate-300/80 shadow-2xl overflow-hidden flex flex-col animate-fade-in'
    : 'bg-white rounded-3xl border border-slate-200/90 shadow-md overflow-hidden flex flex-col transition-all duration-300';

  return (
    <div className={containerClasses}>

      {/* 🔮 Gemini / ChatGPT Style Top Bar (Subtle solid colors) */}
      <div className="bg-slate-900 px-4 sm:px-5 py-3.5 text-white flex items-center justify-between gap-2.5 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-teal-700 flex items-center justify-center shadow-xs shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs sm:text-sm font-black tracking-tight text-white truncate">
                CareIQ Policy Copilot
              </h3>
              <span className="hidden sm:inline-flex items-center gap-1 text-[9px] bg-teal-500/20 text-teal-300 px-1.5 py-0.2 rounded-full font-mono font-semibold border border-teal-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Clause-cited
              </span>
              <InfoPopover
                title="How the copilot answers"
                size="xs"
                variant="indigo"
                content="Your question is matched by keyword against the policy clauses we hold on record. The matching clauses are quoted verbatim with their page numbers, and Gemini rewrites them into plain language. It cannot answer from anything outside those clauses."
                details={[
                  { label: 'Grounding', value: 'Quoted clauses with page numbers' },
                  { label: 'Retrieval', value: 'Keyword match, not semantic embeddings' },
                  { label: 'Scope', value: 'Non-clinical insurance guidance only' }
                ]}
              />
            </div>
            <p className="text-[10px] text-slate-300 truncate">
              {policyName ? `Context: ${policyName}` : 'Semantic clause search with page citations.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15 transition-colors cursor-pointer"
              title="Start a fresh conversation"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">New</span>
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
              title="Close Copilot"
              aria-label="Close Copilot"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 💬 Chat Stream / Message Area */}
      <div className="p-3.5 sm:p-4 overflow-y-auto space-y-4 bg-linear-to-b from-slate-50/50 via-white to-slate-50/30 flex-1">

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
            <div className="space-y-0.5">
              <div className="font-bold text-red-900">Query Error</div>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* 🌟 Welcome / Empty Chat Screen (Gemini / ChatGPT Style) */}
        {messages.length === 0 && (
          <div className="py-4 sm:py-6 px-1 flex flex-col items-center justify-center text-center max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-indigo-500/15 via-teal-500/15 to-purple-500/15 border border-indigo-200/60 flex items-center justify-center mb-2.5 shadow-inner">
              <Sparkles className="w-6 h-6 text-indigo-600 animate-pulse" />
            </div>

            <h4 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
              How can I assist with your policy coverage?
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5 max-w-sm mx-auto leading-relaxed">
              Ask any question in plain English. CareIQ searches your indexed policy clauses and cites exact page numbers.
            </p>

            {/* 4 Clickable Scenario Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full mt-4 text-left">
              {promptSuggestions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(item.query)}
                  className="bg-white hover:bg-indigo-50/40 border border-slate-200 hover:border-indigo-300 rounded-xl p-2.5 transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs group text-left flex items-start gap-2.5 hover:scale-[1.01] active:scale-[0.99]"
                >
                  <span className="text-xl shrink-0 p-1 rounded-lg bg-slate-50 group-hover:bg-indigo-100/50 transition-colors">
                    {item.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 flex items-center justify-between">
                      <span>{item.title}</span>
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-600" />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2 leading-tight">
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
              /* 👤 User Message Bubble */
              <div className="flex justify-end items-start gap-2 pl-6">
                <div className="bg-linear-to-r from-slate-900 to-indigo-950 text-white rounded-2xl rounded-tr-xs px-3.5 py-2.5 shadow-xs max-w-sm sm:max-w-md">
                  <p className="text-xs leading-relaxed">{msg.content}</p>
                  <span className="block text-[9px] text-slate-400 text-right mt-1 font-mono">
                    {msg.timestamp}
                  </span>
                </div>
                <div className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-xs">
                  <User className="w-3.5 h-3.5" />
                </div>
              </div>
            ) : (
              /* 🤖 Assistant Message Bubble */
              <div className="flex items-start gap-2.5 pr-2">
                <div className="w-7 h-7 rounded-xl bg-teal-700 text-white flex items-center justify-center shadow-xs shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>

                <div className="flex-1 space-y-2.5 bg-white border border-slate-200/90 rounded-2xl rounded-tl-xs p-3.5 shadow-xs text-xs">
                  {/* Top Bar: Confidence & Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-1.5 pb-1.5 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-black text-slate-900">
                        CareIQ Copilot
                      </span>
                      {msg.confidence && (
                        <span
                          className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${
                            msg.confidence === 'HIGH'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : msg.confidence === 'MEDIUM'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {/* How well the question matched a clause — not a
                              claim that the answer was checked by anyone. */}
                          {msg.confidence === 'HIGH'
                            ? 'Strong clause match'
                            : msg.confidence === 'MEDIUM'
                              ? 'Partial match'
                              : 'No clause matched'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(msg.content, msg.id)}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
                        title="Copy answer"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleLike(msg.id)}
                        className={`p-1 rounded-md transition-colors ${
                          likedMessages[msg.id]
                            ? 'text-teal-600 bg-teal-50'
                            : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                        }`}
                        title="Helpful response"
                      >
                        <ThumbsUp className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Main Answer Content */}
                  <div className="text-slate-800 leading-relaxed">
                    <AiMarkdown content={msg.content} />
                  </div>

                  {/* Uncertainty notes if any */}
                  {msg.uncertaintyNotes && msg.uncertaintyNotes.length > 0 && (
                    <div className="p-2 bg-amber-50/70 border border-amber-200/60 rounded-xl space-y-1 text-[11px] text-amber-900">
                      <div className="font-bold flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-amber-600" />
                        <span>Policy Caveats & Sub-limits:</span>
                      </div>
                      <ul className="list-disc list-inside space-y-0.5 text-amber-800">
                        {msg.uncertaintyNotes.map((note, nIdx) => (
                          <li key={nIdx}>{note}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Page Citations & Grounded Quotes Accordion */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="pt-1.5 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => toggleCitations(msg.id)}
                        className="w-full flex items-center justify-between py-1 text-[10px] font-extrabold text-indigo-700 hover:text-indigo-900 cursor-pointer"
                      >
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          <span>
                            {msg.citations.length} Grounded Page{' '}
                            {msg.citations.length === 1 ? 'Citation' : 'Citations'}
                          </span>
                        </div>
                        {expandedCitations[msg.id] ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </button>

                      {expandedCitations[msg.id] && (
                        <div className="mt-1.5 space-y-1.5 animate-in fade-in duration-150">
                          {msg.citations.map((cit, cIdx) => (
                            <div
                              key={cIdx}
                              className="p-2 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-[11px]"
                            >
                              <div className="flex items-center justify-between text-[10px] font-bold text-slate-700">
                                <span className="text-indigo-700">Page {cit.pageNumber}</span>
                                <span className="truncate max-w-50 text-slate-500">
                                  {cit.sectionTitle}
                                </span>
                              </div>
                              <div className="flex items-start gap-1 text-slate-600 italic bg-white p-1.5 rounded-lg border border-slate-100 text-[10px]">
                                <Quote className="w-2.5 h-2.5 text-indigo-400 shrink-0 mt-0.5" />
                                <span>&ldquo;{cit.quoteExcerpt}&rdquo;</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Disclaimer */}
                  {msg.disclaimer && (
                    <div className="text-[9px] text-slate-400 pt-0.5 flex items-center gap-1">
                      <ShieldCheck className="w-2.5 h-2.5 text-teal-600 shrink-0" />
                      <span>{msg.disclaimer}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* ⏳ Assistant Thinking Animation */}
        {loading && (
          <div className="flex items-start gap-2.5 animate-in fade-in duration-200">
            <div className="w-7 h-7 rounded-xl bg-linear-to-br from-indigo-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-3 shadow-xs flex items-center justify-center">
              <Loader size="xs" />
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* ⌨️ Prompt Input Bar */}
      <div className="p-3 bg-slate-50 border-t border-slate-200/80 shrink-0">
        {/* Quick prompt suggestions pills above prompt input when messages exist */}
        {messages.length > 0 && (
          <div className="flex items-center gap-1 overflow-x-auto pb-1.5 mb-1.5 no-scrollbar">
            {promptSuggestions.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputQuery(sug.query);
                  handleSendMessage(sug.query);
                }}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-[10px] font-semibold text-slate-700 hover:text-indigo-900 transition-colors whitespace-nowrap cursor-pointer shrink-0 shadow-2xs"
              >
                <span>{sug.icon}</span>
                <span>{sug.title}</span>
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputQuery);
          }}
          className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1.5 shadow-2xs focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask about policy rules, room caps, robotic surgery..."
            className="w-full text-xs py-1.5 px-1 text-slate-900 placeholder-slate-400 bg-transparent outline-hidden font-normal"
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading || !inputQuery.trim()}
            className="w-8 h-8 rounded-lg bg-teal-700 hover:bg-teal-800 disabled:opacity-40 text-white flex items-center justify-center shadow-xs transition-colors cursor-pointer shrink-0 disabled:cursor-not-allowed"
            title="Send prompt"
          >
            {loading ? (
              <Spinner size="xs" className="text-white" />
            ) : (
              <Send className="w-3.5 h-3.5 text-white" />
            )}
          </button>
        </form>
      </div>

    </div>
  );
};
