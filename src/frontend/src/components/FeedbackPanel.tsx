import { useState, useEffect } from 'react';
import { Send, CheckCircle, Circle, Clock, ThumbsUp, MessageCircle } from 'lucide-react';

interface FeedbackItem {
  id: string;
  type: 'bug' | 'feature' | 'improvement';
  content: string;
  status: 'pending' | 'in_progress' | 'completed';
  votes: number;
  voted: boolean;
  timestamp: Date;
}

const initialFeedback: FeedbackItem[] = [
  {
    id: '1',
    type: 'feature',
    content: 'add support for linux package managers',
    status: 'in_progress',
    votes: 12,
    voted: false,
    timestamp: new Date('2024-01-15'),
  },
  {
    id: '2',
    type: 'improvement',
    content: 'faster app installations with parallel downloads',
    status: 'pending',
    votes: 8,
    voted: false,
    timestamp: new Date('2024-01-20'),
  },
  {
    id: '3',
    type: 'feature',
    content: 'add custom script execution',
    status: 'completed',
    votes: 15,
    voted: true,
    timestamp: new Date('2024-01-10'),
  },
  {
    id: '4',
    type: 'bug',
    content: 'fix timeout on large cask installs',
    status: 'completed',
    votes: 6,
    voted: false,
    timestamp: new Date('2024-01-18'),
  },
];

type FeedbackType = 'all' | 'bug' | 'feature' | 'improvement';

export function FeedbackPanel() {
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>(() => {
    const saved = localStorage.getItem('luna-feedback');
    return saved ? JSON.parse(saved) : initialFeedback;
  });
  const [newFeedback, setNewFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState<'bug' | 'feature' | 'improvement'>('feature');
  const [filter, setFilter] = useState<FeedbackType>('all');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    localStorage.setItem('luna-feedback', JSON.stringify(feedbackList));
  }, [feedbackList]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeedback.trim()) return;

    const newItem: FeedbackItem = {
      id: crypto.randomUUID(),
      type: feedbackType,
      content: newFeedback.trim().toLowerCase(),
      status: 'pending',
      votes: 1,
      voted: true,
      timestamp: new Date(),
    };

    setFeedbackList(prev => [newItem, ...prev]);
    setNewFeedback('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
  };

  const handleVote = (id: string) => {
    setFeedbackList(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              votes: item.voted ? item.votes - 1 : item.votes + 1,
              voted: !item.voted,
            }
          : item
      )
    );
  };

  const filteredFeedback = feedbackList
    .filter(item => filter === 'all' || item.type === filter)
    .sort((a, b) => b.votes - a.votes);

  const getStatusIcon = (status: FeedbackItem['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-3.5 h-3.5" style={{ color: 'var(--color-success)' }} />;
      case 'in_progress':
        return <Clock className="w-3.5 h-3.5" style={{ color: 'var(--color-warning)' }} />;
      default:
        return <Circle className="w-3.5 h-3.5" style={{ color: 'var(--color-textMuted)' }} />;
    }
  };

  const getTypeColor = (type: FeedbackItem['type']) => {
    switch (type) {
      case 'bug':
        return 'var(--color-error)';
      case 'feature':
        return 'var(--color-accent)';
      case 'improvement':
        return 'var(--color-success)';
    }
  };

  return (
    <div className="space-y-4">
      {/* submit feedback */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          {(['feature', 'improvement', 'bug'] as const).map(type => (
            <button
              key={type}
              type="button"
              onClick={() => setFeedbackType(type)}
              className="px-2.5 py-1 text-xs rounded-full transition-all"
              style={{
                backgroundColor:
                  feedbackType === type ? getTypeColor(type) : 'var(--color-surface)',
                color: feedbackType === type ? 'white' : 'var(--color-textMuted)',
                border: `1px solid ${
                  feedbackType === type ? getTypeColor(type) : 'var(--color-border)'
                }`,
              }}
            >
              {type}
            </button>
          ))}
        </div>

        <div
          className="flex items-center gap-2 rounded-lg border p-2"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <input
            type="text"
            value={newFeedback}
            onChange={e => setNewFeedback(e.target.value)}
            placeholder="describe your feedback..."
            className="flex-1 bg-transparent text-sm focus:outline-none"
            style={{ color: 'var(--color-text)' }}
          />
          <button
            type="submit"
            disabled={!newFeedback.trim()}
            className="p-1.5 rounded-md transition-all disabled:opacity-30"
            style={{
              backgroundColor: newFeedback.trim() ? 'var(--color-accent)' : 'transparent',
              color: newFeedback.trim() ? 'white' : 'var(--color-textMuted)',
            }}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

        {submitted && (
          <p className="text-xs text-center slide-in-up" style={{ color: 'var(--color-success)' }}>
            thanks for your feedback!
          </p>
        )}
      </form>

      {/* filter */}
      <div className="flex items-center gap-2">
        <p className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
          filter:
        </p>
        <div className="flex gap-1">
          {(['all', 'feature', 'improvement', 'bug'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className="px-2 py-0.5 text-xs rounded transition-all"
              style={{
                backgroundColor: filter === type ? 'var(--color-surface)' : 'transparent',
                color: filter === type ? 'var(--color-text)' : 'var(--color-textMuted)',
              }}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* feedback list */}
      <div className="space-y-2">
        {filteredFeedback.length === 0 ? (
          <div className="text-center py-6">
            <MessageCircle
              className="w-8 h-8 mx-auto mb-2"
              style={{ color: 'var(--color-textMuted)' }}
            />
            <p className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
              no feedback yet
            </p>
          </div>
        ) : (
          filteredFeedback.map(item => (
            <div
              key={item.id}
              className="p-3 rounded-lg border transition-all"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div className="flex items-start gap-3">
                {/* vote button */}
                <button
                  onClick={() => handleVote(item.id)}
                  className="flex flex-col items-center gap-0.5 p-1.5 rounded-md transition-all"
                  style={{
                    backgroundColor: item.voted ? 'var(--color-accent)' : 'transparent',
                    color: item.voted ? 'white' : 'var(--color-textMuted)',
                  }}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">{item.votes}</span>
                </button>

                {/* content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: getTypeColor(item.type),
                        color: 'white',
                      }}
                    >
                      {item.type}
                    </span>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(item.status)}
                      <span className="text-[10px]" style={{ color: 'var(--color-textMuted)' }}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--color-text)' }}>
                    {item.content}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* info */}
      <p className="text-[10px] text-center" style={{ color: 'var(--color-textMuted)' }}>
        vote on features you want to see built next
      </p>
    </div>
  );
}
