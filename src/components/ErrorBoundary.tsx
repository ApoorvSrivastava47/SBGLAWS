import React from 'react';
import { Link } from 'react-router-dom';

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'An unexpected error occurred.',
    };
  }

  override componentDidCatch(error: Error): void {
    console.error('Application ErrorBoundary caught:', error);
  }

  override render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white text-[#08070C] flex items-center justify-center px-6 py-16">
          <div className="max-w-xl w-full border border-[#08070C]/15 p-8 md:p-12 bg-[#FFFFFF]">
            <p className="font-mono text-xs uppercase tracking-widest text-[#243A68] mb-3">
              Application Recovery
            </p>
            <h1 className="font-display text-3xl font-bold tracking-tight mb-4">
              Something interrupted this view.
            </h1>
            <p className="text-sm text-[#08070C]/70 leading-relaxed mb-6">
              {this.state.errorMessage.startsWith('{')
                ? 'A database permission or connectivity error occurred while loading this section.'
                : this.state.errorMessage}
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 bg-[#08070C] text-white text-sm font-medium hover:bg-[#243A68] transition-colors cursor-pointer"
              >
                Reload Page
              </button>
              <Link
                to="/"
                onClick={() => this.setState({ hasError: false, errorMessage: '' })}
                className="px-5 py-2.5 border border-[#08070C]/20 text-sm font-medium hover:border-[#08070C] transition-colors"
              >
                Return Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
