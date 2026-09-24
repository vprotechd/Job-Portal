import { Link, useLocation } from "react-router-dom";
import { FiMessageCircle } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "./NotificationBell";

export default function UserQuickActions() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const protectedPage = /^(\/candidate|\/recruiter|\/admin|\/messages|\/dashboard)/.test(location.pathname);
  if (!isAuthenticated || !protectedPage) return null;

  return (
    <div className="fixed right-5 top-[84px] z-40 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/95 p-1.5 shadow-md backdrop-blur">
      <Link
        to={user?.role === "recruiter" ? "/recruiter/messages" : "/messages"}
        aria-label="Open messages"
        title="Messages"
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 hover:bg-blue-50 hover:text-blue-600"
      >
        <FiMessageCircle size={19} />
      </Link>
      <NotificationBell />
    </div>
  );
}
