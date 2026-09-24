import { useLocation, useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

const roots = new Set(["/", "/login", "/register"]);

export default function BackButton() {
  const navigate = useNavigate();
  const location = useLocation();
  if (roots.has(location.pathname)) return null;

  const fallback = location.pathname.startsWith("/recruiter")
    ? "/recruiter/dashboard"
    : location.pathname.startsWith("/admin")
    ? "/admin/dashboard"
    : location.pathname.startsWith("/candidate") || location.pathname.startsWith("/messages") || location.pathname === "/dashboard"
    ? "/candidate/dashboard"
    : "/";

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate(fallback);
  };

  return (
    <button type="button" onClick={handleBack} aria-label="Go back" title="Go back" className="fixed left-4 top-[84px] z-40 inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white/95 px-3 text-sm font-semibold text-slate-700 shadow-md backdrop-blur transition hover:border-blue-300 hover:text-blue-600">
      <FiArrowLeft size={17} />
      <span className="hidden sm:inline">Back</span>
    </button>
  );
}
