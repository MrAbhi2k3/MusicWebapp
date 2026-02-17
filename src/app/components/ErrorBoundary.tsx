import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router';

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
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-8">
          <div className="max-w-md w-full">
            {/* Animated background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-gray-800 p-8 text-center">
              {/* Error Icon */}
              <div className="w-20 h-20 bg-gradient-to-br from-red-600/20 to-red-800/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>

              <h1 className="text-3xl font-bold text-white mb-3">
                Oops! Something went wrong
              </h1>
              
              <p className="text-gray-400 mb-8">
                Don't worry, even Spider-Man has bad days. Let's get you back on track.
              </p>

              {/* Error Details (for development) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-black/50 rounded-xl p-4 mb-6 text-left overflow-auto max-h-32">
                  <p className="text-red-400 text-sm font-mono">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={this.handleReset}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full font-medium hover:from-red-500 hover:to-red-600 transition-all shadow-lg shadow-red-600/30"
                >
                  <RefreshCw className="w-5 h-5" />
                  Try Again
                </button>
                
                <Link
                  to="/"
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white rounded-full font-medium hover:bg-white/20 transition-all"
                >
                  <Home className="w-5 h-5" />
                  Go Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Helper component for route-level error boundaries
export function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        <div className="bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-gray-800 p-8">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Error</h2>
          <p className="text-gray-400 mb-6">{error.message}</p>
          <button
            onClick={resetErrorBoundary}
            className="px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-500 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}

