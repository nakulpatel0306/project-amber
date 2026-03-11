import { useState } from 'react';
import { Bug, Lightbulb, Star, Send, CheckCircle2, Clock, Zap, ChevronUp, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { cn } from '../../utils/cn';

type FeedbackType = 'bug_report' | 'feature_request' | 'satisfaction';
type FeatureStatus = 'requested' | 'planned' | 'in_progress' | 'completed';

interface FeedbackTab {
  id: FeedbackType;
  label: string;
  icon: React.ElementType;
  placeholder: string;
}

interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  status: FeatureStatus;
  votes: number;
  userVoted: boolean;
  category: string;
}

const tabs: FeedbackTab[] = [
  {
    id: 'feature_request',
    label: 'Features',
    icon: Lightbulb,
    placeholder: 'Describe the feature you would like to see and how it would help you...',
  },
  {
    id: 'bug_report',
    label: 'Bug Report',
    icon: Bug,
    placeholder: 'Describe the issue you encountered. Include steps to reproduce if possible...',
  },
  {
    id: 'satisfaction',
    label: 'Feedback',
    icon: Star,
    placeholder: 'Share your overall experience with Amber. What do you love? What could be better?',
  },
];

// Mock feature requests - in a real app, these would come from the database
const mockFeatureRequests: FeatureRequest[] = [
  {
    id: '1',
    title: 'Dark mode for mobile app',
    description: 'Add dark mode support for the mobile experience',
    status: 'completed',
    votes: 234,
    userVoted: false,
    category: 'UI/UX',
  },
  {
    id: '2',
    title: 'Video interview scheduling',
    description: 'Allow employers to schedule video interviews directly in the platform',
    status: 'in_progress',
    votes: 189,
    userVoted: true,
    category: 'Features',
  },
  {
    id: '3',
    title: 'Salary transparency filter',
    description: 'Filter jobs by salary range before applying',
    status: 'planned',
    votes: 156,
    userVoted: false,
    category: 'Search',
  },
  {
    id: '4',
    title: 'Portfolio showcase section',
    description: 'Add a section to showcase projects and work samples',
    status: 'in_progress',
    votes: 142,
    userVoted: false,
    category: 'Profile',
  },
  {
    id: '5',
    title: 'AI resume suggestions',
    description: 'Use AI to suggest improvements to candidate resumes',
    status: 'planned',
    votes: 98,
    userVoted: false,
    category: 'AI',
  },
  {
    id: '6',
    title: 'Company culture videos',
    description: 'Allow employers to upload short culture videos',
    status: 'requested',
    votes: 67,
    userVoted: false,
    category: 'Features',
  },
];

const statusConfig: Record<FeatureStatus, { label: string; color: string; icon: React.ElementType }> = {
  requested: { label: 'Requested', color: '#78716C', icon: Clock },
  planned: { label: 'Planned', color: '#8B5CF6', icon: Lightbulb },
  in_progress: { label: 'In Progress', color: '#F59E0B', icon: Zap },
  completed: { label: 'Completed', color: '#10B981', icon: CheckCircle2 },
};

export function FeedbackSection() {
  const { user } = useAuth();
  const { success, error: showError } = useToast();

  const [activeTab, setActiveTab] = useState<FeedbackType>('feature_request');
  const [message, setMessage] = useState('');
  const [bugTitle, setBugTitle] = useState('');
  const [bugSeverity, setBugSeverity] = useState<'low' | 'medium' | 'high'>('medium');
  const [rating, setRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [featureRequests, setFeatureRequests] = useState<FeatureRequest[]>(mockFeatureRequests);
  const [statusFilter, setStatusFilter] = useState<FeatureStatus | 'all'>('all');

  const handleSubmit = async () => {
    if (activeTab === 'bug_report' && !bugTitle.trim()) {
      showError('Title Required', 'Please enter a title for the bug report.');
      return;
    }

    if (!message.trim()) {
      showError('Message Required', 'Please enter your feedback before submitting.');
      return;
    }

    if (activeTab === 'satisfaction' && !rating) {
      showError('Rating Required', 'Please select a rating before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('feedback').insert({
        user_id: user?.id,
        feedback_type: activeTab,
        message: activeTab === 'bug_report'
          ? `[${bugSeverity.toUpperCase()}] ${bugTitle.trim()}\n\n${message.trim()}`
          : message.trim(),
        rating: activeTab === 'satisfaction' ? rating : null,
        page: activeTab === 'bug_report' ? `settings:bug:${bugSeverity}` : 'settings',
      });

      if (error) throw error;

      success('Thank You!', activeTab === 'bug_report'
        ? 'Bug report submitted. We\'ll investigate ASAP.'
        : 'Your feedback has been submitted successfully.');
      setMessage('');
      setBugTitle('');
      setBugSeverity('medium');
      setRating(null);
      setSubmitted(true);

      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      showError('Failed To Submit', 'Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = (featureId: string) => {
    setFeatureRequests(prev =>
      prev.map(f =>
        f.id === featureId
          ? { ...f, votes: f.userVoted ? f.votes - 1 : f.votes + 1, userVoted: !f.userVoted }
          : f
      )
    );
  };

  const currentTab = tabs.find(t => t.id === activeTab)!;

  const filteredFeatures = featureRequests
    .filter(f => statusFilter === 'all' || f.status === statusFilter)
    .sort((a, b) => b.votes - a.votes);

  const statusCounts = {
    all: featureRequests.length,
    requested: featureRequests.filter(f => f.status === 'requested').length,
    planned: featureRequests.filter(f => f.status === 'planned').length,
    in_progress: featureRequests.filter(f => f.status === 'in_progress').length,
    completed: featureRequests.filter(f => f.status === 'completed').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}
          >
            <Lightbulb className="w-4 h-4" style={{ color: '#f59e0b' }} />
          </div>
          <h2
            className="text-base font-semibold"
            style={{ color: 'var(--color-text)' }}
          >
            Feedback & Features
          </h2>
        </div>
        <p className="text-sm mt-1" style={{ color: 'var(--color-textMuted)' }}>
          Help Shape The Future Of Amber
        </p>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-1 p-1 rounded-xl"
        style={{ backgroundColor: 'var(--color-surface)' }}
      >
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => {
              setActiveTab(id);
              setSubmitted(false);
            }}
            className={cn(
              'flex-1 flex items-center justify-center gap-2',
              'py-2.5 px-3 rounded-lg text-xs sm:text-sm font-medium',
              'transition-all'
            )}
            style={{
              backgroundColor:
                activeTab === id ? 'var(--color-background)' : 'transparent',
              color:
                activeTab === id
                  ? 'var(--color-text)'
                  : 'var(--color-textMuted)',
            }}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Feature Requests Board */}
      {activeTab === 'feature_request' && (
        <div className="space-y-4">
          {/* Status Filter */}
          <div className="flex flex-wrap gap-2">
            {(['all', 'in_progress', 'planned', 'requested', 'completed'] as const).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5'
                )}
                style={{
                  backgroundColor: statusFilter === status
                    ? status === 'all' ? 'var(--color-accent)' : statusConfig[status as FeatureStatus]?.color + '20'
                    : 'var(--color-surface)',
                  color: statusFilter === status
                    ? status === 'all' ? 'white' : statusConfig[status as FeatureStatus]?.color
                    : 'var(--color-textMuted)',
                  borderColor: statusFilter === status
                    ? status === 'all' ? 'var(--color-accent)' : statusConfig[status as FeatureStatus]?.color
                    : 'var(--color-border)',
                }}
              >
                {status === 'all' ? 'All' : statusConfig[status]?.label}
                <span
                  className="px-1.5 py-0.5 rounded text-xs"
                  style={{
                    backgroundColor: statusFilter === status ? 'var(--color-surfaceHover)' : 'var(--color-background)',
                  }}
                >
                  {statusCounts[status]}
                </span>
              </button>
            ))}
          </div>

          {/* Feature List */}
          <div className="space-y-3">
            {filteredFeatures.map(feature => {
              const config = statusConfig[feature.status];
              return (
                <div
                  key={feature.id}
                  className="p-4 rounded-xl border flex items-start gap-4"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  {/* Vote Button */}
                  <button
                    onClick={() => handleVote(feature.id)}
                    className={cn(
                      'flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition-all min-w-[50px]'
                    )}
                    style={{
                      backgroundColor: feature.userVoted
                        ? 'var(--color-accent)'
                        : 'var(--color-background)',
                      color: feature.userVoted
                        ? 'white'
                        : 'var(--color-textMuted)',
                    }}
                  >
                    <ChevronUp className="w-4 h-4" />
                    <span className="text-xs font-bold">{feature.votes}</span>
                  </button>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4
                        className="text-sm font-medium"
                        style={{ color: 'var(--color-text)' }}
                      >
                        {feature.title}
                      </h4>
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1"
                        style={{
                          backgroundColor: config.color + '20',
                          color: config.color,
                        }}
                      >
                        <config.icon className="w-3 h-3" />
                        {config.label}
                      </span>
                    </div>
                    <p
                      className="text-xs"
                      style={{ color: 'var(--color-textMuted)' }}
                    >
                      {feature.description}
                    </p>
                    <span
                      className="inline-block mt-2 px-2 py-0.5 rounded text-xs"
                      style={{
                        backgroundColor: 'var(--color-background)',
                        color: 'var(--color-textMuted)',
                      }}
                    >
                      {feature.category}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Submit New Feature Request */}
          <div
            className="p-4 rounded-xl border"
            style={{
              backgroundColor: 'var(--color-background)',
              borderColor: 'var(--color-border)',
            }}
          >
            <h4
              className="text-sm font-medium mb-3 flex items-center gap-2"
              style={{ color: 'var(--color-text)' }}
            >
              <Lightbulb className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
              Suggest A Feature
            </h4>
            <Textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Describe the feature you'd like to see..."
              rows={3}
              disabled={isSubmitting}
            />
            <div className="flex items-center justify-between mt-3">
              <p
                className="text-xs"
                style={{ color: 'var(--color-textMuted)' }}
              >
                {message.length} / 2000 characters
              </p>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={!message.trim() || isSubmitting}
                isLoading={isSubmitting}
                leftIcon={<Send className="w-3 h-3" />}
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bug Report Form */}
      {activeTab === 'bug_report' && (
        <div className="space-y-4">
          <div
            className="p-4 rounded-xl"
            style={{ backgroundColor: 'var(--color-surface)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Bug className="w-5 h-5" style={{ color: '#EF4444' }} />
              <h4
                className="text-sm font-medium"
                style={{ color: 'var(--color-text)' }}
              >
                Report A Bug
              </h4>
            </div>
            <p
              className="text-xs mb-4"
              style={{ color: 'var(--color-textMuted)' }}
            >
              Found something that's not working? Let us know and we'll fix it ASAP.
            </p>

            <div className="space-y-3">
              <Input
                label="Bug Title"
                value={bugTitle}
                onChange={e => setBugTitle(e.target.value)}
                placeholder="Brief description of the issue"
                leftIcon={<AlertCircle className="w-4 h-4" />}
                disabled={isSubmitting}
              />

              {/* Severity */}
              <div>
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                  Severity
                </p>
                <div className="flex gap-2">
                  {([
                    { value: 'low' as const, label: 'Low', color: '#10B981' },
                    { value: 'medium' as const, label: 'Medium', color: '#F59E0B' },
                    { value: 'high' as const, label: 'High', color: '#EF4444' },
                  ]).map(sev => (
                    <button
                      key={sev.value}
                      onClick={() => setBugSeverity(sev.value)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{
                        backgroundColor: bugSeverity === sev.value ? `${sev.color}20` : 'var(--color-background)',
                        color: bugSeverity === sev.value ? sev.color : 'var(--color-textMuted)',
                        border: `1px solid ${bugSeverity === sev.value ? `${sev.color}40` : 'var(--color-border)'}`,
                      }}
                    >
                      {sev.label}
                    </button>
                  ))}
                </div>
              </div>

              <Textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder={currentTab.placeholder}
                rows={4}
                disabled={isSubmitting}
              />
            </div>

            <div className="flex items-center justify-between mt-3">
              <p
                className="text-xs"
                style={{ color: 'var(--color-textMuted)' }}
              >
                {submitted ? (
                  <span style={{ color: 'var(--color-success)' }}>
                    Bug report submitted! We'll investigate.
                  </span>
                ) : (
                  `${message.length} / 2000 characters`
                )}
              </p>
              <Button
                onClick={handleSubmit}
                disabled={!bugTitle.trim() || !message.trim() || isSubmitting}
                isLoading={isSubmitting}
                leftIcon={<Send className="w-4 h-4" />}
              >
                Submit Bug Report
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Satisfaction Rating */}
      {activeTab === 'satisfaction' && (
        <div className="space-y-4">
          <div
            className="p-4 rounded-xl"
            style={{ backgroundColor: 'var(--color-surface)' }}
          >
            <p
              className="text-sm mb-3"
              style={{ color: 'var(--color-text)' }}
            >
              How would you rate your experience?
            </p>
            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5].map(value => (
                <button
                  key={value}
                  onClick={() => setRating(value)}
                  className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center',
                    'transition-all border'
                  )}
                  style={{
                    backgroundColor:
                      rating && rating >= value
                        ? 'var(--color-accent)'
                        : 'var(--color-background)',
                    borderColor:
                      rating && rating >= value
                        ? 'var(--color-accent)'
                        : 'var(--color-border)',
                    color:
                      rating && rating >= value
                        ? 'white'
                        : 'var(--color-textMuted)',
                  }}
                >
                  <Star
                    className="w-6 h-6"
                    fill={rating && rating >= value ? 'currentColor' : 'none'}
                  />
                </button>
              ))}
            </div>
            {rating && (
              <p
                className="text-sm mb-4"
                style={{ color: 'var(--color-accent)' }}
              >
                {rating === 1 && 'Very unsatisfied'}
                {rating === 2 && 'Unsatisfied'}
                {rating === 3 && 'Neutral'}
                {rating === 4 && 'Satisfied'}
                {rating === 5 && 'Very satisfied!'}
              </p>
            )}

            <Textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder={currentTab.placeholder}
              rows={4}
              disabled={isSubmitting}
            />
            <div className="flex items-center justify-between mt-3">
              <p
                className="text-xs"
                style={{ color: 'var(--color-textMuted)' }}
              >
                {submitted ? (
                  <span style={{ color: 'var(--color-success)' }}>
                    Thank you for your feedback!
                  </span>
                ) : (
                  `${message.length} / 2000 characters`
                )}
              </p>
              <Button
                onClick={handleSubmit}
                disabled={!message.trim() || isSubmitting || !rating}
                isLoading={isSubmitting}
                leftIcon={<Send className="w-4 h-4" />}
              >
                Submit Feedback
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div
        className="p-4 rounded-xl text-xs"
        style={{
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-textMuted)',
        }}
      >
        <p>
          Your feedback helps us build a better product. We read every
          submission and prioritize features based on community votes.
        </p>
      </div>
    </div>
  );
}
