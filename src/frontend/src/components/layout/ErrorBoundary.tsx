import { Component, type ReactNode, type ErrorInfo } from 'react';
import { RefreshCw, Home } from 'lucide-react';
import { Button } from '../ui/Button';
import { EmberFirefly } from '../ember/EmberFirefly';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className="min-h-screen flex items-center justify-center p-4"
          style={{ backgroundColor: 'var(--color-background)' }}
        >
          <div className="max-w-md w-full text-center">
            {/* Dimmed / flickering Ember firefly */}
            <div className="relative mx-auto mb-6 w-24 h-24 flex items-center justify-center">
              <div
                className="absolute inset-0 rounded-full animate-pulse"
                style={{
                  background: 'radial-gradient(circle, rgba(239, 68, 68, 0.12) 0%, transparent 70%)',
                }}
              />
              <div style={{ opacity: 0.4, filter: 'grayscale(0.6)' }}>
                <EmberFirefly size="lg" mood="thinking" animated />
              </div>
            </div>

            <h1
              className="text-xl font-semibold mb-2"
              style={{ color: 'var(--color-text)' }}
            >
              Something Went Wrong
            </h1>

            <p
              className="text-sm mb-6"
              style={{ color: 'var(--color-textMuted)' }}
            >
              We encountered an unexpected error. Please try again or return to
              the home page.
            </p>

            {this.state.error && (
              <details
                className="mb-6 text-left p-4 rounded-xl"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <summary
                  className="cursor-pointer text-sm font-medium"
                  style={{ color: 'var(--color-textSecondary)' }}
                >
                  Error Details
                </summary>
                <pre
                  className="mt-2 text-xs overflow-auto"
                  style={{ color: 'var(--color-error)' }}
                >
                  {this.state.error.message}
                </pre>
              </details>
            )}

            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                onClick={this.handleGoHome}
                leftIcon={<Home className="w-4 h-4" />}
              >
                Go Home
              </Button>
              <Button
                onClick={this.handleRetry}
                leftIcon={<RefreshCw className="w-4 h-4" />}
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional wrapper for easier use with React Router
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
