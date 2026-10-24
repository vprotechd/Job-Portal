import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import {
  FiBriefcase,
  FiCalendar,
  FiClock,
  FiDollarSign,
  FiHeart,
  FiMapPin,
  FiShare2,
  FiUsers,
} from "react-icons/fi";
import BackLink from "../../components/layout/BackLink";

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(() => { try { return JSON.parse(localStorage.getItem("jobifySavedJobs") || "[]").includes(id); } catch { return false; } });
  const [applyOpen, setApplyOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [applying, setApplying] = useState(false);
  const [applyMessage, setApplyMessage] = useState("");

  useEffect(() => {
    if (id) {
      fetchJob();
    }
  }, [id]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/jobs/${id}`);
      const data = response.data;
      if (!data?.success) throw new Error(data?.message || "Job not found");
      setJob(data.job);
    } catch (err) {
      console.error("Fetch job error:", err);
      setError("Unable to load this job.");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("Job link copied.");
    } catch {
      console.error("Unable to copy job link");
    }
  };

  const handleApply = () => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login", { state: { redirectTo: `/jobs/${id}` } }); return; }
    setApplyMessage("");
    setApplyOpen(true);
  };

  const submitApplication = async (event) => {
    event.preventDefault();
    try {
      setApplying(true);
      setApplyMessage("");
      const response = await api.post(`/applications/jobs/${id}/apply`, { coverLetter });
      if (!response.data?.success) throw new Error(response.data?.message || "Unable to apply.");
      setApplyMessage("Application submitted successfully.");
      setTimeout(() => { setApplyOpen(false); navigate("/candidate/applications"); }, 900);
    } catch (error) {
      if ([401, 403].includes(error.response?.status)) { navigate("/login"); return; }
      setApplyMessage(error.response?.data?.message || error.message || "Unable to submit application.");
    } finally { setApplying(false); }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">
          Loading job details...
        </p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <FiBriefcase className="mx-auto text-4xl text-slate-300" />

          <h2 className="mt-5 text-xl font-bold text-slate-950">
            Job not found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            This job may have been removed or is no longer available.
          </p>

          <Link
            to="/jobs"
            className="mt-6 inline-flex rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Browse Jobs
          </Link>
        </div>
      </div>
    );
  }

  const companyName =
    job.company?.name ||
    job.companyName ||
    "Company";

  const companyId =
    job.company?._id ||
    job.company?.id ||
    job.companyId;

  const companyLogo =
    job.company?.logo ||
    job.companyLogo;

  const jobType =
    job.jobType ||
    job.type;

  const workMode =
    job.workMode ||
    job.mode;

  const experience =
    job.experience ||
    job.experienceLevel;

  const salary =
    job.salary ||
    job.salaryRange;

  const applicants =
    job.applicantsCount ??
    job.applicationCount ??
    0;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8">

          <BackLink to="/jobs">Back to jobs</BackLink>

          <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-start">

            {/* Company Logo */}
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-blue-50 text-2xl font-bold text-blue-600">

              {companyLogo ? (
                <img
                  src={companyLogo}
                  alt={companyName}
                  className="h-full w-full object-cover"
                />
              ) : (
                companyName.charAt(0).toUpperCase()
              )}

            </div>

            <div className="flex-1">

              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                <div>

                  <h1 className="text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
                    {job.title}
                  </h1>

                  {companyId ? (
                    <Link
                      to={`/companies/${companyId}`}
                      className="mt-3 inline-block font-semibold text-blue-600 hover:text-blue-700"
                    >
                      {companyName}
                    </Link>
                  ) : (
                    <p className="mt-3 font-semibold text-blue-600">
                      {companyName}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-3 text-sm text-slate-500">

                    {job.location && (
                      <span className="flex items-center gap-2">
                        <FiMapPin />
                        {job.location}
                      </span>
                    )}

                    {jobType && (
                      <span className="flex items-center gap-2">
                        <FiBriefcase />
                        {jobType}
                      </span>
                    )}

                    {experience && (
                      <span className="flex items-center gap-2">
                        <FiClock />
                        {experience}
                      </span>
                    )}

                    {salary && (
                      <span className="flex items-center gap-2">
                        <FiDollarSign />
                        {salary}
                      </span>
                    )}

                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">

                  <button
                    onClick={() => {
                      const current = JSON.parse(localStorage.getItem("jobifySavedJobs") || "[]");
                      const next = current.includes(id) ? current.filter((jobId) => jobId !== id) : [...current, id];
                      localStorage.setItem("jobifySavedJobs", JSON.stringify(next));
                      setSaved(next.includes(id));
                    }}
                    className={`flex h-11 w-11 items-center justify-center rounded-lg border transition ${
                      saved
                        ? "border-blue-300 bg-blue-50 text-blue-600"
                        : "border-slate-300 text-slate-600 hover:border-blue-300 hover:text-blue-600"
                    }`}
                    title="Save job"
                  >
                    <FiHeart className={saved ? "fill-current" : ""} />
                  </button>

                  <button
                    onClick={handleShare}
                    className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-300 text-slate-600 transition hover:border-blue-300 hover:text-blue-600"
                    title="Share job"
                  >
                    <FiShare2 />
                  </button>

                </div>

              </div>

              <div className="mt-5 flex flex-wrap gap-5 text-sm text-slate-500">

                {job.createdAt && (
                  <span className="flex items-center gap-2">
                    <FiCalendar />
                    Posted{" "}
                    {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                )}

                <span className="flex items-center gap-2">
                  <FiUsers />
                  {applicants} applicants
                </span>

              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Main */}
      <section className="py-10">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[1fr_360px]">

          {/* Left */}
          <main className="space-y-8">

            {/* Description */}
            {job.description && (
              <section className="rounded-2xl border border-slate-200 bg-white p-8">
                <h2 className="text-2xl font-bold text-slate-950">
                  Job Description
                </h2>

                <div className="mt-5 whitespace-pre-line leading-8 text-slate-600">
                  {job.description}
                </div>
              </section>
            )}

            {/* Responsibilities */}
            {job.responsibilities?.length > 0 && (
              <section className="rounded-2xl border border-slate-200 bg-white p-8">

                <h2 className="text-2xl font-bold text-slate-950">
                  Responsibilities
                </h2>

                <ul className="mt-5 space-y-4">

                  {job.responsibilities.map((item, index) => (
                    <li
                      key={`${item}-${index}`}
                      className="flex gap-3 leading-7 text-slate-600"
                    >
                      <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />

                      {item}
                    </li>
                  ))}

                </ul>
              </section>
            )}

            {/* Requirements */}
            {job.requirements?.length > 0 && (
              <section className="rounded-2xl border border-slate-200 bg-white p-8">

                <h2 className="text-2xl font-bold text-slate-950">
                  Requirements
                </h2>

                <ul className="mt-5 space-y-4">

                  {job.requirements.map((item, index) => (
                    <li
                      key={`${item}-${index}`}
                      className="flex gap-3 leading-7 text-slate-600"
                    >
                      <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />

                      {item}
                    </li>
                  ))}

                </ul>
              </section>
            )}

            {/* Skills */}
            {job.skills?.length > 0 && (
              <section className="rounded-2xl border border-slate-200 bg-white p-8">

                <h2 className="text-2xl font-bold text-slate-950">
                  Skills
                </h2>

                <div className="mt-5 flex flex-wrap gap-3">

                  {job.skills.map((skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                      className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700"
                    >
                      {skill}
                    </span>
                  ))}

                </div>
              </section>
            )}

          </main>

          {/* Sidebar */}
          <aside>

            <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <h2 className="text-xl font-bold text-slate-950">
                Apply for this job
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Submit your profile and resume to apply for this position.
              </p>

              <button
                onClick={handleApply}
                className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-700"
              >
                Apply Now
              </button>

              <button
                onClick={() => setSaved(!saved)}
                className="mt-3 w-full rounded-xl border border-slate-300 px-5 py-3.5 font-semibold text-slate-700 transition hover:border-blue-600 hover:text-blue-600"
              >
                {saved ? "Saved" : "Save Job"}
              </button>

              <div className="mt-7 border-t border-slate-200 pt-6">

                <h3 className="font-semibold text-slate-950">
                  Job overview
                </h3>

                <div className="mt-5 space-y-5">

                  {jobType && (
                    <div className="flex gap-3">
                      <FiBriefcase className="mt-1 text-blue-600" />

                      <div>
                        <p className="text-xs text-slate-400">
                          Job Type
                        </p>

                        <p className="mt-1 text-sm font-medium text-slate-700">
                          {jobType}
                        </p>
                      </div>
                    </div>
                  )}

                  {job.location && (
                    <div className="flex gap-3">
                      <FiMapPin className="mt-1 text-blue-600" />

                      <div>
                        <p className="text-xs text-slate-400">
                          Location
                        </p>

                        <p className="mt-1 text-sm font-medium text-slate-700">
                          {job.location}
                        </p>
                      </div>
                    </div>
                  )}

                  {salary && (
                    <div className="flex gap-3">
                      <FiDollarSign className="mt-1 text-blue-600" />

                      <div>
                        <p className="text-xs text-slate-400">
                          Salary
                        </p>

                        <p className="mt-1 text-sm font-medium text-slate-700">
                          {salary}
                        </p>
                      </div>
                    </div>
                  )}

                  {experience && (
                    <div className="flex gap-3">
                      <FiClock className="mt-1 text-blue-600" />

                      <div>
                        <p className="text-xs text-slate-400">
                          Experience
                        </p>

                        <p className="mt-1 text-sm font-medium text-slate-700">
                          {experience}
                        </p>
                      </div>
                    </div>
                  )}

                  {workMode && (
                    <div className="flex gap-3">
                      <FiBriefcase className="mt-1 text-blue-600" />

                      <div>
                        <p className="text-xs text-slate-400">
                          Work Mode
                        </p>

                        <p className="mt-1 text-sm font-medium text-slate-700">
                          {workMode}
                        </p>
                      </div>
                    </div>
                  )}

                </div>
              </div>

            </div>
          </aside>

        </div>
      </section>
      {applyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <form onSubmit={submitApplication} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div><h2 className="text-xl font-bold text-slate-950">Apply for {job.title}</h2><p className="mt-1 text-sm text-slate-500">Your saved profile and resume will be submitted.</p></div>
              <button type="button" onClick={()=>setApplyOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <label className="mt-6 block text-sm font-semibold text-slate-800">Cover Letter <span className="font-normal text-slate-400">(optional)</span></label>
            <textarea value={coverLetter} onChange={e=>setCoverLetter(e.target.value)} rows={7} maxLength={3000} placeholder="Tell the recruiter why you are a good fit..." className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"/>
            {applyMessage && <div className={`mt-3 rounded-lg p-3 text-sm ${applyMessage.toLowerCase().includes("success") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{applyMessage}</div>}
            <div className="mt-5 flex justify-end gap-3"><button type="button" onClick={()=>setApplyOpen(false)} className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold">Cancel</button><button disabled={applying} className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{applying?"Submitting...":"Submit Application"}</button></div>
          </form>
        </div>
      )}

    </div>
  );
}