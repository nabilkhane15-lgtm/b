import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
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
    console.error('Uncaught error in application:', error, errorInfo);
  }

  private handleResetData = () => {
    try {
      localStorage.clear();
      window.location.reload();
    } catch (e) {
      console.error('Failed to clear storage:', e);
      window.location.reload();
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-2xl text-center space-y-5">
            <div className="w-16 h-16 bg-rose-500/20 text-rose-400 rounded-2xl mx-auto flex items-center justify-center text-3xl">
              🏸
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-black text-white">
                অ্যাপ লোড হতে সমস্যা হয়েছে
              </h2>
              <p className="text-xs text-slate-300">
                Application encounter an unexpected state. Please refresh or reset data to default.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-left overflow-auto max-h-32 text-[11px] font-mono text-rose-300">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white transition-all shadow-lg shadow-emerald-600/30"
              >
                🔄 পেজ রিফ্রেশ করুন (Reload)
              </button>
              <button
                type="button"
                onClick={this.handleResetData}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 font-bold text-xs text-slate-200 transition-all border border-slate-600"
              >
                🛠️ ডেটা রিসেট ও ঠিক করুন
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
