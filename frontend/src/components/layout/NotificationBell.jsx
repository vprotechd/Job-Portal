import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiBell, FiCheck, FiMessageCircle } from "react-icons/fi";
import { toast } from "react-toastify";
import api from "../../services/api";

export default function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const previousUnread = useRef(null);
  const rootRef = useRef(null);

  const load = async (silent = true) => {
    try {
      const response = await api.get("/notifications?limit=12");
      const next = response.data?.notifications || [];
      const nextUnread = Number(response.data?.unreadCount || 0);
      if (silent && previousUnread.current !== null && nextUnread > previousUnread.current) {
        const latest = next.find((item) => !item.readAt);
        if (latest) toast.info(latest.title, { toastId: `notification-${latest._id}` });
      }
      previousUnread.current = nextUnread;
      setItems(next);
      setUnread(nextUnread);
    } catch {
      // Keep the header usable if notifications are temporarily unavailable.
    }
  };

  useEffect(() => {
    load(false);
    const timer = setInterval(() => load(true), 5000);
    const close = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => {
      clearInterval(timer);
      document.removeEventListener("mousedown", close);
    };
  }, []);

  const markRead = async (notification) => {
    try {
      if (!notification.readAt) {
        await api.patch(`/notifications/${notification._id}/read`);
        setUnread((value) => Math.max(0, value - 1));
        setItems((current) => current.map((item) => item._id === notification._id ? { ...item, readAt: new Date().toISOString() } : item));
      }
    } catch {}
    setOpen(false);
    if (notification.link) navigate(notification.link);
  };

  const markAll = async () => {
    try {
      await api.patch("/notifications/read-all");
      setItems((current) => current.map((item) => ({ ...item, readAt: item.readAt || new Date().toISOString() })));
      setUnread(0);
    } catch {
      toast.error("Unable to mark notifications as read.");
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button type="button" onClick={() => setOpen((value) => !value)} aria-label="Notifications" title="Notifications" className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-blue-300 hover:text-blue-600">
        <FiBell size={18} />
        {unread > 0 && <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold leading-4 text-white">{unread > 99 ? "99+" : unread}</span>}
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-[80] w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div><h3 className="font-bold text-slate-900">Notifications</h3><p className="text-xs text-slate-500">{unread} unread</p></div>
            {unread > 0 && <button type="button" onClick={markAll} className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600"><FiCheck /> Mark all read</button>}
          </div>
          <div className="max-h-[420px] overflow-y-auto">
            {loading ? <div className="p-6 text-sm text-slate-500">Loading...</div> : items.length === 0 ? <div className="p-8 text-center text-sm text-slate-500"><FiBell className="mx-auto mb-2" size={24} />No notifications yet.</div> : items.map((item) => (
              <button key={item._id} type="button" onClick={() => markRead(item)} className={`flex w-full gap-3 border-b border-slate-100 p-4 text-left hover:bg-slate-50 ${!item.readAt ? "bg-blue-50/60" : ""}`}>
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600"><FiMessageCircle size={17} /></span>
                <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-slate-900">{item.title}</span><span className="mt-1 block text-xs text-slate-600">{item.body}</span><span className="mt-1 block text-[11px] text-slate-400">{new Date(item.createdAt).toLocaleString()}</span></span>
                {!item.readAt && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-600" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
