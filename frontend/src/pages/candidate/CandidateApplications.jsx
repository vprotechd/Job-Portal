import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiBriefcase, FiMessageCircle } from "react-icons/fi";
import api from "../../services/api";

export default function CandidateApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get("/applications/candidate/applications");
        setApplications(response.data?.applications || []);
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login", { replace: true });
          return;
        }
        setError(err.response?.data?.message || "Unable to load applications.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-5xl px-6 py-8 lg:px-8">
        <Link to="/candidate/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600"><FiArrowLeft /> Back to Dashboard</Link>
        <h1 className="text-3xl font-bold text-slate-950">My Applications</h1>
        <p className="mt-2 text-slate-500">Track applications submitted for jobs.</p>
        {error && <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        {loading ? <p className="mt-8 text-slate-500">Loading applications...</p> : applications.length === 0 ? <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-12 text-center"><FiBriefcase className="mx-auto text-3xl text-slate-300" /><p className="mt-4 font-semibold">No applications yet</p><Link to="/jobs" className="mt-4 inline-block font-semibold text-blue-600">Find Jobs</Link></div> : <div className="mt-8 space-y-4">{applications.map((application) => <div key={application._id} className="rounded-2xl border border-slate-200 bg-white p-6"><div className="flex flex-col justify-between gap-4 sm:flex-row"><div><h2 className="font-bold text-slate-950">{application.job?.title || "Job"}</h2><p className="mt-1 text-sm text-slate-500">{application.job?.location || ""}</p></div><span className="h-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold capitalize text-blue-700">{application.status || "pending"}</span></div><div className="mt-5 flex flex-wrap gap-3"><button type="button" onClick={() => navigate(`/messages/${application._id}`)} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"><FiMessageCircle /> Message Recruiter</button></div></div>)}</div>}
      </main>
    </div>
  );
}
