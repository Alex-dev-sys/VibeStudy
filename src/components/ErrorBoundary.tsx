'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { errorHandler } from '@/lib/error-handler';

interface Props {
  children: ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md border-red-500/30 bg-red-500/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-400">
            <span>⚠️</span>
            <span>Произошла ошибка</span>
          </CardTitle>
          <CardDescription>
            Что-то пошло не так. Не волнуйтесь, ваши данные в безопасности.
          </CardDescription>
        </CardHeader>
        <div className="space-y-4">
          {process.env.NODE_ENV === 'development' && error && (
            <div className="rounded-lg bg-red-950/50 p-4 font-mono text-sm text-red-300">
              <div className="font-semibold text-red-200">{error.name}</div>
              <div className="mt-2">{error.message}</div>
              {error.stack && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-red-400">Stack trace</summary>
                  <pre className="mt-2 overflow-auto text-xs">{error.stack}</pre>
                </details>
              )}
            </div>
          )}
          <div className="flex gap-3">
            <Button onClick={resetError} variant="primary" className="flex-1">
              Попробовать снова
            </Button>
            <Button
              onClick={() => window.location.href = '/'}
              variant="secondary"
              className="flex-1"
            >
              На главную
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    errorHandler.report(error, {
      component: 'ErrorBoundary',
      action: 'componentDidCatch',
      metadata: { componentStack: errorInfo.componentStack }
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

