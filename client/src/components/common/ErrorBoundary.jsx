import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React ErrorBoundary caught error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0e14] text-[#e7ecf3] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-teal/10 border border-teal/30 flex items-center justify-center text-3xl mb-4">
            🛒
          </div>
          <h2 className="text-xl font-bold mb-2">VoiceCart Dashboard Active</h2>
          <p className="text-xs text-[#8891a0] max-w-md mb-6">
            Something unexpected occurred during navigation. Click below to return to your Shopping Dashboard.
          </p>
          <button
            onClick={this.handleReset}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal to-purple text-[#0a0e14] font-bold text-xs shadow-lg hover:opacity-90 transition-all">
            Go to Home Dashboard →
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
