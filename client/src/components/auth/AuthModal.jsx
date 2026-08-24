import { useState } from "react";
import { loginUser, signupUser, googleAuthUser } from "../../services/auth.service.js";

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [tab, setTab] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let user;
      if (tab === "login") {
        user = await loginUser({ email, password });
      } else {
        user = await signupUser({ name: name || "User", email, password });
      }
      onAuthSuccess?.(user);
      onClose();
    } catch (err) {
      setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSSO() {
    setLoading(true);
    setError(null);
    try {
      const user = await googleAuthUser({
        name: "Kushagra Bhargava",
        email: "kushagra@voicecart.ai",
      });
      onAuthSuccess?.(user);
      onClose();
    } catch (err) {
      setError("Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-panel border border-border-soft rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-faint hover:text-text-main text-lg transition-colors"
          aria-label="Close auth modal">
          ✕
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-teal/10 border border-teal/30 flex items-center justify-center text-xl mb-3">
            🎙️
          </div>
          <h2 className="text-xl font-bold text-text-main">Welcome to VoiceCart</h2>
          <p className="text-xs text-text-dim mt-1">Your AI-powered Voice Shopping Assistant</p>
        </div>

        {/* Google SSO Button */}
        <button
          onClick={handleGoogleSSO}
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-xl bg-panel-2 border border-border-soft hover:border-teal-dim flex items-center justify-center gap-3 text-xs font-medium text-text-main transition-colors mb-4">
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-4">
          <div className="w-full border-t border-border-soft"></div>
          <span className="absolute bg-panel px-3 text-[10px] font-bold text-text-faint uppercase tracking-wider">
            OR
          </span>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="flex bg-panel-2 p-1 rounded-xl mb-4 border border-border-soft">
          <button
            onClick={() => { setTab("login"); setError(null); }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              tab === "login" ? "bg-teal/20 text-teal border border-teal/30" : "text-text-dim hover:text-text-main"
            }`}>
            Sign In
          </button>
          <button
            onClick={() => { setTab("signup"); setError(null); }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              tab === "signup" ? "bg-teal/20 text-teal border border-teal/30" : "text-text-dim hover:text-text-main"
            }`}>
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-2.5 rounded-xl border border-red-400/30 bg-red-400/5 text-xs text-red-400 mb-4">
            ✕ {error}
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {tab === "signup" && (
            <div>
              <label className="block text-[11.5px] font-medium text-text-dim mb-1">Full Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-panel-2 border border-border-soft text-text-main text-xs focus:outline-none focus:border-teal-dim transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-[11.5px] font-medium text-text-dim mb-1">Email Address</label>
            <input
              type="email"
              placeholder="name@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-panel-2 border border-border-soft text-text-main text-xs focus:outline-none focus:border-teal-dim transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-[11.5px] font-medium text-text-dim mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-panel-2 border border-border-soft text-text-main text-xs focus:outline-none focus:border-teal-dim transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-teal text-bg font-semibold text-xs transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <span className="w-4 h-4 rounded-full border-2 border-bg border-t-transparent animate-spin" /> : null}
            <span>{tab === "login" ? "Sign In" : "Create Account"}</span>
          </button>
        </form>

        {/* Continue as Guest */}
        <div className="text-center mt-4">
          <button
            onClick={onClose}
            className="text-[11.5px] text-text-faint hover:text-text-dim underline underline-offset-2 transition-colors">
            Continue as Guest →
          </button>
        </div>
      </div>
    </div>
  );
}
