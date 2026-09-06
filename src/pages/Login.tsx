import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Shield, Eye, EyeOff, Lock, User, AlertTriangle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const [username, setUsername] = useState(() => {
    const remembered = localStorage.getItem("invest_remember");
    if (remembered) return remembered;
    return "";
  });
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setRememberMe(!!localStorage.getItem("invest_remember"));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!username.trim()) {
      setError("Username is required");
      return;
    }
    try {
      await login(username, password);
      if (rememberMe) {
        localStorage.setItem("invest_remember", username);
      } else {
        localStorage.removeItem("invest_remember");
      }
      navigate("/app");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Check credentials and try again.");
    }
  }

  function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setError("Enter a username to receive the reset link.");
      return;
    }
    setError("");
    setResetSent(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0b10] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-cyan-500/10">
            <Shield className="size-6 text-cyan-400" />
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-white/90">Criminal Network Analysis</h1>
          <p className="mt-1 text-xs text-white/30">Investigation Intelligence Platform</p>
        </div>

        {resetSent ? (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 text-center">
            <p className="text-xs text-white/60">If an account exists with that username, a reset link has been sent.</p>
            <button
              onClick={() => setResetSent(false)}
              className="mt-3 text-[11px] text-cyan-400/60 hover:text-cyan-400"
            >
              ← Back to sign in
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" id="login-form">
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/30">Email / Username</label>
              <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 transition-colors focus-within:border-cyan-500/30">
                <User className="size-3.5 text-white/25" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="h-10 flex-1 bg-transparent text-sm text-white/80 placeholder:text-white/20 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-white/30">Password</label>
              <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 transition-colors focus-within:border-cyan-500/30">
                <Lock className="size-3.5 text-white/25" />
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="h-10 flex-1 bg-transparent text-sm text-white/80 placeholder:text-white/20 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="text-white/25 hover:text-white/50"
                >
                  {showPw ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-[11px] text-white/40">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="size-3 rounded border-white/20 bg-white/[0.05]"
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={() => document.getElementById("reset-form")?.scrollIntoView({ behavior: "smooth", block: "center" })}
                className="text-[11px] text-cyan-400/50 hover:text-cyan-400"
              >
                Forgot password?
              </button>
            </div>
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2">
                <AlertTriangle className="size-3.5 text-red-400/70" />
                <p className="text-xs text-red-400/80">{error}</p>
              </div>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="flex h-10 w-full items-center justify-center rounded-lg bg-cyan-600 text-sm font-medium text-white transition-colors hover:bg-cyan-500 disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        )}

        {!resetSent && (
          <form
            id="reset-form"
            onSubmit={handleReset}
            className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 text-center"
          >
            <p className="text-[11px] text-white/40 mb-3">Forgot your password?</p>
            <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2">
              <input
                type="text"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="Enter your username"
                className="flex-1 bg-transparent text-xs text-white/70 placeholder:text-white/20 outline-none"
              />
            </div>
            <button
              type="submit"
              className="mt-3 text-[11px] text-cyan-400/60 hover:text-cyan-400"
            >
              Send reset link
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-[10px] leading-relaxed text-white/20">
            Authorized investigation personnel only.<br />
            All access is logged and monitored.
          </p>
          <div className="mt-3 flex items-center justify-center gap-1.5">
            <Shield className="size-3 text-cyan-400/40" />
            <span className="text-[9px] uppercase tracking-widest text-cyan-400/30">CNA Prototype</span>
          </div>
        </div>
      </div>
    </div>
  );
}
