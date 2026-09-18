import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, LogOut, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      showDetails: false,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Terdeteksi uncaught runtime error:', error);
    console.error('[ErrorBoundary] Component stack trace:', errorInfo.componentStack);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetSession = () => {
    try {
      localStorage.removeItem('portal_user');
      sessionStorage.clear();
    } catch {
      // ignore
    }
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border border-rose-200 p-6 sm:p-8">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {this.props.fallbackTitle || 'Terjadi Kendala pada Tampilan'}
            </h1>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Aplikasi mengalami kesalahan saat merender halaman. Ini bisa terjadi karena data sesi
              tersimpan yang tidak cocok atau gangguan koneksi.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Muat Ulang Halaman
              </button>
              <button
                type="button"
                onClick={this.handleResetSession}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-slate-500" />
                Reset Sesi & Masuk Lagi
              </button>
            </div>

            {/* Collapsible Error Trace */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
                className="flex items-center justify-between w-full text-left text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
              >
                <span>Detail Teknis untuk Pengembang</span>
                {this.state.showDetails ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {this.state.showDetails && (
                <div className="mt-3 p-3 bg-slate-900 text-slate-100 rounded-xl text-[11px] font-mono overflow-x-auto space-y-2 max-h-60">
                  <div className="text-rose-400 font-bold">
                    {this.state.error?.toString() || 'Unknown error'}
                  </div>
                  {this.state.errorInfo?.componentStack && (
                    <pre className="text-slate-400 whitespace-pre-wrap text-[10px]">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
