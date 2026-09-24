import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiMessageCircle, FiSend } from "react-icons/fi";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Chat({ applicationId }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [application, setApplication] = useState(null);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const load = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await api.get(`/messages/applications/${applicationId}`);
      setApplication(response.data?.application || null);
      setMessages(response.data?.messages || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load messages.");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const timer = setInterval(() => load(true), 4000);
    return () => clearInterval(timer);
  }, [applicationId]);

  const send = async (e) => {
    e.preventDefault();
    const value = body.trim();
    if (!value || sending) return;
    setSending(true);
    try {
      const response = await api.post(`/messages/applications/${applicationId}`, { body: value });
      setMessages((current) => [...current, response.data.message]);
      setBody("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to send message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 lg:px-8">
      <Link to={user?.role === "recruiter" ? "/recruiter/applications/view" : "/candidate/applications"} className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600"><FiArrowLeft /> Back to Applications</Link>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-950">Messages</h1>
        <p className="mt-1 text-sm text-slate-500">{application?.job?.title || "Application"} · {user?.role === "recruiter" ? application?.candidate?.name : application?.recruiter?.name}</p>
      </div>
      {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="max-h-[55vh] min-h-[320px] space-y-3 overflow-y-auto bg-slate-50 p-5">
          {loading ? <p className="text-center text-sm text-slate-500">Loading conversation...</p> : messages.length === 0 ? <div className="flex min-h-[280px] flex-col items-center justify-center text-center text-slate-500"><FiMessageCircle size={34} /><p className="mt-3 font-semibold">No messages yet</p><p className="mt-1 text-sm">Send a message to start the conversation.</p></div> : messages.map((message) => {
            const mine = String(message.sender?._id || message.sender) === String(user?.id || user?._id);
            return <div key={message._id} className={`flex ${mine ? "justify-end" : "justify-start"}`}><div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm ${mine ? "bg-blue-600 text-white" : "bg-white text-slate-800 border border-slate-200"}`}><p className="whitespace-pre-wrap break-words">{message.body}</p><p className={`mt-1 text-[11px] ${mine ? "text-blue-100" : "text-slate-400"}`}>{new Date(message.createdAt).toLocaleString()}</p></div></div>;
          })}
        </div>
        <form onSubmit={send} className="flex gap-3 border-t border-slate-200 bg-white p-4">
          <textarea value={body} onChange={(e) => setBody(e.target.value)} maxLength={5000} rows={2} placeholder="Write a message..." className="min-h-[52px] flex-1 resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
          <button disabled={sending || !body.trim()} className="inline-flex shrink-0 items-center gap-2 self-end rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white disabled:opacity-50"><FiSend /> {sending ? "Sending" : "Send"}</button>
        </form>
      </div>
    </div>
  );
}

export default function Messages() {
  const { applicationId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (applicationId) return;
    api.get("/messages/conversations").then((r) => setConversations(r.data?.conversations || [])).catch(() => setConversations([])).finally(() => setLoading(false));
  }, [applicationId, location.key]);

  if (applicationId) return <Chat applicationId={applicationId} />;
  return <div className="mx-auto max-w-4xl px-6 py-8 lg:px-8"><h1 className="text-3xl font-bold text-slate-950">Messages</h1><p className="mt-2 text-slate-500">Conversations connected to your job applications.</p><div className="mt-7 space-y-3">{loading ? <p className="text-slate-500">Loading...</p> : conversations.length === 0 ? <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center"><FiMessageCircle className="mx-auto text-slate-300" size={36}/><p className="mt-4 font-semibold">No conversations yet</p><p className="mt-1 text-sm text-slate-500">{user?.role === "recruiter" ? "Unlock a candidate CV to access their conversation." : "Apply for a job to start messaging the recruiter."}</p></div> : conversations.map((c) => { const other = user?.role === "recruiter" ? c.candidate : c.recruiter; return <button key={c._id} onClick={() => navigate(user?.role === "recruiter" ? `/recruiter/messages/${c._id}` : `/messages/${c._id}`)} className="w-full rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm hover:border-blue-300"><div className="flex items-center justify-between gap-4"><div><h2 className="font-bold text-slate-950">{other?.name || "User"}</h2><p className="mt-1 text-sm text-slate-500">{c.job?.title || "Job"}</p>{c.lastMessage && <p className="mt-2 line-clamp-1 text-sm text-slate-600">{c.lastMessage.body}</p>}</div>{c.unreadCount > 0 && <span className="rounded-full bg-blue-600 px-2.5 py-1 text-xs font-bold text-white">{c.unreadCount}</span>}</div></button>; })}</div></div>;
}
