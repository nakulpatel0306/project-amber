import { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '../ui/Button';

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
            <div
              className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-error)', opacity: 0.1 }}
            >
              <AlertTriangle
                className="w-8 h-8"
                style={{ color: 'var(--color-error)' }}
              />
            </div>

            <h1
              className="text-xl font-semibold mb-2"
              style={{ color: 'var(--color-text)' }}
            >
              something went wrong
            </h1>

            <p
              className="text-sm mb-6"
              style={{ color: 'var(--color-textMuted)' }}
            >
              we encountered an unexpected error. please try again or return to
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
                  error details
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
                go home
              </Button>
              <Button
                onClick={this.handleRetry}
                leftIcon={<RefreshCw className="w-4 h-4" />}
              >
                try again
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
