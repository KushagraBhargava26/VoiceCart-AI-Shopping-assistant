import { useState } from "react";
import { loginUser, signupUser, googleAuthUser } from "../../services/auth.service.js";

export default function LoginPage({ onLoginSuccess, onGuestLogin }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      if (isSignUp) {
        user = await signupUser({ name: name || "User", email, password });
      } else {
        user = await loginUser({ email, password });
      }
      onLoginSuccess?.(user);
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
        name: "Google User",
        email: `user_${Date.now()}@voicecart.ai`,
      });
      onLoginSuccess?.(user);
    } catch (err) {
      setError("Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg text-text-main flex flex-col justify-between p-4 sm:p-8 relative overflow-x-hidden">
      {/* Background Glow Overlay */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-purple/15 via-teal/10 to-transparent blur-3xl pointer-events-none" />

      {/* Top Header Navigation */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between z-10 pt-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal to-purple flex items-center justify-center text-lg shadow-lg">
            🎙️
          </div>
          <span className="text-base font-bold tracking-tight text-text-main">VoiceCart</span>
        </div>

        <span className="text-xs text-text-faint hidden sm:inline">AI Voice Shopping Assistant v2.0</span>
      </header>

      {/* Main Standalone Login Card */}
      <main className="w-full max-w-md mx-auto my-auto z-10 py-6">
        <div className="bg-panel border border-border-soft rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          
          {/* Top Badge & Title */}
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-teal/10 text-teal border border-teal-dim/40 mb-3">
              <span>✨</span> Voice-Activated Shopping
            </span>
            <h1 className="text-2xl font-bold text-text-main tracking-tight">
              {isSignUp ? "Create Your Account" : "Sign in to VoiceCart"}
            </h1>
            <p className="text-xs text-text-dim mt-1">
              {isSignUp
                ? "Join VoiceCart to sync your lists & custom preferences"
                : "Manage your list, track budget, & voice shop hands-free"}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3 rounded-xl border border-red-400/30 bg-red-400/5 text-xs text-red-400 mb-4">
              ✕ {error}
            </div>
          )}

          {/* Form (TOP) */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-[11.5px] font-medium text-text-dim mb-1.5">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-panel-2 border border-border-soft text-text-main text-xs focus:outline-none focus:border-teal-dim transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-[11.5px] font-medium text-text-dim mb-1.5">Email Address</label>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-panel-2 border border-border-soft text-text-main text-xs focus:outline-none focus:border-teal-dim transition-all"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[11.5px] font-medium text-text-dim">Password</label>
                {!isSignUp && (
                  <a href="#" className="text-[10px] text-teal hover:underline">
                    Forgot password?
                  </a>
                )}
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-panel-2 border border-border-soft text-text-main text-xs focus:outline-none focus:border-teal-dim transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal to-purple hover:opacity-95 text-bg font-bold text-xs transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <span className="w-4 h-4 rounded-full border-2 border-bg border-t-transparent animate-spin" /> : null}
              <span>{isSignUp ? "Create Account & Go to Home" : "Sign In & Go to Home"}</span>
            </button>
          </form>

          {/* Toggle between Sign In / Create Account */}
          <div className="text-center mt-3">
            <button
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
              className="text-[11.5px] text-text-dim hover:text-text-main transition-colors">
              {isSignUp ? "Already have an account? Sign In" : "Need an account? Register here"}
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-5">
            <div className="w-full border-t border-border-soft"></div>
            <span className="absolute bg-panel px-3 text-[10px] font-bold text-text-faint uppercase tracking-wider">
              OR CHOOSE ACCESS
            </span>
          </div>

          {/* Bottom Options on Same Line (Google SSO + Continue as Guest) */}
          <div className="grid grid-cols-2 gap-3">
            {/* Google Sign In (Bottom Left) */}
            <button
              type="button"
              onClick={handleGoogleSSO}
              disabled={loading}
              className="py-2.5 px-3 rounded-xl bg-panel-2 border border-border-soft hover:border-teal-dim flex items-center justify-center gap-2 text-xs font-medium text-text-main transition-colors hover:bg-panel shadow-sm">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span className="truncate">Google Sign In</span>
            </button>

            {/* Guest Access (Bottom Right - Same Line) */}
            <button
              type="button"
              onClick={onGuestLogin}
              className="py-2.5 px-3 rounded-xl bg-panel-2 border border-border-soft hover:border-teal-dim hover:bg-panel flex items-center justify-center gap-1.5 text-xs font-medium text-text-dim hover:text-text-main transition-colors shadow-sm">
              <span>👤</span>
              <span className="truncate">Guest Access →</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto text-center text-[11px] text-text-faint py-2 z-10">
        © 2026 VoiceCart AI Inc. All rights reserved.
      </footer>
    </div>
  );
}
