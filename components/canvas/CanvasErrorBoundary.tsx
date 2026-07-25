'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class CanvasErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message || 'Error rendering 3D canvas.' };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('💥 3D Canvas Error Boundary caught an exception:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-neutral-950 p-6 text-center text-white space-y-3 z-30">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 text-xl font-bold">
            ⚠️
          </div>
          <h3 className="text-sm font-black uppercase tracking-wider text-neutral-200">
            3D Model Load Exception
          </h3>
          <p className="text-xs text-neutral-400 max-w-md">
            {this.state.errorMessage.includes('Unexpected token')
              ? 'The 3D model file served by Vercel is a Git LFS text pointer instead of a binary .glb file. Run `git lfs pull` or configure Vercel Git LFS.'
              : this.state.errorMessage}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, errorMessage: '' })}
            className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-xs font-bold text-neutral-300 uppercase tracking-wider transition-all cursor-pointer"
          >
            Retry Loading Scene 🔄
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
