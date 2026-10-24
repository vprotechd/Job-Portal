import { Link, useLocation } from "react-router-dom";
import { FiMessageCircle } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "./NotificationBell";

export default function UserQuickActions() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const protectedPage =
    /^(\/candidate|\/recruiter|\/admin|\/messages|\/dashboard)/.test(
      location.pathname
    );

  if (!isAuthenticated || !protectedPage) return null;

  return (
    <div className="flex items-center gap-2">
      {user?.role !== "admin" && (
        <Link
          to={
            user?.role === "recruiter"
              ? "/recruiter/messages"
              : "/messages"
          }
          aria-label="Open messages"
          title="Messages"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
        >
          <FiMessageCircle size={19} />
        </Link>
      )}

      <NotificationBell />
    </div>
  );
}
