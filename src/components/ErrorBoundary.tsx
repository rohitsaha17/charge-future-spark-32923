import { Component, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  /** Custom fallback UI. If omitted, a default card is rendered. */
  fallback?: ReactNode;
  /** Optional handler for error reporting (Sentry, etc.) */
  onError?: (error: Error, info: { componentStack: string }) => void;
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Wraps part of the component tree and shows a friendly error card instead
 * of a blank white screen when a render throws. Route-level boundaries
 * prevent one page crashing the whole app; admin-page boundaries let a
 * misbehaving CMS tab fail without signing the user out.
 *
 * React 18 still lacks a functional API for this, so class component.
 */
class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error('[ErrorBoundary]', error, info.componentStack);
    }
    this.props.onError?.(error, info);
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50">
        <div className="max-w-md w-full bg-white rounded-2xl border border-border shadow-elegant p-8 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-destructive" />
          </div>
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="text-sm text-muted-foreground mb-6">
            This page ran into an unexpected error. You can try again, or head
            back home.
          </p>
          {import.meta.env.DEV && (
            <pre className="text-xs text-left bg-muted rounded p-3 mb-4 overflow-auto max-h-40">
              {this.state.error.message}
            </pre>
          )}
          <div className="flex gap-2 justify-center">
            <Button onClick={this.handleReset} variant="outline">
              <RefreshCw className="w-4 h-4 mr-1.5" />
              Try again
            </Button>
            <Button onClick={this.handleReload} variant="outline">
              <RefreshCw className="w-4 h-4 mr-1.5" />
              Reload
            </Button>
            <Button asChild>
              <a href="/">
                <Home className="w-4 h-4 mr-1.5" />
                Home
              </a>
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
