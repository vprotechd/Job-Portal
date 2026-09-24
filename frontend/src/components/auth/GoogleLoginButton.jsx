import { useEffect, useRef, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { toast } from "react-toastify";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function GoogleLoginButton() {
  const hostRef = useRef(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;
    const render = () => {
      if (!window.google?.accounts?.id || !hostRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async ({ credential }) => {
          try {
            const response = await api.post("/auth/google", { credential });
            const data = response.data;
            login(data.token, data.user);
            toast.success("Signed in with Google.");
            if (data.user?.role === "recruiter") navigate("/recruiter/dashboard");
            else if (data.user?.role === "admin") navigate("/admin/dashboard");
            else navigate("/candidate/dashboard");
          } catch (error) {
            toast.error(error.response?.data?.message || "Google login failed.");
          }
        },
      });
      hostRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(hostRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        width: 360,
      });
      setReady(true);
    };

    if (window.google?.accounts?.id) {
      render();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = render;
    document.head.appendChild(script);
    return () => { script.onload = null; };
  }, [clientId, login, navigate]);

  if (!clientId) {
    return (
      <button type="button" onClick={() => toast.error("Google login is not configured. Add VITE_GOOGLE_CLIENT_ID to the frontend environment.")} className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-5 py-3.5 font-semibold text-slate-700 hover:bg-slate-50">
        <FcGoogle size={21} /> Continue with Google
      </button>
    );
  }

  return <div ref={hostRef} className={`flex min-h-10 w-full justify-center overflow-hidden ${ready ? "" : "opacity-70"}`} />;
}
