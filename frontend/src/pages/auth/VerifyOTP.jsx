import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiMail,
  FiRefreshCw,
} from "react-icons/fi";

export default function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(60);

  const inputRefs = useRef([]);

  // If user directly opens /verify-otp without coming from Register
  useEffect(() => {
    if (!email) {
      navigate("/register", { replace: true });
    }
  }, [email, navigate]);

  // Countdown
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const handleChange = (value, index) => {
    // Allow only numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);

    setOtp(newOtp);
    setError("");
    setMessage("");

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();

    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pastedData) return;

    const newOtp = [...otp];

    pastedData.split("").forEach((digit, index) => {
      newOtp[index] = digit;
    });

    setOtp(newOtp);

    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }

    if (!email) {
      setError("Email information is missing. Please register again.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await api.post("/auth/verify-otp", { email, otp: otpValue });
      const data = response.data;
      if (!data.success) throw new Error(data.message || "OTP verification failed.");

      setMessage(data.message || "Email verified successfully.");

      setTimeout(() => {
        navigate("/login", {
          state: {
            email,
            message: "Account verified successfully. Please login.",
          },
        });
      }, 1200);
    } catch (err) {
      console.error("OTP verification error:", err);
      setError(err.message || "Unable to verify OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending) return;

    setResending(true);
    setError("");
    setMessage("");

    try {
      const response = await api.post("/auth/resend-otp", { email });
      const data = response.data;
      if (!data.success) throw new Error(data.message || "Unable to resend OTP.");

      setMessage(data.message || "A new OTP has been sent.");
      setCountdown(60);
      setOtp(["", "", "", "", "", ""]);

      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } catch (err) {
      console.error("Resend OTP error:", err);
      setError(err.message || "Unable to resend OTP.");
    } finally {
      setResending(false);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* Left Side */}
        <div className="hidden bg-slate-950 lg:flex lg:flex-col lg:justify-between lg:p-12">

          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold text-white"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
              <span className="text-sm">J</span>
            </div>

            Jobify
          </Link>

          <div className="max-w-lg">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">
              Verify your account
            </p>

            <h1 className="mt-4 text-4xl font-bold leading-tight text-white">
              One more step to get started.
            </h1>

            <p className="mt-6 text-lg leading-8 text-slate-400">
              We have sent a verification code to your email address.
              Verify your email to activate your Jobify account.
            </p>
          </div>

          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Jobify
          </p>
        </div>

        {/* Right Side */}
        <div className="flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">

            <Link
              to="/register"
              className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
            >
              <FiArrowLeft />
              Back to Register
            </Link>

            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">

              {/* Icon */}
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <FiMail size={25} />
              </div>

              <div className="mt-6">
                <h2 className="text-2xl font-bold text-slate-950">
                  Verify your email
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Enter the 6-digit verification code sent to
                </p>

                <p className="mt-1 break-all text-sm font-semibold text-slate-900">
                  {email}
                </p>
              </div>

              {/* Success */}
              {message && (
                <div className="mt-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                  <FiCheckCircle className="mt-0.5 shrink-0" />
                  <span>{message}</span>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-8">

                {/* OTP Inputs */}
                <div className="flex justify-between gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) =>
                        handleChange(e.target.value, index)
                      }
                      onKeyDown={(e) =>
                        handleKeyDown(e, index)
                      }
                      onPaste={handlePaste}
                      className="h-14 w-12 rounded-xl border border-slate-300 bg-white text-center text-xl font-bold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:h-16 sm:w-14"
                    />
                  ))}
                </div>

                {/* Verify */}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <FiRefreshCw className="animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Email"
                  )}
                </button>
              </form>

              {/* Resend */}
              <div className="mt-7 text-center">

                <p className="text-sm text-slate-500">
                  Didn't receive the code?
                </p>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={countdown > 0 || resending}
                  className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700 disabled:cursor-not-allowed disabled:text-slate-400"
                >
                  <FiRefreshCw
                    className={resending ? "animate-spin" : ""}
                  />

                  {resending
                    ? "Sending..."
                    : countdown > 0
                    ? `Resend OTP in ${countdown}s`
                    : "Resend OTP"}
                </button>

              </div>

              {/* Login */}
              <div className="mt-7 border-t border-slate-200 pt-6 text-center">
                <p className="text-sm text-slate-500">
                  Already verified?{" "}
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