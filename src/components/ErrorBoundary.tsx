import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary global
 * Captura erros de renderização em qualquer parte da aplicação
 * e exibe uma UI de fallback em vez de tela preta
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Erro capturado:', error, errorInfo);
    this.setState({ errorInfo });

    // Em produção, enviar para serviço de monitoramento (Sentry, LogRocket, etc)
    if (import.meta.env.PROD) {
      // TODO: Enviar erro para backend PHP
      // httpClient.post('/api/errors', { error: error.message, stack: error.stack, info: errorInfo });
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-slate-900/80 border border-red-500/30 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Ops! Algo deu errado
            </h1>
            <p className="text-slate-400 mb-6">
              Ocorreu um erro inesperado ao carregar esta página. 
              Nossa equipe já foi notificada.
            </p>

            {this.state.error && import.meta.env.DEV && (
              <details className="text-left bg-slate-950 border border-slate-800 rounded-lg p-4 mb-6 max-h-48 overflow-auto">
                <summary className="text-sm text-slate-300 cursor-pointer mb-2">
                  Detalhes do erro (modo desenvolvedor)
                </summary>
                <pre className="text-xs text-red-400 whitespace-pre-wrap break-words">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Recarregar
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg transition-colors"
              >
                <Home className="w-4 h-4" />
                Ir para Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
