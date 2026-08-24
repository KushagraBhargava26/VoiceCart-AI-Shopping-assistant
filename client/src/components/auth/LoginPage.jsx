import { useState } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { loginUser, signupUser, googleAuthUser } from "../../services/auth.service.js";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "718294628194-voicecart.apps.googleusercontent.com";

function LoginPageContent({ onLoginSuccess, onGuestLogin }) {
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

  async function handleGoogleSuccess(credentialResponse) {
    if (!credentialResponse?.credential) {
      setError("Google authentication token was missing.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const user = await googleAuthUser({ idToken: credentialResponse.credential });
      onLoginSuccess?.(user);
    } catch (err) {
      setError(err.message || "Google authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleManualGoogleSSO() {
    setLoading(true);
    setError(null);
    try {
      const user = await googleAuthUser({
        name: "Google User",
        email: `google_${Date.now()}@voicecart.ai`,
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
      <div className="absolute top-0 right-0 w-[600px] h-[500px] bg-gradient-to-bl from-purple/15 via-teal/10 to-transparent blur-3xl pointer-events-none" />

      {/* Top Header Navigation */}
      <header className="max-w-7xl w-full mx-auto flex items-center justify-between z-10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal to-purple flex items-center justify-center text-lg shadow-lg">
            🎙️
          </div>
          <span className="text-base font-bold tracking-tight text-text-main">VoiceCart</span>
        </div>

        <span className="text-xs text-text-faint hidden sm:inline">AI Voice Shopping Assistant v2.0</span>
      </header>

      {/* 2-COLUMN SPLIT CONTAINER */}
      <main className="max-w-7xl w-full mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10 py-4">
        {/* LEFT SIDE: BRANDING & VOICE VISUALS */}
        <div className="lg:col-span-7 space-y-6 pr-0 lg:pr-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal/10 border border-teal-dim/40 text-xs font-semibold text-teal">
            <span>✨</span> Built for Indian Grocery & Daily Shopping
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-text-main leading-tight">
            Shop hands-free with your{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal via-purple to-indigo-400">
              Voice Assistant
            </span>.
          </h1>

          <p className="text-sm text-text-dim leading-relaxed max-w-xl">
            Speak in Hindi or English to add items, estimate cart bill live, and reorder from shopping history with zero effort.
          </p>

          {/* Voice Command Demonstration Banner */}
          <div className="p-4 rounded-2xl bg-panel border border-border-soft backdrop-blur-md flex items-center gap-4 max-w-lg">
            <div className="w-14 h-14 rounded-2xl bg-panel-2 border border-teal-dim/40 flex items-center justify-center text-2xl flex-shrink-0 relative">
              🎤
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-teal border-2 border-panel" />
            </div>
            <div>
              <p className="text-xs font-semibold text-text-main mb-1">
                "Doodh add karo aur 2 bread hata do"
              </p>
              <p className="text-[11px] text-text-dim">Instant AI Parsing • Hindi & English Commands</p>
            </div>
          </div>

          {/* 4 Feature Cards Grid */}
          <div className="grid grid-cols-2 gap-3 max-w-lg pt-1">
            <div className="p-3 rounded-xl bg-panel/60 border border-border-soft">
              <span className="text-base block mb-1">🗣️</span>
              <h4 className="text-xs font-semibold text-text-main">Bilingual Speech</h4>
              <p className="text-[10px] text-text-dim mt-0.5">Hindi & Hinglish voice NLP</p>
            </div>

            <div className="p-3 rounded-xl bg-panel/60 border border-border-soft">
              <span className="text-base block mb-1">💰</span>
              <h4 className="text-xs font-semibold text-text-main">Budget Estimator</h4>
              <p className="text-[10px] text-text-dim mt-0.5">Live ₹ total & price tags</p>
            </div>

            <div className="p-3 rounded-xl bg-panel/60 border border-border-soft">
              <span className="text-base block mb-1">🛍️</span>
              <h4 className="text-xs font-semibold text-text-main">Smart Product Picker</h4>
              <p className="text-[10px] text-text-dim mt-0.5">Catalog options selection</p>
            </div>

            <div className="p-3 rounded-xl bg-panel/60 border border-border-soft">
              <span className="text-base block mb-1">🔄</span>
              <h4 className="text-xs font-semibold text-text-main">Instant History Reorder</h4>
              <p className="text-[10px] text-text-dim mt-0.5">1-click item restoration</p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: DEDICATED LOGIN CARD */}
        <div className="lg:col-span-5 w-full max-w-md mx-auto lg:max-w-none">
          <div className="bg-panel border border-border-soft rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
            {/* Card Header */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-text-main tracking-tight">
                {isSignUp ? "Create Your Account" : "Sign in to VoiceCart"}
              </h2>
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

            {/* Toggle Sign In / Create Account */}
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
            <div className="grid grid-cols-2 gap-3 items-center">
              {/* Google Sign In Component / Button */}
              <div className="relative flex items-center justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError("Google Sign-In failed.")}
                  shape="pill"
                  size="medium"
                  theme="filled_black"
                  text="signin_with"
                />
              </div>

              {/* Guest Access (Bottom Right - Same Line) */}
              <button
                type="button"
                onClick={onGuestLogin}
                className="py-2 px-3 rounded-full bg-panel-2 border border-border-soft hover:border-teal-dim hover:bg-panel flex items-center justify-center gap-1.5 text-xs font-medium text-text-dim hover:text-text-main transition-colors shadow-sm h-[38px]">
                <span>👤</span>
                <span className="truncate">Guest Access →</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl w-full mx-auto text-center text-[11px] text-text-faint py-2 z-10">
        © 2026 VoiceCart AI Inc. All rights reserved.
      </footer>
    </div>
  );
}

export default function LoginPage(props) {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <LoginPageContent {...props} />
    </GoogleOAuthProvider>
  );
}
