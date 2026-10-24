import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

import {
  FiBriefcase,
  FiCalendar,
  FiCheck,
  FiDownload,
  FiClock,
  FiFileText,
  FiMail,
  FiRefreshCw,
  FiSearch,
  FiUser,
  FiUsers,
  FiX,
} from "react-icons/fi";
import BackLink from "../../components/layout/BackLink";

const STATUS_OPTIONS = ["pending", "reviewing", "shortlisted", "interview", "accepted", "rejected"];

export default function RecruiterApplications() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [jobFilter, setJobFilter] = useState("all");

  const [selectedApplication, setSelectedApplication] =
    useState(null);

  const [updating, setUpdating] = useState(false);

  const [interviewDate, setInterviewDate] = useState("");
  const [notes, setNotes] = useState("");

  const [resumeAccess, setResumeAccess] = useState({
    freeDownloadsTotal: 10,
    freeDownloadsUsed: 0,
    freeDownloadsRemaining: 10,
    credits: 0,
  });

  const [downloadingResume, setDownloadingResume] = useState("");

  // =====================================================
  // AUTHENTICATION
  // =====================================================

  const getToken = () => {
    return localStorage.getItem("token");
  };

  // =====================================================
  // LOAD APPLICATIONS
  // =====================================================

  const fetchApplications = async () => {
    const token = getToken();

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.get("/applications/recruiter/applications");
      const data = response.data || {};

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login", {
          replace: true,
        });

        return;
      }

      if (!data.success) {
        throw new Error(
          data.message ||
            "Unable to load applications."
        );
      }

      setApplications(
        Array.isArray(data.applications)
          ? data.applications
          : []
      );

      if (data.resumeAccess) {
        setResumeAccess((previous) => ({
          ...previous,
          ...data.resumeAccess,
        }));
      }
    } catch (err) {
      console.error(
        "Recruiter applications error:",
        err
      );

      setError(
        err.message ||
          "Unable to load applications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // =====================================================
  // UNIQUE JOBS
  // =====================================================

  const jobs = useMemo(() => {
    const map = new Map();

    applications.forEach((application) => {
      const job = application.job;

      if (job?._id) {
        map.set(job._id, job.title);
      }
    });

    return Array.from(map.entries()).map(
      ([id, title]) => ({
        id,
        title,
      })
    );
  }, [applications]);

  // =====================================================
  // FILTER APPLICATIONS
  // =====================================================

  const filteredApplications = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return applications.filter(
      (application) => {
        const candidate =
          application.candidate;

        const job =
          application.job;

        const candidateName =
          candidate?.name || "";

        const candidateEmail =
          candidate?.email || "";

        const jobTitle =
          job?.title || "";

        const matchesSearch =
          !searchValue ||
          candidateName
            .toLowerCase()
            .includes(searchValue) ||
          candidateEmail
            .toLowerCase()
            .includes(searchValue) ||
          jobTitle
            .toLowerCase()
            .includes(searchValue);

        const matchesStatus =
          statusFilter === "all" ||
          application.status === statusFilter;

        const matchesJob =
          jobFilter === "all" ||
          job?._id === jobFilter;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesJob
        );
      }
    );
  }, [
    applications,
    search,
    statusFilter,
    jobFilter,
  ]);

  // =====================================================
  // STATUS COLOR
  // =====================================================

  const getStatusClasses = (status) => {
    switch (
      status?.toLowerCase()
    ) {
      case "reviewing":
        return "bg-blue-50 text-blue-700";

      case "interview":
      case "interview scheduled":
        return "bg-purple-50 text-purple-700";

      case "accepted":
        return "bg-green-50 text-green-700";

      case "rejected":
        return "bg-red-50 text-red-700";

      default:
        return "bg-amber-50 text-amber-700";
    }
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "—";
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // OPEN APPLICATION
  // =====================================================

  const openApplication = (
    application
  ) => {
    setSelectedApplication(
      application
    );

    setInterviewDate(
      application.interviewDate
        ? new Date(
            application.interviewDate
          )
            .toISOString()
            .slice(0, 16)
        : ""
    );

    setNotes(
      application.notes || ""
    );
  };

  // =====================================================
  // CLOSE MODAL
  // =====================================================

  const closeApplication = () => {
    if (updating) return;

    setSelectedApplication(null);
    setInterviewDate("");
    setNotes("");
  };

  // =====================================================
  // UPDATE STATUS
  // =====================================================

  const updateStatus = async (
    status
  ) => {
    if (
      !selectedApplication?._id
    ) {
      return;
    }

    const token = getToken();

    if (!token) {
      navigate("/login", {
        replace: true,
      });
      return;
    }

    try {
      setUpdating(true);
      setError("");

      const response = await api.patch(
        `/applications/recruiter/applications/${selectedApplication._id}/status`,
        { status, interviewDate: interviewDate || null, notes }
      );
      const data = response.data || {};

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        localStorage.removeItem(
          "token"
        );
        localStorage.removeItem(
          "user"
        );

        navigate("/login", {
          replace: true,
        });

        return;
      }

      if (!data.success) {
        throw new Error(
          data.message ||
            "Unable to update application."
        );
      }

      // Refresh list
      await fetchApplications();

      // Close modal
      closeApplication();
    } catch (err) {
      console.error(
        "Update application error:",
        err
      );

      setError(
        err.message ||
          "Unable to update application."
      );
    } finally {
      setUpdating(false);
    }
  };

  // =====================================================
  // DOWNLOAD RESUME
  // =====================================================

  const downloadResume = async (application) => {
    const applicationId = application?._id;
    if (!applicationId || downloadingResume) return;

    const token = getToken();
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      setDownloadingResume(applicationId);
      setError("");

      const response = await api.get(
        `/applications/recruiter/applications/${applicationId}/resume/download`,
        { responseType: "blob" }
      );

      if (response.status !== 200) {
        throw new Error("Unable to download resume.");
      }

      const blob = response.data;
      const contentType = response.headers?.["content-type"] || "";

      if (contentType.includes("application/json")) {
        const text = await blob.text();
        const data = JSON.parse(text);
        throw new Error(data.message || "Unable to download resume.");
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${(application.candidate?.name || "candidate")
        .replace(/[^a-zA-Z0-9_-]+/g, "-")}-resume`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      const headers = response.headers || {};
      const remaining = Number(headers["x-free-downloads-remaining"]);
      const credits = Number(headers["x-resume-credits"]);

      setResumeAccess((previous) => ({
        ...previous,
        freeDownloadsRemaining: Number.isFinite(remaining)
          ? remaining
          : previous.freeDownloadsRemaining,
        freeDownloadsUsed: Number.isFinite(remaining)
          ? Math.max(0, previous.freeDownloadsTotal - remaining)
          : previous.freeDownloadsUsed,
        credits: Number.isFinite(credits) ? credits : previous.credits,
      }));

      setApplications((previous) =>
        previous.map((item) =>
          item._id === applicationId
            ? { ...item, resumeDownloaded: true, resumeDownloadedAt: new Date().toISOString() }
            : item
        )
      );
    } catch (err) {
      let message = err.response?.data?.message || err.message || "Unable to download resume.";

      // Axios returns an error body as a Blob when responseType is blob.
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const data = JSON.parse(text);
          message = data.message || message;
          if (data.freeDownloadsRemaining !== undefined || data.credits !== undefined) {
            setResumeAccess((previous) => ({
              ...previous,
              freeDownloadsRemaining: Number(data.freeDownloadsRemaining ?? previous.freeDownloadsRemaining),
              credits: Number(data.credits ?? previous.credits),
            }));
          }
        } catch {
          // Keep the original error message when the response is not JSON.
        }
      }

      console.error("Resume download error:", err);
      setError(message);
    } finally {
      setDownloadingResume("");
    }
  };

  // =====================================================
  // STATISTICS
  // =====================================================

  const stats = useMemo(() => {
    return {
      total: applications.length,

      applied:
        applications.filter((a) => a.status === "pending").length,

      shortlisted:
        applications.filter((a) => a.status === "reviewing").length,

      interviews:
        applications.filter(
          (a) =>
            a.status ===
              "interview" ||
            a.status ===
              "interview scheduled"
        ).length,

      hired:
        applications.filter((a) => a.status === "accepted").length,
    };
  }, [applications]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading applications...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

          <div>
            <BackLink to="/recruiter/dashboard" className="mb-3">Back to Dashboard</BackLink>

            <p className="text-sm font-semibold text-blue-600">
              Recruiter
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-950">
              Applications
            </h1>

            <p className="mt-2 text-slate-500">
              Review and manage candidates who
              applied to your jobs.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchApplications}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-600"
          >
            <FiRefreshCw size={17} />
            Refresh
          </button>
        </div>

        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* ================================================= */}
        {/* STATS */}
        {/* ================================================= */}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

          <StatCard
            title="Total"
            value={stats.total}
            icon={<FiUsers />}
          />

          <StatCard
            title="Applied"
            value={stats.applied}
            icon={<FiFileText />}
          />

          <StatCard
            title="Shortlisted"
            value={stats.shortlisted}
            icon={<FiCheck />}
          />

          <StatCard
            title="Interviews"
            value={stats.interviews}
            icon={<FiCalendar />}
          />

          <StatCard
            title="Hired"
            value={stats.hired}
            icon={<FiCheck />}
          />

        </div>

        {/* ================================================= */}
        {/* RESUME ACCESS */}
        {/* ================================================= */}

        <section className="mb-6 rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-bold text-slate-950">Candidate Resume Access</p>
              <p className="mt-1 text-sm text-slate-600">
                Your first 10 candidate resume downloads are free. After that, 1 credit is used for each new candidate resume.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="rounded-xl bg-white px-4 py-3 shadow-sm">
                <p className="text-xs text-slate-500">Free remaining</p>
                <p className="mt-1 text-lg font-bold text-blue-600">{resumeAccess.freeDownloadsRemaining}/10</p>
              </div>
              <div className="rounded-xl bg-white px-4 py-3 shadow-sm">
                <p className="text-xs text-slate-500">Credits</p>
                <p className="mt-1 text-lg font-bold text-slate-950">{resumeAccess.credits}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* FILTERS */}
        {/* ================================================= */}

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="grid gap-4 md:grid-cols-3">

            {/* SEARCH */}

            <div className="relative">
              <FiSearch
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search candidate or job..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
              />
            </div>

            {/* STATUS */}

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="all">
                All Statuses
              </option>

              {STATUS_OPTIONS.map(
                (status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {formatStatus(
                      status
                    )}
                  </option>
                )
              )}
            </select>

            {/* JOB */}

            <select
              value={jobFilter}
              onChange={(e) =>
                setJobFilter(
                  e.target.value
                )
              }
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="all">
                All Jobs
              </option>

              {jobs.map((job) => (
                <option
                  key={job.id}
                  value={job.id}
                >
                  {job.title}
                </option>
              ))}
            </select>

          </div>
        </section>

        {/* ================================================= */}
        {/* APPLICATION LIST */}
        {/* ================================================= */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="font-bold text-slate-950">
              Candidate Applications
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {filteredApplications.length}{" "}
              application
              {filteredApplications.length !==
              1
                ? "s"
                : ""}{" "}
              found
            </p>
          </div>

          {filteredApplications.length ===
          0 ? (
            <div className="px-6 py-16 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <FiFileText size={24} />
              </div>

              <h3 className="mt-4 font-semibold text-slate-800">
                No applications found
              </h3>

              <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
                Applications matching your
                filters will appear here.
              </p>

            </div>
          ) : (
            <div className="divide-y divide-slate-100">

              {filteredApplications.map(
                (application) => {

                  const candidate =
                    application.candidate;

                  const job =
                    application.job;

                  const name =
                    candidate?.name ||
                    "Candidate";

                  return (
                    <button
                      key={
                        application._id
                      }
                      type="button"
                      onClick={() =>
                        openApplication(
                          application
                        )
                      }
                      className="group flex w-full flex-col gap-4 px-6 py-5 text-left transition hover:bg-slate-50 md:flex-row md:items-center md:justify-between"
                    >

                      {/* Candidate */}

                      <div className="flex min-w-0 items-center gap-4">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 font-bold text-blue-600">
                          {name
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0">

                          <h3 className="truncate font-semibold text-slate-900">
                            {name}
                          </h3>

                          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">

                            {candidate?.email && (
                              <span className="flex items-center gap-1">
                                <FiMail size={14} />
                                {candidate.email}
                              </span>
                            )}

                            {job?.title && (
                              <span className="flex items-center gap-1">
                                <FiBriefcase size={14} />
                                {job.title}
                              </span>
                            )}

                          </div>

                        </div>
                      </div>

                      {/* Application info */}

                      <div className="flex shrink-0 flex-wrap items-center gap-4">

                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <FiClock size={15} />
                          {formatDate(
                            application.createdAt
                          )}
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                            application.status
                          )}`}
                        >
                          {formatStatus(
                            application.status
                          )}
                        </span>

                      </div>

                    </button>
                  );
                }
              )}

            </div>
          )}

        </section>
      </main>

      {/* ================================================= */}
      {/* APPLICATION MODAL */}
      {/* ================================================= */}

      {selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">

          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* HEADER */}

            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white px-6 py-5">

              <div>
                <p className="text-sm font-semibold text-blue-600">
                  Application Details
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-950">
                  {selectedApplication
                    .candidate?.name ||
                    "Candidate"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedApplication
                    .job?.title ||
                    "Job"}
                </p>
              </div>

              <button
                type="button"
                onClick={
                  closeApplication
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <FiX size={20} />
              </button>

            </div>

            <div className="space-y-6 p-6">

              {/* CANDIDATE INFO */}

              <div className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5 md:grid-cols-2">

                <InfoItem
                  icon={<FiUser />}
                  label="Candidate"
                  value={
                    selectedApplication
                      .candidate?.name ||
                    "—"
                  }
                />

                <InfoItem
                  icon={<FiMail />}
                  label="Email"
                  value={
                    selectedApplication
                      .candidate?.email ||
                    "—"
                  }
                />

                <InfoItem
                  icon={<FiBriefcase />}
                  label="Job"
                  value={
                    selectedApplication
                      .job?.title ||
                    "—"
                  }
                />

                <InfoItem
                  icon={<FiClock />}
                  label="Applied"
                  value={formatDate(
                    selectedApplication.createdAt
                  )}
                />

              </div>

              {/* RESUME */}

              {selectedApplication
                .candidate
                ?.resume ||
              selectedApplication.resume ? (
                <div className="rounded-xl border border-slate-200 p-5">

                  <div className="flex items-center justify-between gap-4">

                    <div>
                      <h3 className="font-semibold text-slate-900">
                        Resume
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Candidate resume. Downloads use your free allowance first, then one credit per new candidate resume.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => downloadResume(selectedApplication)}
                      disabled={downloadingResume === selectedApplication._id}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {downloadingResume === selectedApplication._id ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      ) : (
                        <FiDownload />
                      )}
                      {downloadingResume === selectedApplication._id ? "Downloading..." : selectedApplication.resumeDownloaded ? "Download Again" : "Download Resume"}
                    </button>

                  </div>

                </div>
              ) : null}

              {/* COVER LETTER */}

              <div className="rounded-xl border border-slate-200 p-5">

                <h3 className="font-semibold text-slate-900">
                  Cover Letter
                </h3>

                <div className="mt-3 rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                  {selectedApplication
                    .coverLetter ||
                    "No cover letter provided."}
                </div>

              </div>

              {/* STATUS */}

              <div className="rounded-xl border border-slate-200 p-5">

                <h3 className="font-semibold text-slate-900">
                  Application Status
                </h3>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

                  {STATUS_OPTIONS.map(
                    (status) => (
                      <button
                        key={status}
                        type="button"
                        disabled={updating}
                        onClick={() =>
                          updateStatus(
                            status
                          )
                        }
                        className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                          selectedApplication.status ===
                          status
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-600"
                        } disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        {formatStatus(
                          status
                        )}
                      </button>
                    )
                  )}

                </div>

              </div>

              {/* INTERVIEW */}

              <div className="rounded-xl border border-slate-200 p-5">

                <h3 className="font-semibold text-slate-900">
                  Interview
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Set an interview date and time.
                </p>

                <input
                  type="datetime-local"
                  value={interviewDate}
                  onChange={(e) =>
                    setInterviewDate(
                      e.target.value
                    )
                  }
                  className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />

              </div>

              {/* NOTES */}

              <div className="rounded-xl border border-slate-200 p-5">

                <h3 className="font-semibold text-slate-900">
                  Recruiter Notes
                </h3>

                <textarea
                  value={notes}
                  onChange={(e) =>
                    setNotes(
                      e.target.value
                    )
                  }
                  rows={4}
                  maxLength={3000}
                  placeholder="Add private notes about this candidate..."
                  className="mt-4 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />

                <div className="mt-1 text-right text-xs text-slate-400">
                  {notes.length}/3000
                </div>

              </div>

              {/* SAVE */}

              <div className="flex justify-end gap-3">

                <button
                  type="button"
                  onClick={
                    closeApplication
                  }
                  disabled={updating}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={updating}
                  onClick={() =>
                    updateStatus(
                      selectedApplication.status
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {updating ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiCheck />
                      Save Changes
                    </>
                  )}
                </button>

              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =====================================================
// STAT CARD
// =====================================================

function StatCard({
  title,
  value,
  icon,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">

        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-950">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          {icon}
        </div>

      </div>
    </div>
  );
}

// =====================================================
// INFO ITEM
// =====================================================

function InfoItem({
  icon,
  label,
  value,
}) {
  return (
    <div className="flex gap-3">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 truncate text-sm font-semibold text-slate-800">
          {value}
        </p>
      </div>

    </div>
  );
}

// =====================================================
// STATUS FORMAT
// =====================================================

function formatStatus(status) {
  if (!status) {
    return "Applied";
  }

  if (status === "reviewing") {
    return "Shortlisted";
  }

  return status
    .split(" ")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
}