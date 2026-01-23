import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  Loader2,
  LogOut,
  Plus,
  Settings,
  MessageSquare,
  History,
  Moon,
  X,
  Ghost,
  User,
  MessageCircle,
  Check,
} from 'lucide-react';
import { WelcomeScreen } from './WelcomeScreen';
import { ExecutionTimeline } from './ExecutionTimeline';
import { ConfirmationPrompt } from './ConfirmationPrompt';
import { SettingsPanel } from './SettingsPanel';
import { FeedbackPanel } from './FeedbackPanel';
import { AccountPage } from './AccountPage';
import { useAuth } from '../contexts/AuthContext';
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

interface CommandHistoryItem {
  command: string;
  timestamp: Date;
}

// Chat data stored per chat
interface ChatData {
  id: string;
  title: string;
  messages: Message[];
  currentPlan: ExecuteCommandResponse | null;
  currentSteps: Step[];
  createdAt: Date;
}

const placeholderPrompts = [
  'install figma',
  'install chrome',
  'setup python environment',
  'install vscode',
  'check docker status',
];

type SidebarView = 'none' | 'settings' | 'feedback' | 'history';

interface Tab {
  id: string;
  type: 'chat' | 'account';
  title: string;
}

// Helper to generate chat title from first message or default
const generateChatTitle = (messages: Message[], index: number): string => {
  const firstUserMessage = messages.find(m => m.type === 'user');
  if (firstUserMessage) {
    const content = firstUserMessage.content.toLowerCase();
    return content.length > 20 ? content.slice(0, 20) + '...' : content;
  }
  return `chat ${index}`;
};

export function ChatInterface() {
  const navigate = useNavigate();
  const { user, signOut, isAuthEnabled } = useAuth();
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [sidebarView, setSidebarView] = useState<SidebarView>('none');
  const [commandHistory, setCommandHistory] = useState<CommandHistoryItem[]>(() => {
    const saved = localStorage.getItem('luna-command-history');
    return saved ? JSON.parse(saved) : [];
  });
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [placeholderText, setPlaceholderText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [isIncognito, setIsIncognito] = useState(false);

  // Multi-chat state
  const [chats, setChats] = useState<Record<string, ChatData>>(() => {
    const saved = localStorage.getItem('luna-chats');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Convert date strings back to Date objects
        Object.values(parsed).forEach((chat: any) => {
          chat.createdAt = new Date(chat.createdAt);
          chat.messages.forEach((m: any) => {
            m.timestamp = new Date(m.timestamp);
          });
        });
        return parsed;
      } catch {
        return { 'chat-1': { id: 'chat-1', title: 'chat', messages: [], currentPlan: null, currentSteps: [], createdAt: new Date() } };
      }
    }
    return { 'chat-1': { id: 'chat-1', title: 'chat', messages: [], currentPlan: null, currentSteps: [], createdAt: new Date() } };
  });
  const [tabs, setTabs] = useState<Tab[]>(() => {
    const saved = localStorage.getItem('luna-tabs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [{ id: 'chat-1', type: 'chat', title: 'chat' }];
      }
    }
    return [{ id: 'chat-1', type: 'chat', title: 'chat' }];
  });
  const [activeTabId, setActiveTabId] = useState<string>(() => {
    const saved = localStorage.getItem('luna-active-tab');
    return saved || 'chat-1';
  });
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Get current chat data
  const currentChat = chats[activeTabId];
  const messages = currentChat?.messages || [];
  const currentPlan = currentChat?.currentPlan || null;
  const currentSteps = currentChat?.currentSteps || [];

  // Helper to update current chat
  const updateCurrentChat = useCallback((updates: Partial<ChatData>) => {
    setChats(prev => ({
      ...prev,
      [activeTabId]: { ...prev[activeTabId], ...updates }
    }));
  }, [activeTabId]);

  // Save chats to localStorage
  useEffect(() => {
    localStorage.setItem('luna-chats', JSON.stringify(chats));
  }, [chats]);

  // Save tabs to localStorage
  useEffect(() => {
    localStorage.setItem('luna-tabs', JSON.stringify(tabs));
  }, [tabs]);

  // Save active tab to localStorage
  useEffect(() => {
    localStorage.setItem('luna-active-tab', activeTabId);
  }, [activeTabId]);

  // Focus edit input when editing
  useEffect(() => {
    if (editingTabId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingTabId]);

  // Get activeTab for use throughout component
  const activeTab = tabs.find(t => t.id === activeTabId);

  // typing and backspace animation for placeholder
  useEffect(() => {
    if (messages.length > 0 || activeTab?.type !== 'chat') return;

    const currentPrompt = placeholderPrompts[placeholderIndex];

    if (isTyping) {
      if (placeholderText.length < currentPrompt.length) {
        const timeout = setTimeout(() => {
          setPlaceholderText(currentPrompt.slice(0, placeholderText.length + 1));
        }, 80);
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => {
          setIsTyping(false);
        }, 2000);
        return () => clearTimeout(timeout);
      }
    } else {
      if (placeholderText.length > 0) {
        const timeout = setTimeout(() => {
          setPlaceholderText(placeholderText.slice(0, -1));
        }, 40);
        return () => clearTimeout(timeout);
      } else {
        setPlaceholderIndex((prev) => (prev + 1) % placeholderPrompts.length);
        setIsTyping(true);
      }
    }
  }, [placeholderText, isTyping, placeholderIndex, messages.length, activeTab?.type]);

  // save command history
  useEffect(() => {
    localStorage.setItem('luna-command-history', JSON.stringify(commandHistory.slice(0, 50)));
  }, [commandHistory]);

  // keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.key === 'k') {
          e.preventDefault();
          handleNewChat();
        } else if (e.key === ',') {
          e.preventDefault();
          setSidebarView(sidebarView === 'settings' ? 'none' : 'settings');
        }
      }
      if (e.key === 'Escape') {
        setSidebarView('none');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarView]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentSteps, scrollToBottom]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing || !currentChat) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    // Update messages and auto-generate title if this is first message
    const newMessages = [...messages, userMessage];
    const newTitle = messages.length === 0 ? generateChatTitle(newMessages, Object.keys(chats).length) : currentChat.title;

    updateCurrentChat({ messages: newMessages, title: newTitle });

    // Also update tab title
    if (messages.length === 0) {
      setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, title: newTitle } : t));
    }

    setInput('');

    // check if auth is required and user is not logged in
    if (isAuthEnabled && !user) {
      const authRequiredMessage: Message = {
        id: crypto.randomUUID(),
        type: 'assistant',
        content: 'please sign up or log in to your existing account to use luna.',
        timestamp: new Date(),
      };
      updateCurrentChat({ messages: [...newMessages, authRequiredMessage] });
      return;
    }

    // add to history (skip if incognito)
    if (!isIncognito) {
      setCommandHistory(prev => [
        { command: input, timestamp: new Date() },
        ...prev.filter(h => h.command !== input),
      ]);
    }

    setIsProcessing(true);

    try {
      const response = await executeCommand({
        command: input,
        context: {
          os: navigator.platform,
          current_dir: '~',
        },
      });

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        type: 'execution',
        content: `i'll help you with that. here's my plan:`,
        timestamp: new Date(),
        steps: response.steps,
        executionPlan: response,
        awaitingConfirmation: true,
      };

      updateCurrentChat({
        messages: [...newMessages, assistantMessage],
        currentPlan: response,
        currentSteps: response.steps
      });
    } catch {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        type: 'assistant',
        content: `couldn't connect to the backend. make sure it's running on localhost:8000.`,
        timestamp: new Date(),
      };
      updateCurrentChat({ messages: [...newMessages, errorMessage] });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = async () => {
    if (!currentPlan || !currentChat) return;

    setIsExecuting(true);

    const runningSteps = currentSteps.map(s => ({ ...s, status: 'running' as const }));

    const updatedMessages = messages.map(m =>
      m.awaitingConfirmation ? { ...m, awaitingConfirmation: false, steps: runningSteps } : m
    );

    updateCurrentChat({ currentSteps: runningSteps, messages: updatedMessages });

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

      const messagesWithUpdatedSteps = updatedMessages.map(m =>
        m.executionPlan?.task_id === currentPlan.task_id
          ? { ...m, steps: updatedSteps, awaitingConfirmation: false }
          : m
      );

      const allCompleted = updatedSteps.every(s => s.status === 'completed');
      const someFailed = updatedSteps.some(s => s.status === 'failed');

      let completionContent = 'done. all steps completed successfully.';
      if (someFailed) {
        completionContent = 'finished with some issues. check the details above.';
      } else if (!allCompleted) {
        completionContent = 'completed partially. some steps may need attention.';
      }

      const completionMessage: Message = {
        id: crypto.randomUUID(),
        type: 'assistant',
        content: completionContent,
        timestamp: new Date(),
      };

      updateCurrentChat({
        currentSteps: updatedSteps,
        messages: [...messagesWithUpdatedSteps, completionMessage],
        currentPlan: null
      });
    } catch (err) {
      const failedSteps = currentSteps.map(s => ({
        ...s,
        status: 'failed' as const,
        error: err instanceof Error ? err.message : 'execution failed',
      }));

      const messagesWithFailedSteps = updatedMessages.map(m =>
        m.executionPlan?.task_id === currentPlan.task_id
          ? { ...m, steps: failedSteps, awaitingConfirmation: false }
          : m
      );

      const errorMessage: Message = {
        id: crypto.randomUUID(),
        type: 'assistant',
        content: `something went wrong: ${err instanceof Error ? err.message.toLowerCase() : 'unknown error'}.`,
        timestamp: new Date(),
      };

      updateCurrentChat({
        currentSteps: failedSteps,
        messages: [...messagesWithFailedSteps, errorMessage],
        currentPlan: null
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleDecline = () => {
    if (!currentChat) return;

    const updatedMessages = messages.map(m =>
      m.awaitingConfirmation ? { ...m, awaitingConfirmation: false } : m
    );

    const declineMessage: Message = {
      id: crypto.randomUUID(),
      type: 'assistant',
      content: 'no problem. let me know if you need anything else.',
      timestamp: new Date(),
    };

    updateCurrentChat({
      messages: [...updatedMessages, declineMessage],
      currentPlan: null,
      currentSteps: []
    });
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

  const handleNewChat = () => {
    const chatId = `chat-${Date.now()}`;
    const chatCount = Object.keys(chats).length + 1;
    const newChat: ChatData = {
      id: chatId,
      title: `chat ${chatCount}`,
      messages: [],
      currentPlan: null,
      currentSteps: [],
      createdAt: new Date()
    };
    const newTab: Tab = { id: chatId, type: 'chat', title: `chat ${chatCount}` };

    setChats(prev => ({ ...prev, [chatId]: newChat }));
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(chatId);
    setInput('');
    setPlaceholderIndex(0);
    setPlaceholderText('');
    setIsTyping(true);
  };

  const handleClearHistory = () => {
    // Clear all chats and reset to single new chat
    const chatId = 'chat-1';
    const newChat: ChatData = {
      id: chatId,
      title: 'chat',
      messages: [],
      currentPlan: null,
      currentSteps: [],
      createdAt: new Date()
    };
    setChats({ [chatId]: newChat });
    setTabs([{ id: chatId, type: 'chat', title: 'chat' }]);
    setActiveTabId(chatId);
    setCommandHistory([]);
    setSidebarView('none');
    setInput('');
  };

  const handleHistoryClick = (command: string) => {
    setInput(command);
    setSidebarView('none');
    inputRef.current?.focus();
  };

  const openAccountTab = () => {
    const existingAccountTab = tabs.find(t => t.type === 'account');
    if (existingAccountTab) {
      setActiveTabId(existingAccountTab.id);
    } else {
      const newTab: Tab = { id: 'account', type: 'account', title: 'account' };
      setTabs(prev => [...prev, newTab]);
      setActiveTabId('account');
    }
  };

  const closeTab = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);

    // Don't close if it's the only chat tab
    const chatTabs = tabs.filter(t => t.type === 'chat');
    if (tab?.type === 'chat' && chatTabs.length === 1) return;

    const tabIndex = tabs.findIndex(t => t.id === tabId);
    const newTabs = tabs.filter(t => t.id !== tabId);
    setTabs(newTabs);

    // Delete chat data if it's a chat tab
    if (tab?.type === 'chat') {
      setChats(prev => {
        const newChats = { ...prev };
        delete newChats[tabId];
        return newChats;
      });
    }

    // Switch to another tab if closing the active one
    if (activeTabId === tabId) {
      const newActiveIndex = Math.min(tabIndex, newTabs.length - 1);
      setActiveTabId(newTabs[newActiveIndex].id);
    }
  };

  const startEditingTab = (tabId: string, currentTitle: string) => {
    setEditingTabId(tabId);
    setEditingTitle(currentTitle);
  };

  const finishEditingTab = () => {
    if (editingTabId && editingTitle.trim()) {
      // Update tab title
      setTabs(prev => prev.map(t =>
        t.id === editingTabId ? { ...t, title: editingTitle.trim() } : t
      ));
      // Update chat title if it's a chat
      if (chats[editingTabId]) {
        setChats(prev => ({
          ...prev,
          [editingTabId]: { ...prev[editingTabId], title: editingTitle.trim() }
        }));
      }
    }
    setEditingTabId(null);
    setEditingTitle('');
  };

  const cancelEditingTab = () => {
    setEditingTabId(null);
    setEditingTitle('');
  };
  const awaitingConfirmation = messages.some(m => m.awaitingConfirmation);

  return (
    <div className="flex h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* sidebar */}
      <aside
        className="w-14 flex flex-col items-center py-4 border-r"
        style={{
          backgroundColor: 'var(--color-backgroundSecondary)',
          borderColor: 'var(--color-border)',
        }}
      >
        {/* logo */}
        <div className="mb-6">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer btn-smooth"
            style={{
              background: 'linear-gradient(135deg, var(--color-accent), var(--color-accentHover))',
            }}
            onClick={handleNewChat}
            title="new chat"
          >
            <Moon className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* nav items */}
        <nav className="flex-1 flex flex-col items-center gap-2">
          <NavButton
            icon={<Plus className="w-4 h-4" />}
            active={false}
            onClick={handleNewChat}
            title="new chat"
          />
          <NavButton
            icon={<MessageSquare className="w-4 h-4" />}
            active={sidebarView === 'feedback'}
            onClick={() => setSidebarView(sidebarView === 'feedback' ? 'none' : 'feedback')}
            title="feedback"
          />
          <NavButton
            icon={<History className="w-4 h-4" />}
            active={sidebarView === 'history'}
            onClick={() => setSidebarView(sidebarView === 'history' ? 'none' : 'history')}
            title="history"
          />
        </nav>

        {/* bottom items */}
        <div className="flex flex-col items-center gap-2">
          {isAuthEnabled && user && (
            <NavButton
              icon={<User className="w-4 h-4" />}
              active={activeTab?.type === 'account'}
              onClick={openAccountTab}
              title="account"
            />
          )}
          <NavButton
            icon={<Settings className="w-4 h-4" />}
            active={sidebarView === 'settings'}
            onClick={() => setSidebarView(sidebarView === 'settings' ? 'none' : 'settings')}
            title="settings"
          />
          {isAuthEnabled && user && (
            <NavButton
              icon={<LogOut className="w-4 h-4" />}
              active={false}
              onClick={signOut}
              title="log out"
            />
          )}
        </div>
      </aside>

      {/* panel */}
      {sidebarView !== 'none' && (
        <div
          className="w-80 border-r flex flex-col slide-in-right"
          style={{
            backgroundColor: 'var(--color-backgroundSecondary)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div
            className="flex items-center justify-between px-4 py-3 border-b"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <h2
              className="text-sm font-medium"
              style={{ color: 'var(--color-text)' }}
            >
              {sidebarView === 'settings' && 'settings'}
              {sidebarView === 'feedback' && 'feedback'}
              {sidebarView === 'history' && 'history'}
            </h2>
            <button
              onClick={() => setSidebarView('none')}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--color-textMuted)' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-surface)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {sidebarView === 'settings' && (
              <SettingsPanel onClearHistory={handleClearHistory} />
            )}
            {sidebarView === 'feedback' && <FeedbackPanel />}
            {sidebarView === 'history' && (
              <HistoryList
                history={commandHistory}
                onSelect={handleHistoryClick}
                onClear={() => setCommandHistory([])}
              />
            )}
          </div>
        </div>
      )}

      {/* main content */}
      <div className="flex-1 flex flex-col">
        {/* header */}
        <header
          className="flex items-center justify-between px-5 py-3 border-b"
          style={{
            backgroundColor: 'var(--color-background)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="brand-font" style={{ color: 'var(--color-text)' }}>
              prj luna
            </span>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-textMuted)',
              }}
            >
              beta
            </span>
            {isIncognito && (
              <span
                className="text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1"
                style={{
                  backgroundColor: 'rgba(139, 92, 246, 0.15)',
                  color: 'var(--color-accent)',
                }}
              >
                <Ghost className="w-3 h-3" />
                incognito
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* incognito toggle */}
            <button
              onClick={() => setIsIncognito(!isIncognito)}
              className="p-2 rounded-lg transition-all duration-150"
              style={{
                backgroundColor: isIncognito ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                color: isIncognito ? 'var(--color-accent)' : 'var(--color-textMuted)',
              }}
              onMouseEnter={e => {
                if (!isIncognito) {
                  e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                }
              }}
              onMouseLeave={e => {
                if (!isIncognito) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
              title={isIncognito ? 'exit incognito mode' : 'enter incognito mode'}
            >
              <Ghost className="w-4 h-4" />
            </button>

            {isAuthEnabled && !user && (
              <button
                onClick={() => navigate('/signup')}
                className="px-3 py-1.5 text-xs font-medium rounded-lg btn-smooth"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-accentText)',
                }}
              >
                sign up
              </button>
            )}
          </div>
        </header>

        {/* tab bar - always show when more than one tab */}
        {tabs.length > 1 && (
          <div
            className="flex items-center px-2 border-b"
            style={{
              backgroundColor: 'var(--color-backgroundSecondary)',
              borderColor: 'var(--color-border)',
            }}
          >
            {tabs.map(tab => {
              const isEditing = editingTabId === tab.id;
              const canClose = tab.type === 'account' || tabs.filter(t => t.type === 'chat').length > 1;

              return (
                <div
                  key={tab.id}
                  className="group flex items-center"
                >
                  {isEditing ? (
                    <div className="flex items-center gap-1 px-2 py-1.5">
                      <input
                        ref={editInputRef}
                        type="text"
                        value={editingTitle}
                        onChange={e => setEditingTitle(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') finishEditingTab();
                          if (e.key === 'Escape') cancelEditingTab();
                        }}
                        onBlur={finishEditingTab}
                        className="w-24 px-1.5 py-0.5 text-xs rounded border focus:outline-none focus:ring-1"
                        style={{
                          backgroundColor: 'var(--color-background)',
                          borderColor: 'var(--color-accent)',
                          color: 'var(--color-text)',
                        }}
                      />
                      <button
                        onClick={finishEditingTab}
                        className="p-0.5 rounded"
                        style={{ color: 'var(--color-success)' }}
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setActiveTabId(tab.id)}
                      onDoubleClick={() => tab.type === 'chat' && startEditingTab(tab.id, tab.title)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-medium transition-all border-b-2"
                      style={{
                        color: activeTabId === tab.id ? 'var(--color-text)' : 'var(--color-textMuted)',
                        borderColor: activeTabId === tab.id ? 'var(--color-accent)' : 'transparent',
                        backgroundColor: activeTabId === tab.id ? 'var(--color-background)' : 'transparent',
                      }}
                      title={tab.type === 'chat' ? 'double-click to rename' : ''}
                    >
                      {tab.type === 'chat' ? (
                        <MessageCircle className="w-3 h-3" />
                      ) : (
                        <User className="w-3 h-3" />
                      )}
                      {tab.title}
                    </button>
                  )}
                  {canClose && !isEditing && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        closeTab(tab.id);
                      }}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: 'var(--color-textMuted)' }}
                      onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                        e.currentTarget.style.color = 'var(--color-error)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--color-textMuted)';
                      }}
                      title="close tab"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* main content area */}
        {activeTab?.type === 'account' ? (
          <main className="flex-1 overflow-y-auto">
            <AccountPage />
          </main>
        ) : (
          <>
            {/* chat area */}
            <main className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <WelcomeScreen onSuggestionClick={handleSuggestionClick} />
          ) : (
            <div className="max-w-2xl mx-auto px-5 py-6 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className="message-enter"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
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
                <div className="flex justify-start message-enter">
                  <div
                    className="px-4 py-2.5 rounded-2xl rounded-bl-md flex items-center gap-2"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-textSecondary)',
                    }}
                  >
                    <Loader2
                      className="w-4 h-4 spinner"
                      style={{ color: 'var(--color-accent)' }}
                    />
                    <span className="text-sm">thinking...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </main>

        {/* input area */}
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
                    ? 'respond to the prompt above...'
                    : messages.length === 0
                    ? placeholderText || 'what would you like me to do?'
                    : 'what would you like me to do?'
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
                className="m-1.5 p-2.5 rounded-lg btn-smooth disabled:opacity-30"
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
            <p
              className="text-xs mt-2 text-center"
              style={{ color: 'var(--color-textMuted)' }}
            >
              enter to send · shift+enter for new line · ⌘K new chat
            </p>
          </form>
        </div>
          </>
        )}
      </div>
    </div>
  );
}

function NavButton({
  icon,
  active,
  onClick,
  title,
}: {
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      className="w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-150"
      style={{
        backgroundColor: active ? 'var(--color-surface)' : 'transparent',
        color: active ? 'var(--color-accent)' : 'var(--color-textMuted)',
      }}
      onMouseEnter={e => {
        if (!active) {
          e.currentTarget.style.backgroundColor = 'var(--color-surface)';
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          e.currentTarget.style.backgroundColor = 'transparent';
        }
      }}
      title={title}
    >
      {icon}
    </button>
  );
}

function HistoryList({
  history,
  onSelect,
  onClear,
}: {
  history: CommandHistoryItem[];
  onSelect: (command: string) => void;
  onClear: () => void;
}) {
  if (history.length === 0) {
    return (
      <div className="text-center py-8">
        <History className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--color-textMuted)' }} />
        <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
          no history yet
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--color-textMuted)' }}>
          your commands will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {history.map((item, index) => (
        <button
          key={index}
          onClick={() => onSelect(item.command)}
          className="w-full text-left p-3 rounded-lg border transition-all"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--color-accent)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--color-border)';
          }}
        >
          <p className="text-sm truncate" style={{ color: 'var(--color-text)' }}>
            {item.command}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-textMuted)' }}>
            {new Date(item.timestamp).toLocaleDateString()}
          </p>
        </button>
      ))}

      <button
        onClick={onClear}
        className="w-full p-2 text-xs rounded-lg border transition-all mt-4"
        style={{
          borderColor: 'var(--color-border)',
          color: 'var(--color-textMuted)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'var(--color-error)';
          e.currentTarget.style.color = 'var(--color-error)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--color-border)';
          e.currentTarget.style.color = 'var(--color-textMuted)';
        }}
      >
        clear history
      </button>
    </div>
  );
}
