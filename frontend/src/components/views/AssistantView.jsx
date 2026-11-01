import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare, Send, Sparkles, Bot, User, ArrowRight,
  HelpCircle, RefreshCw, Shield, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { processQueryClientSide } from '../../utils/clientAssistantEngine';
import Footer from '../Footer';

/**
 * Clean markdown-like formatter for assistant responses
 */
const FormattedMessage = ({ text }) => {
  if (!text) return null;
  const lines = text.split('\n');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.92rem', lineHeight: 1.6 }}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} style={{ height: '0.35rem' }} />;

        const parseBold = (str) => {
          const parts = str.split(/(\*\*.*?\*\*)/g);
          return parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
              return <strong key={pIdx} style={{ fontWeight: 700, color: '#1D1E22' }}>{part.slice(2, -2)}</strong>;
            }
            return part;
          });
        };

        if (trimmed.startsWith('• ') || trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          return (
            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', paddingLeft: '0.4rem' }}>
              <span style={{ color: '#2F7F7A', fontWeight: 'bold' }}>•</span>
              <span style={{ flex: 1 }}>{parseBold(trimmed.slice(2))}</span>
            </div>
          );
        }

        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numMatch) {
          return (
            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', paddingLeft: '0.4rem' }}>
              <span style={{ fontWeight: 700, color: '#2F7F7A', minWidth: '18px' }}>{numMatch[1]}.</span>
              <span style={{ flex: 1 }}>{parseBold(numMatch[2])}</span>
            </div>
          );
        }

        return (
          <div key={idx} style={{ wordBreak: 'break-word' }}>
            {parseBold(line)}
          </div>
        );
      })}
    </div>
  );
};

const SUGGESTED_QUERIES = [
  {
    en: 'Show top 5 highest-risk projects in Bihar',
    hi: 'बिहार में शीर्ष 5 सबसे अधिक जोखिम वाली परियोजनाएं दिखाएं'
  },
  {
    en: 'Which MPs have the highest risk scores?',
    hi: 'किन सांसदों का जोखिम स्कोर सबसे अधिक है?'
  },
  {
    en: 'Find duplicate project alerts for work 158087',
    hi: 'कार्य 158087 के लिए दोहराव परियोजना अलर्ट खोजें'
  },
  {
    en: 'Explain the 8 forensic risk pillars',
    hi: '8 फोरेंसिक जोखिम स्तंभों की व्याख्या करें'
  },
  {
    en: 'What does HHI mean in contractor concentration?',
    hi: 'ठेकेदार एकाग्रता में HHI का क्या अर्थ है?'
  },
  {
    en: 'Show projects delayed by more than 12 months',
    hi: '12 महीने से अधिक विलंबित परियोजनाएं दिखाएं'
  }
];

const AssistantView = () => {
  const { language } = useLanguage();
  const isHi = language === 'hi';
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: isHi
        ? 'नमस्ते! मैं **निरीक्षक एआई निर्णय-सहायक सहायक (Decision Support Copilot)** हूँ।\n\nमैं भारत भर में 543 लोकसभा और 245 राज्यसभा निर्वाचन क्षेत्रों, उच्च-जोखिम कार्यों, ठेकेदार कार्टेल और विसंगति विश्लेषण पर आपके प्रश्नों का उत्तर देने में सहायता कर सकता हूँ।'
        : 'Namaste! I am the **NIRIKSHAK AI Decision Support Assistant**.\n\nI can help you explore precomputed MPLADS intelligence across 543 Lok Sabha and 245 Rajya Sabha constituencies, project risk scores, contractor cartels, and forensic anomaly detections.',
      evidence: [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (queryText) => {
    const textToSend = queryText || input;
    if (!textToSend || !textToSend.trim() || loading) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // 1. Try Backend Assistant Query API
      const res = await fetch('/api/assistant/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          query: textToSend.trim(),
          scope: {
            role: user?.role,
            language: isHi ? 'hi' : 'en'
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg = {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: data.answer || data.response || 'Analysis compiled successfully.',
          evidence: data.evidence || [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, aiMsg]);
        return;
      }
      throw new Error('API unreachable');
    } catch {
      // 2. Client-side grounded fallback engine
      try {
        const fallback = await processQueryClientSide(textToSend.trim(), { language });
        const aiMsg = {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: fallback?.answer || 'Intelligence query processed based on verified MPLADS dataset.',
          evidence: fallback?.evidence || [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, aiMsg]);
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: 'assistant',
            text: isHi
              ? 'वर्तमान में डेटा सर्वर से संपर्क नहीं हो पाया। कृपया पुनः प्रयास करें।'
              : 'Could not connect to assistant intelligence service. Please try again.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Top Banner */}
      <div
        className="card-light"
        style={{
          padding: '1.75rem 2rem',
          border: '1.5px solid #1D1E22',
          boxShadow: '3px 4px 0px #1D1E22',
          background: '#FFFFFF'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span style={{
                background: '#DCEDEA',
                color: '#256B68',
                border: '1px solid #2F7F7A',
                borderRadius: 'var(--radius-full)',
                padding: '0.2rem 0.65rem',
                fontSize: '0.74rem',
                fontWeight: 800,
                letterSpacing: '0.06em'
              }}>
                {isHi ? 'एआई निर्णय-सहायक' : 'AI DECISION COPILOT'}
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>•</span>
              <span style={{ fontSize: '0.78rem', color: '#1B5E20', fontWeight: 700 }}>
                {isHi ? 'सक्रिय एवं प्रमाणित डेटाबेस' : 'Active & Grounded in Official MPLADS Records'}
              </span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-serif-primary)', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 700, margin: '0 0 0.4rem 0', color: '#1D1E22' }}>
              {isHi ? 'निरीक्षक एआई सहायक' : 'Nirikshak AI Assistant'}
            </h1>
            <p style={{ fontSize: '0.92rem', color: 'var(--color-text-secondary)', margin: 0, maxWidth: '780px', lineHeight: 1.5 }}>
              {isHi
                ? 'परियोजना जोखिम स्कोर, वित्तीय विसंगतियों, ठेकेदार कार्टेल और संसदीय निर्वाचन क्षेत्र के डेटा के बारे में सीधे प्रश्न पूछें।'
                : 'Ask questions about project risk assessments, financial anomalies, contractor cartel clusters, and parliamentary constituency performance.'}
            </p>
          </div>

          <button
            onClick={() => setMessages([messages[0]])}
            className="btn-outline-dark"
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.82rem',
              gap: '0.4rem',
              background: '#FAF8F3',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} />
            <span>{isHi ? 'चैट रीसेट करें' : 'Reset Conversation'}</span>
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid #EAE6DF' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0A2458', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.65rem' }}>
            {isHi ? 'त्वरित प्रश्न सुझाव' : 'Suggested Questions'}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {SUGGESTED_QUERIES.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(isHi ? item.hi : item.en)}
                disabled={loading}
                style={{
                  background: '#FAF8F3',
                  border: '1.5px solid #1D1E22',
                  borderRadius: 'var(--radius-full)',
                  padding: '0.4rem 0.9rem',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: '#1D1E22',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: '1px 2px 0px #1D1E22'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#DCEDEA';
                  e.currentTarget.style.color = '#256B68';
                  e.currentTarget.style.borderColor = '#2F7F7A';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#FAF8F3';
                  e.currentTarget.style.color = '#1D1E22';
                  e.currentTarget.style.borderColor = '#1D1E22';
                }}
              >
                ✨ {isHi ? item.hi : item.en}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Conversation Container */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1.5px solid #1D1E22',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '3px 4px 0px #1D1E22',
          display: 'flex',
          flexDirection: 'column',
          height: '620px',
          overflow: 'hidden'
        }}
      >
        {/* Messages Scroll Area */}
        <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  gap: '0.85rem',
                  alignItems: 'flex-start',
                  justifyContent: isUser ? 'flex-end' : 'flex-start'
                }}
              >
                {!isUser && (
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: '#DCEDEA',
                      border: '1.5px solid #2F7F7A',
                      color: '#2F7F7A',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}
                  >
                    <Bot size={18} />
                  </div>
                )}

                <div
                  style={{
                    maxWidth: '82%',
                    background: isUser ? '#2F7F7A' : '#FAF8F3',
                    color: isUser ? '#FFFFFF' : '#1D1E22',
                    border: isUser ? '1.5px solid #256B68' : '1.5px solid #1D1E22',
                    borderRadius: isUser ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    padding: '1rem 1.25rem',
                    boxShadow: '1.5px 2px 0px rgba(29, 30, 34, 0.2)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', gap: '1rem' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: isUser ? '#DCEDEA' : '#0A2458' }}>
                      {isUser ? (isHi ? 'आप' : 'You') : 'NIRIKSHAK AI'}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: isUser ? '#E0F2FE' : 'var(--color-text-muted)' }}>
                      {msg.timestamp}
                    </span>
                  </div>

                  {isUser ? (
                    <div style={{ fontSize: '0.94rem', lineHeight: 1.5, wordBreak: 'break-word' }}>
                      {msg.text}
                    </div>
                  ) : (
                    <FormattedMessage text={msg.text} />
                  )}

                  {/* Evidence / Work References if available */}
                  {!isUser && msg.evidence && msg.evidence.length > 0 && (
                    <div style={{ marginTop: '0.85rem', paddingTop: '0.65rem', borderTop: '1px solid #EAE6DF', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-muted)', width: '100%' }}>
                        {isHi ? 'संबंधित कार्य संदर्भ:' : 'Grounded Evidence Sources:'}
                      </span>
                      {msg.evidence.map((item, eIdx) => (
                        <span
                          key={eIdx}
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            fontFamily: 'monospace',
                            background: '#FFFFFF',
                            border: '1px solid #1D1E22',
                            borderRadius: '4px',
                            padding: '0.15rem 0.45rem',
                            color: '#0A2458'
                          }}
                        >
                          {item.id || item.work_id || item.title || JSON.stringify(item)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: '#1D1E22',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}
                  >
                    <User size={18} />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: '#DCEDEA',
                  border: '1.5px solid #2F7F7A',
                  color: '#2F7F7A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Bot size={18} />
              </div>
              <div
                style={{
                  background: '#FAF8F3',
                  border: '1.5px solid #1D1E22',
                  borderRadius: '14px 14px 14px 2px',
                  padding: '0.85rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem'
                }}
              >
                <span className="spinner" style={{ width: '16px', height: '16px', border: '2px solid #2F7F7A', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  {isHi ? 'MPLADS डेटा विश्लेषण किया जा रहा है...' : 'Analyzing MPLADS dataset artifacts...'}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div style={{ padding: '1rem 1.5rem', background: '#FAF8F3', borderTop: '1.5px solid #1D1E22' }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isHi ? 'MPLADS कार्यों, विसंगतियों या जोखिम स्कोर के बारे में पूछें...' : 'Ask about MPLADS works, cost overruns, delay risks or MP performance...'}
              disabled={loading}
              style={{
                flex: 1,
                padding: '0.8rem 1.1rem',
                fontSize: '0.92rem',
                border: '1.5px solid #1D1E22',
                borderRadius: 'var(--radius-full)',
                background: '#FFFFFF',
                outline: 'none',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)'
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="btn-teal"
              style={{
                padding: '0.8rem 1.5rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.9rem',
                cursor: (!input.trim() || loading) ? 'not-allowed' : 'pointer',
                opacity: (!input.trim() || loading) ? 0.5 : 1,
                boxShadow: (!input.trim() || loading) ? 'none' : '2px 3px 0px #1D1E22'
              }}
            >
              <span>{isHi ? 'पूछें' : 'Ask'}</span>
              <Send size={15} />
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Page Footer */}
      <Footer hideCTAButtons={true} />
    </div>
  );
};

export default AssistantView;
