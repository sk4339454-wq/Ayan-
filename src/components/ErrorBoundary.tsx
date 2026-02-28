import * as React from "react";
import { ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<any, any> {
  constructor(props: Props) {
    super(props);
    (this as any).state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    const { hasError, error } = (this as any).state;
    if (hasError) {
      return (
        <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 text-center">
          <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-8 animate-pulse">
            <AlertTriangle size={48} />
          </div>
          <h1 className="text-4xl font-bold tracking-tighter mb-4 text-white">System Interruption</h1>
          <p className="text-white/40 max-w-md mb-12 leading-relaxed">
            We've encountered an unexpected error. Our engineers have been notified. 
            In the meantime, you can try refreshing or returning home.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center gap-2 bg-white text-bg px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-transform"
            >
              <RefreshCw size={20} />
              Reload Application
            </button>
            <a
              href="/"
              className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/10 transition-colors"
            >
              <Home size={20} />
              Return Home
            </a>
          </div>
          {process.env.NODE_ENV === "development" && (
            <div className="mt-12 p-4 bg-black/50 rounded-xl border border-white/5 text-left max-w-2xl overflow-auto">
              <p className="text-red-400 font-mono text-xs">{error?.toString()}</p>
            </div>
          )}
        </div>
      );
    }

    return (this as any).props.children;
  }
}
