import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiHeart, FiMapPin, FiSearch, FiTrash2 } from "react-icons/fi";
import api from "../../services/api";
import BackLink from "../../components/layout/BackLink";

export default function CandidateFavorites() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const ids = JSON.parse(localStorage.getItem("jobifySavedJobs") || "[]");
        if (!ids.length) return;
        const response = await api.get("/jobs");
        const all = response.data?.jobs || [];
        setJobs(all.filter(job => ids.includes(job._id)));
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const remove = (id) => {
    const ids = JSON.parse(localStorage.getItem("jobifySavedJobs") || "[]").filter(x => x !== id);
    localStorage.setItem("jobifySavedJobs", JSON.stringify(ids));
    setJobs(current => current.filter(job => job._id !== id));
  };

  return <div className="min-h-screen bg-slate-50"><main className="mx-auto max-w-5xl px-6 py-8 lg:px-8">
    <BackLink to="/candidate/dashboard" className="mb-6">Back to Dashboard</BackLink>
    <h1 className="text-3xl font-bold text-slate-950">Saved Jobs</h1><p className="mt-2 text-slate-500">Jobs you saved for later.</p>
    {loading ? <p className="mt-8 text-slate-500">Loading saved jobs...</p> : jobs.length === 0 ? <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm"><FiHeart className="mx-auto text-4xl text-slate-300"/><h2 className="mt-4 font-semibold text-slate-900">No saved jobs</h2><p className="mt-2 text-sm text-slate-500">Save interesting jobs from the job listing.</p><Link to="/jobs" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white"><FiSearch/> Find Jobs</Link></section> : <div className="mt-8 space-y-4">{jobs.map(job=><div key={job._id} className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row"><Link to={`/jobs/${job._id}`} className="min-w-0"><h2 className="font-bold text-slate-950">{job.title}</h2><p className="mt-1 text-sm text-blue-600">{job.company?.name || "Company"}</p><p className="mt-2 flex items-center gap-2 text-sm text-slate-500"><FiMapPin/>{job.location || "Location not specified"}</p></Link><button onClick={()=>remove(job._id)} className="inline-flex h-fit items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"><FiTrash2/> Remove</button></div>)}</div>}
  </main></div>;
}
