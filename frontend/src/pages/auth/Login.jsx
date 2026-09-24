import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiEye, FiEyeOff, FiLock, FiMail, FiRefreshCw, FiShield } from "react-icons/fi";
import { toast } from "react-toastify";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import GoogleLoginButton from "../../components/auth/GoogleLoginButton";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [mode, setMode] = useState("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const redirect = (user) => {
    const redirectTo = window.history.state?.usr?.redirectTo;
    if (redirectTo?.startsWith("/")) navigate(redirectTo);
    else if (user?.role === "recruiter") navigate("/recruiter/dashboard");
    else if (user?.role === "admin") navigate("/admin/dashboard");
    else navigate("/candidate/dashboard");
  };

  const startCooldown = () => {
    setResendCooldown(60);
    const timer = setInterval(() => setResendCooldown((v) => { if (v <= 1) { clearInterval(timer); return 0; } return v - 1; }), 1000);
  };

  const requestOtp = async () => {
    if (!email.trim()) { setError("Please enter your email address."); return; }
    try {
      setLoading(true); setError("");
      const response = await api.post("/auth/login/request-otp", { email: email.trim() });
      setOtpSent(true); startCooldown(); setOtp("");
      toast.success(response.data?.message || "Login OTP sent.");
    } catch (err) { setError(err.response?.data?.message || "Unable to send login OTP."); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError("");
    if (!email.trim()) { setError("Please enter your email address."); return; }
    if (mode === "password" && !password) { setError("Please enter your password."); return; }
    if (mode === "otp" && otp.length !== 6) { setError("Please enter the 6-digit OTP."); return; }
    try {
      setLoading(true);
      const endpoint = mode === "otp" ? "/auth/login/verify-otp" : "/auth/login";
      const payload = mode === "otp" ? { email: email.trim(), otp } : { email: email.trim(), password };
      const response = await api.post(endpoint, payload);
      const data = response.data;
      if (!data.success) throw new Error(data.message || "Login failed.");
      login(data.token, data.user);
      if (rememberMe) localStorage.setItem("rememberMe", "true"); else localStorage.removeItem("rememberMe");
      toast.success("Welcome back to Jobify.");
      redirect(data.user);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to login. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="hidden bg-slate-950 lg:flex lg:flex-col lg:justify-between lg:p-12">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">J</div>Jobify</Link>
          <div className="max-w-lg"><p className="text-sm font-semibold uppercase tracking-wider text-blue-400">Welcome back</p><h1 className="mt-4 text-4xl font-bold leading-tight text-white">Take the next step in your career.</h1><p className="mt-6 text-lg leading-8 text-slate-400">Access your profile, discover relevant opportunities, manage applications and stay connected with employers.</p></div>
          <p className="text-sm text-slate-500">© {new Date().getFullYear()} Jobify</p>
        </div>
        <div className="flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600"><FiArrowLeft /> Back to Jobify</Link>
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
              <h2 className="text-2xl font-bold text-slate-950">Sign in to your account</h2>
              <p className="mt-2 text-sm text-slate-500">Use your password, a login OTP, or Google.</p>

              <div className="mt-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
                <button type="button" onClick={() => { setMode("password"); setError(""); }} className={`rounded-lg px-3 py-2 text-sm font-semibold ${mode === "password" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>Password</button>
                <button type="button" onClick={() => { setMode("otp"); setError(""); }} className={`rounded-lg px-3 py-2 text-sm font-semibold ${mode === "otp" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>Login OTP</button>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div><label className="mb-2 block text-sm font-semibold text-slate-700">Email address</label><div className="relative"><FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></div></div>
                {mode === "password" ? <div><div className="mb-2 flex items-center justify-between"><label className="block text-sm font-semibold text-slate-700">Password</label><Link to="/forgot-password" className="text-sm font-medium text-blue-600">Forgot password?</Link></div><div className="relative"><FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-12 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /><button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400">{showPassword ? <FiEyeOff /> : <FiEye />}</button></div></div> : <div><label className="mb-2 block text-sm font-semibold text-slate-700">Login OTP</label><div className="relative"><FiShield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input inputMode="numeric" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="6-digit OTP" className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 text-sm tracking-[0.25em] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></div><div className="mt-3 flex items-center justify-between"><button type="button" onClick={requestOtp} disabled={loading || resendCooldown > 0} className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 disabled:text-slate-400"><FiRefreshCw className={loading ? "animate-spin" : ""} />{otpSent ? (resendCooldown ? `Resend in ${resendCooldown}s` : "Resend OTP") : "Send OTP"}</button><span className="text-xs text-slate-400">OTP expires in 10 minutes</span></div></div>}
                {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
                <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-blue-600" /> Remember me</label>
                <button type="submit" disabled={loading || (mode === "otp" && !otpSent)} className="w-full rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{loading ? "Signing in..." : mode === "otp" ? "Verify & Sign In" : "Sign In"}</button>
              </form>

              <div className="my-6 flex items-center gap-3"><div className="h-px flex-1 bg-slate-200" /><span className="text-xs font-semibold uppercase text-slate-400">or</span><div className="h-px flex-1 bg-slate-200" /></div>
              <GoogleLoginButton />
              <div className="mt-7 border-t border-slate-200 pt-6 text-center"><p className="text-sm text-slate-500">Don't have an account? <Link to="/register" className="font-semibold text-blue-600">Create an account</Link></p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
