import { useEffect } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

/**
 * Professional, reusable "back" navigation pill.
 * Used on every page that has its own contextual back destination.
 * While one is mounted, the generic top-bar back button is hidden
 * (see index.css) so the page never shows two back buttons.
 */
export default function BackLink({ to, children = "Back", className = "" }) {
  useEffect(() => {
    document.body.setAttribute("data-page-back", "true");
    return () => document.body.removeAttribute("data-page-back");
  }, []);

  return (
    <Link
      to={to}
      className={`group inline-flex items-center gap-2.5 rounded-full border border-slate-200 bg-white py-1.5 pl-1.5 pr-4 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:border-blue-300 hover:bg-blue-50/60 hover:text-blue-700 hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${className}`}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-all duration-200 group-hover:bg-blue-600 group-hover:text-white">
        <FiArrowLeft
          size={15}
          className="transition-transform duration-200 group-hover:-translate-x-0.5"
        />
      </span>
      <span>{children}</span>
    </Link>
  );
}
