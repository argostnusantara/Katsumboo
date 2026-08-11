import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

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
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    try {
      localStorage.removeItem('katsumboo_user_session');
    } catch {
      // ignore
    }
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6 text-center font-sans">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-neutral-100">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-black text-neutral-900 mb-2">Terjadi Masalah Sesi</h2>
            <p className="text-xs text-neutral-500 mb-4 leading-relaxed">
              Sesi Anda telah kedaluwarsa atau terjadi pembaruan sistem. Silakan muat ulang untuk melanjutkan.
            </p>
            {this.state.error && (
              <div className="mb-6 p-3 bg-red-50 text-red-700 text-[11px] font-mono rounded-xl text-left overflow-x-auto max-h-32 border border-red-200">
                <strong>Error:</strong> {this.state.error.message || String(this.state.error)}
              </div>
            )}
            <button
              onClick={this.handleReload}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl text-xs transition-all shadow-lg shadow-blue-500/20 cursor-pointer"
            >
              Kembali ke Halaman Utama
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
