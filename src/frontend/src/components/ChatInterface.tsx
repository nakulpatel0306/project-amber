import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Settings, Loader2, Sparkles } from 'lucide-react';
import { WelcomeScreen } from './WelcomeScreen';
import { ExecutionTimeline } from './ExecutionTimeline';
import { ConfirmationPrompt } from './ConfirmationPrompt';
import { ThemeSelector } from './ThemeSelector';
import {
  executeAllSteps,
  executeCommand,
  type ExecuteCommandResponse,
} from '../utils/api';

export interface Step {
  id: number;
  description: string;
  command: string;
  risk: 'safe' | 'moderate' | 'dangerous';
  status?: 'pending' | 'running' | 'completed' | 'failed';
  output?: string;
  error?: string;
}

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'execution' | 'confirmation';
  content: string;
  timestamp: Date;
  steps?: Step[];
  executionPlan?: ExecuteCommandResponse;
  awaitingConfirmation?: boolean;
}

export function ChatInterface() {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<ExecuteCommandResponse | null>(null);
  const [currentSteps, setCurrentSteps] = useState<Step[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentSteps]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      const response = await executeCommand({
        command: input,
        context: {
          os: navigator.platform,
          current_dir: '~',
        },
      });

      setCurrentPlan(response);
      setCurrentSteps(response.steps);

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        type: 'execution',
        content: `I'll help you with that. Here's what I'll do:`,
        timestamp: new Date(),
        steps: response.steps,
        executionPlan: response,
        awaitingConfirmation: true,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        type: 'assistant',
        content: `Unable to connect to the backend server. Please ensure it's running on localhost:8000.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = async () => {
    if (!currentPlan) return;

    setIsExecuting(true);

    const runningSteps = currentSteps.map(s => ({ ...s, status: 'running' as const }));
    setCurrentSteps(runningSteps);

    setMessages(prev =>
      prev.map(m =>
        m.awaitingConfirmation ? { ...m, awaitingConfirmation: false, steps: runningSteps } : m
      )
    );

    try {
      const response = await executeAllSteps({
        task_id: currentPlan.task_id,
        steps: currentSteps.map(s => ({
          id: s.id,
          command: s.command,
          description: s.description,
        })),
      });

      const updatedSteps = currentSteps.map(step => {
        const result = response.results.find(r => r.step_id === step.id);
        if (result) {
          return {
            ...step,
            status: result.status,
            output: result.output,
            error: result.error || undefined,
          };
        }
        return step;
      });

      setCurrentSteps(updatedSteps);

      setMessages(prev =>
        prev.map(m =>
          m.executionPlan?.task_id === currentPlan.task_id
            ? { ...m, steps: updatedSteps, awaitingConfirmation: false }
            : m
        )
      );

      const allCompleted = updatedSteps.every(s => s.status === 'completed');
      const completionMessage: Message = {
        id: crypto.randomUUID(),
        type: 'assistant',
        content: allCompleted
          ? 'Done! All steps completed successfully.'
          : 'Finished with some issues. Check the details above.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, completionMessage]);
    } catch (err) {
      const failedSteps = currentSteps.map(s => ({
        ...s,
        status: 'failed' as const,
        error: err instanceof Error ? err.message : 'Execution failed',
      }));

      setCurrentSteps(failedSteps);
      setMessages(prev =>
        prev.map(m =>
          m.executionPlan?.task_id === currentPlan.task_id
            ? { ...m, steps: failedSteps, awaitingConfirmation: false }
            : m
        )
      );

      const errorMessage: Message = {
        id: crypto.randomUUID(),
        type: 'assistant',
        content: `Something went wrong: ${err instanceof Error ? err.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsExecuting(false);
      setCurrentPlan(null);
    }
  };

  const handleDecline = () => {
    setMessages(prev =>
      prev.map(m => (m.awaitingConfirmation ? { ...m, awaitingConfirmation: false } : m))
    );

    const declineMessage: Message = {
      id: crypto.randomUUID(),
      type: 'assistant',
      content: 'No problem. Let me know if you need anything else.',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, declineMessage]);
    setCurrentPlan(null);
    setCurrentSteps([]);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const awaitingConfirmation = messages.some(m => m.awaitingConfirmation);

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Header */}
      <header
        className="flex items-center justify-between px-5 py-3 border-b"
        style={{
          backgroundColor: 'var(--color-background)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            <Sparkles className="w-4 h-4" style={{ color: 'var(--color-accentText)' }} />
          </div>
          <span
            className="text-base font-semibold tracking-tight"
            style={{ color: 'var(--color-text)' }}
          >
            Luna
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/signup')}
            className="px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-150"
            style={{
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-accentText)',
            }}
          >
            Sign up
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg transition-all duration-150"
            style={{
              color: showSettings ? 'var(--color-accent)' : 'var(--color-textMuted)',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-surface)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <Settings className="w-4.5 h-4.5" />
          </button>
        </div>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <div
          className="border-b px-5 py-4"
          style={{
            backgroundColor: 'var(--color-backgroundSecondary)',
            borderColor: 'var(--color-border)',
          }}
        >
          <ThemeSelector />
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <WelcomeScreen onSuggestionClick={handleSuggestionClick} />
        ) : (
          <div className="max-w-2xl mx-auto px-5 py-6 space-y-5">
            {messages.map(message => (
              <div key={message.id} className="space-y-4">
                {message.type === 'user' && (
                  <div className="flex justify-end">
                    <div
                      className="max-w-[85%] px-4 py-2.5 rounded-2xl rounded-br-md"
                      style={{
                        backgroundColor: 'var(--color-accent)',
                        color: 'var(--color-accentText)',
                      }}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                )}

                {message.type === 'assistant' && (
                  <div className="flex justify-start">
                    <div
                      className="max-w-[85%] px-4 py-2.5 rounded-2xl rounded-bl-md"
                      style={{
                        backgroundColor: 'var(--color-surface)',
                        color: 'var(--color-text)',
                      }}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                )}

                {message.type === 'execution' && (
                  <div className="space-y-3">
                    <div className="flex justify-start">
                      <div
                        className="max-w-[85%] px-4 py-2.5 rounded-2xl rounded-bl-md"
                        style={{
                          backgroundColor: 'var(--color-surface)',
                          color: 'var(--color-text)',
                        }}
                      >
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      </div>
                    </div>

                    {message.steps && <ExecutionTimeline steps={message.steps} />}

                    {message.awaitingConfirmation && (
                      <ConfirmationPrompt
                        onConfirm={handleConfirm}
                        onDecline={handleDecline}
                        isExecuting={isExecuting}
                      />
                    )}
                  </div>
                )}
              </div>
            ))}

            {isProcessing && (
              <div className="flex justify-start">
                <div
                  className="px-4 py-2.5 rounded-2xl rounded-bl-md flex items-center gap-2"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-textSecondary)',
                  }}
                >
                  <Loader2
                    className="w-4 h-4 animate-spin"
                    style={{ color: 'var(--color-accent)' }}
                  />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Input Area */}
      <div
        className="border-t px-5 py-4"
        style={{
          backgroundColor: 'var(--color-background)',
          borderColor: 'var(--color-border)',
        }}
      >
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <div
            className="flex items-end rounded-xl border transition-all duration-150"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                awaitingConfirmation
                  ? 'Respond to the prompt above...'
                  : 'What would you like me to do?'
              }
              disabled={isProcessing || awaitingConfirmation}
              rows={1}
              className="flex-1 px-4 py-3 bg-transparent border-0 focus:ring-0 focus:outline-none resize-none text-sm disabled:opacity-50"
              style={{
                color: 'var(--color-text)',
                minHeight: '44px',
                maxHeight: '120px',
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isProcessing || awaitingConfirmation}
              className="m-1.5 p-2.5 rounded-lg transition-all duration-150 disabled:opacity-30"
              style={{
                backgroundColor:
                  input.trim() && !isProcessing ? 'var(--color-accent)' : 'transparent',
                color:
                  input.trim() && !isProcessing
                    ? 'var(--color-accentText)'
                    : 'var(--color-textMuted)',
              }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
