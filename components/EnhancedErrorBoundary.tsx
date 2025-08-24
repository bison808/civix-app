/**
 * Enhanced Error Boundary with System Health Integration
 * Agent 54: System Stability & External Dependencies Integration Specialist
 * 
 * Comprehensive error handling with automatic recovery, health monitoring,
 * and graceful degradation strategies.
 */

'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Wifi, WifiOff, Clock, Shield } from 'lucide-react';
import { systemHealthService } from '@/services/systemHealthService';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  showError?: boolean;
  level?: 'critical' | 'page' | 'component';
  gracefulDegradation?: {
    enabled: boolean;
    fallbackComponent?: ReactNode;
    retryAfterMs?: number;
  };
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId: string;
  retryCount: number;
  systemHealth?: 'healthy' | 'degraded' | 'critical';
  isRetrying: boolean;
  showSystemHealth: boolean;
}

interface ErrorClassification {
  type: 'network' | 'api' | 'render' | 'unknown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  isRetryable: boolean;
  suggestedAction: string;
}

export class EnhancedErrorBoundary extends Component<Props, State> {
  private retryTimeout?: NodeJS.Timeout;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorId: '',
      retryCount: 0,
      isRetrying: false,
      showSystemHealth: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  async componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Classify the error
    const classification = this.classifyError(error, errorInfo);
    
    // Log error with classification
    console.error('EnhancedErrorBoundary caught error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      classification,
      errorId: this.state.errorId,
      props: this.props
    });

    // Check system health
    try {
      const healthReport = await systemHealthService.getSystemHealth();
      this.setState({ systemHealth: healthReport.overallStatus });
      
      // Log correlation with system health
      if (healthReport.overallStatus !== 'healthy') {
        console.warn('Error occurred during system health issues:', {
          systemHealth: healthReport.overallStatus,
          criticalIssues: healthReport.criticalIssues,
          stabilityScore: healthReport.stabilityScore
        });
      }
    } catch (healthError) {
      console.warn('Failed to check system health during error handling:', healthError);
    }

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Report error to monitoring service (in production)
    if (process.env.NODE_ENV === 'production') {
      this.reportError(error, errorInfo, classification);
    }

    // Auto-retry for retryable errors
    if (classification.isRetryable && this.state.retryCount < 3) {
      this.scheduleRetry(classification);
    }
  }

  private classifyError(error: Error, errorInfo: ErrorInfo): ErrorClassification {
    const errorMessage = error.message.toLowerCase();
    const stackTrace = error.stack?.toLowerCase() || '';

    // Network/API errors
    if (errorMessage.includes('fetch') || 
        errorMessage.includes('network') ||
        errorMessage.includes('api') ||
        errorMessage.includes('timeout')) {
      return {
        type: 'network',
        severity: 'high',
        isRetryable: true,
        suggestedAction: 'Check your internet connection and try again'
      };
    }

    // Render errors
    if (errorMessage.includes('render') ||
        errorMessage.includes('cannot read properties') ||
        stackTrace.includes('react-dom')) {
      return {
        type: 'render',
        severity: 'medium',
        isRetryable: false,
        suggestedAction: 'Refresh the page to reset the component state'
      };
    }

    // External API errors
    if (errorMessage.includes('congress') ||
        errorMessage.includes('geocod') ||
        errorMessage.includes('openstates')) {
      return {
        type: 'api',
        severity: 'medium',
        isRetryable: true,
        suggestedAction: 'External service temporarily unavailable. Using cached data.'
      };
    }

    // Unknown errors
    return {
      type: 'unknown',
      severity: 'high',
      isRetryable: false,
      suggestedAction: 'An unexpected error occurred. Please refresh the page.'
    };
  }

  private scheduleRetry(classification: ErrorClassification): void {
    if (!classification.isRetryable) return;

    const baseDelay = 1000; // 1 second
    const retryDelay = baseDelay * Math.pow(2, this.state.retryCount); // Exponential backoff
    
    console.log(`Scheduling retry ${this.state.retryCount + 1} in ${retryDelay}ms`);
    
    this.setState({ isRetrying: true });

    this.retryTimeout = setTimeout(() => {
      this.setState(prevState => ({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: prevState.retryCount + 1,
        isRetrying: false
      }));
    }, retryDelay);
  }

  private async reportError(error: Error, errorInfo: ErrorInfo, classification: ErrorClassification): Promise<void> {
    try {
      // In a real application, this would send to error reporting service
      // For now, we'll just log structured error data
      const errorReport = {
        timestamp: new Date().toISOString(),
        errorId: this.state.errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        classification,
        url: typeof window !== 'undefined' ? window.location.href : 'unknown',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        retryCount: this.state.retryCount,
        systemHealth: this.state.systemHealth
      };

      console.error('Error report:', errorReport);

      // TODO: Send to error reporting service
      // await errorReportingService.report(errorReport);

    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  }

  private handleRetry = async (): Promise<void> => {
    // Reset circuit breakers if this is a system-wide issue
    if (this.state.systemHealth === 'critical' || this.state.systemHealth === 'degraded') {
      console.log('Resetting system dependencies due to error recovery...');
      await systemHealthService.resetAllDependencies();
    }

    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      isRetrying: true
    });

    // Small delay to show loading state
    setTimeout(() => {
      this.setState({ isRetrying: false });
    }, 500);
  };

  private handleRefresh = (): void => {
    // Clear any pending retries
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }

    // Force page refresh
    window.location.reload();
  };

  private toggleSystemHealth = (): void => {
    this.setState(prevState => ({
      showSystemHealth: !prevState.showSystemHealth
    }));
  };

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  render() {
    if (this.state.isRetrying) {
      return this.renderRetryingState();
    }

    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Use graceful degradation if enabled
      if (this.props.gracefulDegradation?.enabled && 
          this.props.gracefulDegradation.fallbackComponent) {
        return this.props.gracefulDegradation.fallbackComponent;
      }

      return this.renderErrorState();
    }

    return this.props.children;
  }

  private renderRetryingState(): ReactNode {
    return (
      <div className="flex flex-col items-center justify-center p-6 min-h-[200px] bg-blue-50 rounded-lg border border-blue-200">
        <div className="animate-spin">
          <RefreshCw className="h-8 w-8 text-blue-600 mb-3" />
        </div>
        <h3 className="text-lg font-medium text-blue-900 mb-2">
          Retrying...
        </h3>
        <p className="text-sm text-blue-700 text-center">
          Attempting to recover from the error
        </p>
      </div>
    );
  }

  private renderErrorState(): ReactNode {
    if (!this.state.error) return null;

    const classification = this.classifyError(this.state.error, this.state.errorInfo || {} as ErrorInfo);
    const isNetworkError = classification.type === 'network' || classification.type === 'api';

    return (
      <div className="flex flex-col items-center justify-center p-6 min-h-[200px] bg-red-50 rounded-lg border border-red-200">
        <div className="flex items-center mb-4">
          {isNetworkError ? (
            <WifiOff className="h-12 w-12 text-red-500" />
          ) : (
            <AlertTriangle className="h-12 w-12 text-red-500" />
          )}
          {this.state.systemHealth && this.state.systemHealth !== 'healthy' && (
            <Shield className="h-6 w-6 text-orange-500 ml-2" />
          )}
        </div>

        <h2 className="text-lg font-semibold text-red-900 mb-2">
          {this.getErrorTitle(classification)}
        </h2>

        <p className="text-sm text-red-700 mb-4 text-center max-w-md">
          {classification.suggestedAction}
        </p>

        {/* System Health Status */}
        {this.state.systemHealth && this.state.systemHealth !== 'healthy' && (
          <div className="mb-4 p-3 bg-orange-100 rounded-lg border border-orange-200">
            <div className="flex items-center text-sm text-orange-800">
              <Shield className="h-4 w-4 mr-2" />
              System Status: {this.state.systemHealth.toUpperCase()}
            </div>
            <button
              onClick={this.toggleSystemHealth}
              className="text-xs text-orange-600 hover:text-orange-800 mt-1"
            >
              {this.state.showSystemHealth ? 'Hide details' : 'Show details'}
            </button>
            
            {this.state.showSystemHealth && (
              <div className="mt-2 text-xs text-orange-700">
                External services may be experiencing issues. 
                The system is using cached data where possible.
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={this.handleRetry}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>

          <button
            onClick={this.handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Page
          </button>
        </div>

        {/* Retry Counter */}
        {this.state.retryCount > 0 && (
          <div className="mt-3 text-xs text-gray-600">
            Retry attempts: {this.state.retryCount}
          </div>
        )}

        {/* Error Details (Development/Debug Mode) */}
        {(this.props.showError || process.env.NODE_ENV === 'development') && this.state.error && (
          <details className="mt-4 w-full max-w-2xl">
            <summary className="cursor-pointer text-sm text-red-600 hover:text-red-800 mb-2">
              Show technical details
            </summary>
            <div className="p-3 bg-red-100 rounded text-xs overflow-auto">
              <div className="font-mono mb-2">
                <strong>Error ID:</strong> {this.state.errorId}
              </div>
              <div className="font-mono mb-2">
                <strong>Type:</strong> {classification.type} ({classification.severity})
              </div>
              <div className="font-mono mb-2">
                <strong>Message:</strong> {this.state.error.toString()}
              </div>
              {this.state.error.stack && (
                <div className="font-mono mb-2">
                  <strong>Stack:</strong>
                  <pre className="mt-1 text-red-600 whitespace-pre-wrap">
                    {this.state.error.stack}
                  </pre>
                </div>
              )}
              {this.state.errorInfo?.componentStack && (
                <div className="font-mono">
                  <strong>Component Stack:</strong>
                  <pre className="mt-1 text-red-600 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>
          </details>
        )}
      </div>
    );
  }

  private getErrorTitle(classification: ErrorClassification): string {
    switch (classification.type) {
      case 'network':
        return 'Connection Problem';
      case 'api':
        return 'Service Temporarily Unavailable';
      case 'render':
        return 'Display Error';
      default:
        return 'Something Went Wrong';
    }
  }
}

// Specialized error boundaries for different parts of the application

export function APIErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <EnhancedErrorBoundary
      level="component"
      gracefulDegradation={{
        enabled: true,
        fallbackComponent: (
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center text-yellow-800">
              <Clock className="h-5 w-5 mr-2" />
              <span className="font-medium">Loading from cache...</span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              External services are temporarily unavailable. Showing cached data.
            </p>
          </div>
        )
      }}
      onError={(error, errorInfo) => {
        // API-specific error handling
        console.warn('API Error Boundary triggered:', error.message);
      }}
    >
      {children}
    </EnhancedErrorBoundary>
  );
}

export function CriticalErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <EnhancedErrorBoundary
      level="critical"
      showError={process.env.NODE_ENV === 'development'}
      onError={(error, errorInfo) => {
        // Critical error handling - could trigger alerts
        console.error('CRITICAL ERROR:', error, errorInfo);
      }}
    >
      {children}
    </EnhancedErrorBoundary>
  );
}

export function PageErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <EnhancedErrorBoundary
      level="page"
      gracefulDegradation={{
        enabled: true,
        fallbackComponent: (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full mx-4">
              <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h1 className="text-xl font-semibold text-gray-900 mb-2">
                  Page Temporarily Unavailable
                </h1>
                <p className="text-gray-600 mb-4">
                  We're working to resolve this issue. Please try refreshing the page.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          </div>
        )
      }}
    >
      {children}
    </EnhancedErrorBoundary>
  );
}