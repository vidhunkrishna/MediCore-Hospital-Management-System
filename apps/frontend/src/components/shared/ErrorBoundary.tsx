import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props { children: ReactNode; }
interface State { hasError: boolean; message: string; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(err: Error): State {
    return { hasError: true, message: err.message };
  }

  reset = () => this.setState({ hasError: false, message: '' });

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center p-8">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <AlertTriangle className="w-7 h-7 text-red-400" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Something went wrong</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">{this.state.message || 'An unexpected error occurred in this section.'}</p>
        </div>
        <Button variant="outline" size="sm" onClick={this.reset} className="gap-2">
          <RefreshCw className="w-3.5 h-3.5" /> Try again
        </Button>
      </div>
    );
  }
}
