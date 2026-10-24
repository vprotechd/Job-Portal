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
    : location.pathname.startsWith("/candidate") ||
      location.pathname.startsWith("/messages") ||
      location.pathname === "/dashboard"
    ? "/candidate/dashboard"
    : "/";

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      aria-label="Go back"
      title="Go back"
      className="global-back-btn group inline-flex items-center gap-2.5 rounded-full border border-slate-200 bg-white py-1.5 pl-1.5 pr-4 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:border-blue-300 hover:bg-blue-50/60 hover:text-blue-700 hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-all duration-200 group-hover:bg-blue-600 group-hover:text-white">
        <FiArrowLeft
          size={15}
          className="transition-transform duration-200 group-hover:-translate-x-0.5"
        />
      </span>
      <span>Back</span>
    </button>
  );
}
