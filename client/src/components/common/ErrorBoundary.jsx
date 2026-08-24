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
    try {
      localStorage.removeItem("voicecart_error_state");
    } catch(e) {}
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-[#10151d] border border-[#232a36] rounded-2xl p-6 text-center text-[#e7ecf3] shadow-xl my-4 mx-auto max-w-lg">
          <div className="w-12 h-12 rounded-xl bg-teal/10 border border-teal/30 flex items-center justify-center text-2xl mx-auto mb-3">
            🛒
          </div>
          <h3 className="text-base font-bold mb-1">VoiceCart AI Assistant</h3>
          <p className="text-xs text-[#8891a0] mb-4">
            {this.state.error?.message || "Dashboard loaded safely."}
          </p>
          <button
            onClick={this.handleReset}
            className="px-4 py-2 rounded-xl bg-[#1dd3a8] text-[#0a0e14] font-bold text-xs shadow hover:opacity-90 transition-all">
            Refresh Component ✓
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
