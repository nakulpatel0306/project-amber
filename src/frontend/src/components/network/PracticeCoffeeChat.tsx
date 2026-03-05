import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Send, Sparkles, Lightbulb, MessageCircle, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';

interface Message {
  id: number;
  role: 'ai' | 'user';
  text: string;
}

const SCENARIOS = [
  { label: 'General intro', prompt: "Let's practice. Imagine we've just been paired for a 15-minute coffee chat. Introduce yourself — what are you excited about right now?" },
  { label: 'Career pivot', prompt: "You're chatting with someone in an industry you want to break into. How would you explain your interest and what you bring from your current background?" },
  { label: 'Asking for advice', prompt: "You've been paired with a senior leader you admire. You have 15 minutes — how do you open the conversation and make the most of their time?" },
  { label: 'Following up', prompt: "You had a great coffee chat last week and want to follow up. Draft a message that keeps the connection alive without being pushy." },
];

const TIPS = [
  { icon: Lightbulb, title: 'Lead with curiosity', desc: 'Ask specific questions about their work rather than generic ones.' },
  { icon: MessageCircle, title: 'Share, don\'t pitch', desc: 'Talk about what excites you, not just your resume.' },
  { icon: Sparkles, title: 'End with next steps', desc: 'Suggest a concrete follow-up to keep the connection alive.' },
];

const AI_RESPONSES: Record<string, string[]> = {
  greeting: [
    "Good — a warm opening goes a long way. Now imagine they ask 'What are you working on right now?' How would you respond?",
    "Nice start! Personal warmth is key. Try adding one specific detail about why you're excited to chat with *them* specifically.",
    "Solid opener. Now try to weave in something you noticed about their background — it shows you did your homework.",
  ],
  question: [
    "Nice question. Showing genuine curiosity is one of the most effective ways to build rapport. Try following up with something specific to what they said.",
    "Great question! Notice how asking about their experience signals genuine interest. Can you go deeper — what would you ask as a follow-up?",
    "Thoughtful. The best coffee chats feel like mutual discovery, not interviews. Keep that energy going.",
  ],
  closing: [
    "Well done. Ending on a concrete next step keeps the connection alive. Something like 'I'd love to send you my thoughts on X — would that be useful?'",
    "Perfect instinct. A clear next step makes the difference between a forgettable chat and a lasting connection.",
    "Nicely wrapped up. One tip: reference something specific from the conversation in your follow-up — it shows you were truly listening.",
  ],
  default: [
    "That's a solid start. Try to anchor your intro with a specific accomplishment or interest that would resonate with the person you're talking to. What unique perspective do you bring?",
    "Good foundation. Now think about what makes you memorable — can you distill your story into one compelling sentence?",
    "Interesting approach. Try being more specific — instead of broad statements, share a concrete example or story that illustrates your point.",
    "Not bad! One tip: the best networkers balance talking about themselves with showing genuine interest in the other person. Try weaving in a question.",
  ],
};

function getAIResponse(input: string): string {
  const lower = input.toLowerCase();
  let category: keyof typeof AI_RESPONSES = 'default';
  if (lower.includes('hello') || lower.includes('hi ') || lower.includes('hey') || lower.includes('nice to meet') || lower.includes('my name')) {
    category = 'greeting';
  } else if (lower.includes('?')) {
    category = 'question';
  } else if (lower.includes('thank') || lower.includes('great talking') || lower.includes('follow up') || lower.includes('stay in touch') || lower.includes('keep in touch')) {
    category = 'closing';
  }
  const options = AI_RESPONSES[category];
  return options[Math.floor(Math.random() * options.length)];
}

export function PracticeCoffeeChat() {
  const [scenario, setScenario] = useState(0);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: 'ai', text: SCENARIOS[0].prompt },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now(), role: 'user', text: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const aiMsg: Message = { id: Date.now() + 1, role: 'ai', text: getAIResponse(input) };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 800 + Math.random() * 600);
  };

  const switchScenario = (idx: number) => {
    setScenario(idx);
    setMessages([{ id: Date.now(), role: 'ai', text: SCENARIOS[idx].prompt }]);
    setInput('');
  };

  const resetChat = () => {
    setMessages([{ id: Date.now(), role: 'ai', text: SCENARIOS[scenario].prompt }]);
    setInput('');
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Header */}
      <div className="border-b px-4 py-3" style={{ borderColor: 'var(--color-border)' }}>
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link to="/app/network" className="p-1.5 rounded-xl hover:bg-[var(--color-surface)] transition-colors" style={{ color: 'var(--color-textMuted)' }}>
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Practice Coffee Chat</p>
            <p className="text-[11px]" style={{ color: 'var(--color-textMuted)' }}>Sharpen your networking skills with AI coaching</p>
          </div>
          <span className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-xl" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-textMuted)', border: '1px solid var(--color-border)' }}>
            <Sparkles className="w-3 h-3" />
            Voice agent coming soon
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
          {/* Tips panel (shown at start) */}
          {messages.length <= 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {TIPS.map((tip, i) => (
                <div key={i} className="p-4 rounded-2xl border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                  <tip.icon className="w-4 h-4 mb-2" style={{ color: 'var(--color-accent)' }} />
                  <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-text)' }}>{tip.title}</p>
                  <p className="text-[11px] leading-relaxed" style={{ color: 'var(--color-textMuted)' }}>{tip.desc}</p>
                </div>
              ))}
            </div>
          )}

          {/* Scenario selector */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hidden pb-1">
            {SCENARIOS.map((s, i) => (
              <button
                key={i}
                onClick={() => switchScenario(i)}
                className="text-xs px-3 py-1.5 rounded-xl whitespace-nowrap transition-all font-medium"
                style={{
                  backgroundColor: scenario === i ? 'var(--color-accent)' : 'var(--color-surface)',
                  color: scenario === i ? 'var(--color-accentText)' : 'var(--color-textMuted)',
                  border: `1px solid ${scenario === i ? 'var(--color-accent)' : 'var(--color-border)'}`,
                }}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'ai' && (
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-1"
                    style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-accentHover))' }}>
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                <div
                  className="max-w-[80%] px-4 py-3 text-sm leading-relaxed"
                  style={{
                    backgroundColor: msg.role === 'ai' ? 'var(--color-surface)' : 'var(--color-accent)',
                    color: msg.role === 'ai' ? 'var(--color-text)' : 'var(--color-accentText)',
                    border: msg.role === 'ai' ? '1px solid var(--color-border)' : 'none',
                    borderRadius: msg.role === 'ai' ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex">
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-1"
                  style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-accentHover))' }}>
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="px-4 py-3 rounded-2xl" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--color-textMuted)', animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--color-textMuted)', animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--color-textMuted)', animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>
      </div>

      {/* Input area */}
      <div className="border-t px-4 py-3" style={{ borderColor: 'var(--color-border)' }}>
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={resetChat} className="flex-shrink-0">
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !isTyping && handleSend()}
              placeholder="Type your response..."
              disabled={isTyping}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="px-3 py-2.5 rounded-xl transition-all disabled:opacity-30"
              style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-accentText)' }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-center mt-2" style={{ color: 'var(--color-textMuted)' }}>
            Practice mode — responses are AI-generated coaching, not real conversations
          </p>
        </div>
      </div>
    </div>
  );
}
