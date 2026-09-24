import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiUser,
  FiBriefcase,
} from "react-icons/fi";

import api from "../../services/api";

export default function Register() {
  const navigate = useNavigate();

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // IMPORTANT: role is now defined
  const [role, setRole] = useState("jobseeker");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // Basic validation
    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!role) {
      setError("Please select an account type.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/register", {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      });

      const data = response.data || {};

      if (!data.success) {
        setError(data.message || "Registration failed.");
        return;
      }

      console.log("Registration successful:", data);

      /*
       * Registration succeeded.
       * Move user to OTP verification page.
       */
      navigate("/verify-otp", {
        state: {
          email: email.trim().toLowerCase(),
        },
      });
    } catch (error) {
      console.error("Register error:", error);

      setError(
        error.message ||
          "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* =========================================
            LEFT SIDE
        ========================================= */}
        <div className="hidden bg-slate-950 lg:flex lg:flex-col lg:justify-between lg:p-12">

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold text-white"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
              <FiBriefcase size={18} />
            </div>

            Jobify
          </Link>

          {/* Content */}
          <div className="max-w-lg">

            <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">
              Join Jobify
            </p>

            <h1 className="mt-4 text-4xl font-bold leading-tight text-white">
              Build your next career opportunity.
            </h1>

            <p className="mt-6 text-lg leading-8 text-slate-400">
              Create your account, build your professional profile, discover
              opportunities and connect with employers.
            </p>

          </div>

          {/* Footer */}
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Jobify
          </p>

        </div>

        {/* =========================================
            RIGHT SIDE
        ========================================= */}
        <div className="flex items-center justify-center px-6 py-12">

          <div className="w-full max-w-md">

            {/* Back */}
            <Link
              to="/"
              className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
            >
              <FiArrowLeft />
              Back to Jobify
            </Link>

            {/* Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">

              {/* Heading */}
              <div>
                <h2 className="text-2xl font-bold text-slate-950">
                  Create your account
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Join Jobify and start your journey.
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm font-medium text-red-600">
                    {error}
                  </p>
                </div>
              )}

              {/* Form */}
              <form
                onSubmit={handleSubmit}
                className="mt-8 space-y-5"
              >

                {/* =====================================
                    ACCOUNT TYPE
                ===================================== */}
                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Account type
                  </label>

                  <div className="grid grid-cols-2 gap-3">

                    {/* Job Seeker */}
                    <button
                      type="button"
                      onClick={() => setRole("jobseeker")}
                      className={`rounded-xl border px-4 py-4 text-left transition ${
                        role === "jobseeker"
                          ? "border-blue-600 bg-blue-50"
                          : "border-slate-300 bg-white hover:border-blue-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">

                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                            role === "jobseeker"
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <FiUser size={18} />
                        </div>

                        <div>
                          <p
                            className={`text-sm font-semibold ${
                              role === "jobseeker"
                                ? "text-blue-600"
                                : "text-slate-700"
                            }`}
                          >
                            Job Seeker
                          </p>

                          <p className="mt-0.5 text-xs text-slate-500">
                            Find jobs
                          </p>
                        </div>

                      </div>
                    </button>

                    {/* Recruiter */}
                    <button
                      type="button"
                      onClick={() => setRole("recruiter")}
                      className={`rounded-xl border px-4 py-4 text-left transition ${
                        role === "recruiter"
                          ? "border-blue-600 bg-blue-50"
                          : "border-slate-300 bg-white hover:border-blue-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">

                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                            role === "recruiter"
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <FiBriefcase size={18} />
                        </div>

                        <div>
                          <p
                            className={`text-sm font-semibold ${
                              role === "recruiter"
                                ? "text-blue-600"
                                : "text-slate-700"
                            }`}
                          >
                            Recruiter
                          </p>

                          <p className="mt-0.5 text-xs text-slate-500">
                            Hire talent
                          </p>
                        </div>

                      </div>
                    </button>

                  </div>
                </div>

                {/* =====================================
                    NAME
                ===================================== */}
                <div>

                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Full name
                  </label>

                  <div className="relative">

                    <FiUser
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />

                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      autoComplete="name"
                      required
                      className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                  </div>
                </div>

                {/* =====================================
                    EMAIL
                ===================================== */}
                <div>

                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Email address
                  </label>

                  <div className="relative">

                    <FiMail
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                      className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                  </div>
                </div>

                {/* =====================================
                    PASSWORD
                ===================================== */}
                <div>

                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>

                  <div className="relative">

                    <FiLock
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />

                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password"
                      autoComplete="new-password"
                      required
                      className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-12 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 hover:text-slate-700"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <FiEyeOff size={18} />
                      ) : (
                        <FiEye size={18} />
                      )}
                    </button>

                  </div>

                  <p className="mt-2 text-xs text-slate-400">
                    Password must contain at least 6 characters.
                  </p>

                </div>

                {/* =====================================
                    CONFIRM PASSWORD
                ===================================== */}
                <div>

                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Confirm password
                  </label>

                  <div className="relative">

                    <FiLock
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />

                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(e.target.value)
                      }
                      placeholder="Confirm your password"
                      autoComplete="new-password"
                      required
                      className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-12 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          !showConfirmPassword
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 hover:text-slate-700"
                      aria-label={
                        showConfirmPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
                        <FiEyeOff size={18} />
                      ) : (
                        <FiEye size={18} />
                      )}
                    </button>

                  </div>
                </div>

                {/* =====================================
                    TERMS
                ===================================== */}
                <div className="flex items-start gap-2">

                  <input
                    id="terms"
                    type="checkbox"
                    required
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />

                  <label
                    htmlFor="terms"
                    className="text-sm leading-5 text-slate-500"
                  >
                    I agree to Jobify's{" "}
                    <Link
                      to="/terms"
                      className="font-medium text-blue-600 hover:text-blue-700"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="/privacy"
                      className="font-medium text-blue-600 hover:text-blue-700"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </label>

                </div>

                {/* =====================================
                    SUBMIT
                ===================================== */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? "Creating account..."
                    : "Create Account"}
                </button>

              </form>

              {/* Login */}
              <div className="mt-7 border-t border-slate-200 pt-6 text-center">

                <p className="text-sm text-slate-500">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Sign in
                  </Link>
                </p>

              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}