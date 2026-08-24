import { useState } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import {
  loginUser,
  signupUser,
  googleAuthUser,
  requestForgotPassword,
  resetPassword,
} from "../../services/auth.service.js";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "718294628194-voicecart.apps.googleusercontent.com";

function LoginPageContent({ onLoginSuccess, onGuestLogin }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Forgot Password State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState(null);
  const [forgotSuccess, setForgotSuccess] = useState(null);

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

  // Forgot Password Handlers
  async function handleRequestOTP(e) {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setForgotError("Please enter your registered email address.");
      return;
    }

    setForgotLoading(true);
    setForgotError(null);
    setForgotSuccess(null);

    try {
      const res = await requestForgotPassword(forgotEmail);
      setForgotSuccess(
        `Verification code sent to ${forgotEmail}! ${res.otp ? `(Demo OTP Code: ${res.otp})` : ""}`
      );
      setForgotStep(2);
    } catch (err) {
      setForgotError(err.message || "Failed to send reset code. Please check email.");
    } finally {
      setForgotLoading(false);
    }
  }

  async function handleResetSubmit(e) {
    e.preventDefault();
    if (!forgotOtp.trim() || !forgotNewPassword.trim()) {
      setForgotError("Please enter the OTP code and new password.");
      return;
    }

    setForgotLoading(true);
    setForgotError(null);

    try {
      const user = await resetPassword({
        email: forgotEmail,
        otp: forgotOtp,
        newPassword: forgotNewPassword,
      });
      setShowForgotModal(false);
      onLoginSuccess?.(user);
    } catch (err) {
      setForgotError(err.message || "Password reset failed. Check OTP code.");
    } finally {
      setForgotLoading(false);
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
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(email);
                        setForgotStep(1);
                        setForgotError(null);
                        setForgotSuccess(null);
                        setShowForgotModal(true);
                      }}
                      className="text-[10px] text-teal hover:underline font-medium">
                      Forgot password?
                    </button>
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
              {/* Google Sign In Button */}
              {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
                <div className="relative flex items-center justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError("Google OAuth error: Check Authorized Origins in Google Cloud Console.")}
                    shape="pill"
                    size="medium"
                    theme="filled_black"
                    text="signin_with"
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleManualGoogleSSO}
                  disabled={loading}
                  className="py-2 px-3 rounded-full bg-panel-2 border border-border-soft hover:border-teal-dim flex items-center justify-center gap-2 text-xs font-medium text-text-main transition-colors hover:bg-panel shadow-sm h-[38px]">
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span className="truncate">Google Sign In</span>
                </button>
              )}

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

      {/* FORGOT PASSWORD MODAL */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-panel border border-border-soft rounded-2xl w-full max-w-md p-6 relative shadow-2xl space-y-4">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-text-faint hover:text-text-main text-lg transition-colors">
              ✕
            </button>

            <div className="text-center">
              <div className="w-10 h-10 mx-auto rounded-xl bg-teal/10 border border-teal/30 flex items-center justify-center text-lg mb-2 text-teal">
                🔑
              </div>
              <h3 className="text-lg font-bold text-text-main">Reset Your Password</h3>
              <p className="text-xs text-text-dim mt-0.5">
                {forgotStep === 1
                  ? "Enter your registered email to receive a 6-digit verification code"
                  : "Enter the verification code and set a new password"}
              </p>
            </div>

            {forgotError && (
              <div className="p-2.5 rounded-xl border border-red-400/30 bg-red-400/5 text-xs text-red-400">
                ✕ {forgotError}
              </div>
            )}

            {forgotSuccess && (
              <div className="p-2.5 rounded-xl border border-teal/40 bg-teal/10 text-xs text-teal">
                ✓ {forgotSuccess}
              </div>
            )}

            {forgotStep === 1 ? (
              <form onSubmit={handleRequestOTP} className="space-y-3.5 pt-1">
                <div>
                  <label className="block text-[11.5px] font-medium text-text-dim mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="kushagra@example.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-panel-2 border border-border-soft text-text-main text-xs focus:outline-none focus:border-teal-dim"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-2.5 rounded-xl bg-teal text-bg font-semibold text-xs transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                  {forgotLoading ? <span className="w-4 h-4 rounded-full border-2 border-bg border-t-transparent animate-spin" /> : null}
                  <span>Send Verification Code</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-3 pt-1">
                <div>
                  <label className="block text-[11.5px] font-medium text-text-dim mb-1">6-Digit Verification Code (OTP)</label>
                  <input
                    type="text"
                    placeholder="e.g. 482910"
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-panel-2 border border-border-soft text-text-main text-xs focus:outline-none focus:border-teal-dim font-mono tracking-widest text-center"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11.5px] font-medium text-text-dim mb-1">New Password</label>
                  <input
                    type="password"
                    placeholder="At least 6 characters"
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-panel-2 border border-border-soft text-text-main text-xs focus:outline-none focus:border-teal-dim"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-2.5 rounded-xl bg-teal text-bg font-semibold text-xs transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                  {forgotLoading ? <span className="w-4 h-4 rounded-full border-2 border-bg border-t-transparent animate-spin" /> : null}
                  <span>Reset Password & Sign In</span>
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="text-[11px] text-text-faint hover:text-text-dim underline">
                    ← Change Email
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

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
