
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiFileText,
  FiPlus,
  FiSettings,
  FiCreditCard,
  FiUsers,
  FiMessageCircle,
} from "react-icons/fi";

import api from "../../services/api";

export default function RecruiterDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [stats, setStats] = useState({
    activeJobs: 0,
    applications: 0,
    interviews: 0,
    hired: 0,
  });

  const [recentApplications, setRecentApplications] = useState([]);

  const [resumeAccess, setResumeAccess] = useState({
    freeDownloadsTotal: 10,
    freeDownloadsUsed: 0,
    freeDownloadsRemaining: 10,
    credits: 0,
    creditCost: 1,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // LOAD LOGGED-IN RECRUITER
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!storedUser || !token) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);

      if (parsedUser.role !== "recruiter") {
        if (parsedUser.role === "admin") {
          navigate("/admin/dashboard", { replace: true });
        } else {
          navigate("/jobs", { replace: true });
        }
        return;
      }

      setUser(parsedUser);
    } catch (err) {
      console.error("Unable to load recruiter:", err);

      localStorage.removeItem("user");
      localStorage.removeItem("token");

      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // FETCH RECRUITER DASHBOARD
  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await api.get("/recruiter/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = response.data;

        console.log("Recruiter dashboard response:", data);

        if (!data.success) {
          throw new Error(
            data.message || "Unable to load recruiter dashboard."
          );
        }

        const statistics = data.statistics || data.stats || {};

        setStats({
          activeJobs: Number(statistics.activeJobs ?? 0),
          applications: Number(
            statistics.totalApplications ??
              statistics.applications ??
              0
          ),
          interviews: Number(statistics.interviews ?? 0),
          hired: Number(statistics.hired ?? 0),
        });

        setRecentApplications(
          Array.isArray(data.recentApplications)
            ? data.recentApplications
            : []
        );

        if (data.resumeAccess) {
          setResumeAccess((previous) => ({
            ...previous,
            ...data.resumeAccess,
          }));
        }

        if (data.recruiter) {
          setUser((previousUser) => ({
            ...(previousUser || {}),
            ...data.recruiter,
          }));
        }
      } catch (err) {
        console.error("Recruiter dashboard error:", err);

        if (
          err.response?.status === 401 ||
          err.response?.status === 403
        ) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          navigate("/login", { replace: true });
          return;
        }

        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load dashboard data."
        );

        setStats({
          activeJobs: 0,
          applications: 0,
          interviews: 0,
          hired: 0,
        });

        setRecentApplications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("rememberMe");

    navigate("/login", { replace: true });
  };

  // STAT CARDS
  const statCards = [
    {
      title: "Active Jobs",
      value: stats.activeJobs,
      description: "Currently published",
      icon: <FiBriefcase size={21} />,
    },
    {
      title: "Applications",
      value: stats.applications,
      description: "Applications received",
      icon: <FiUsers size={21} />,
    },
    {
      title: "Interviews",
      value: stats.interviews,
      description: "Scheduled interviews",
      icon: <FiCalendar size={21} />,
    },
    {
      title: "Hired",
      value: stats.hired,
      description: "Successful hires",
      icon: <FiCheckCircle size={21} />,
    },
  ];

  // STATUS COLORS
  const getStatusClasses = (status) => {
    switch (status?.toLowerCase()) {
      case "reviewing":
      case "shortlisted":
        return "bg-blue-50 text-blue-700";

      case "interview":
      case "interview scheduled":
        return "bg-purple-50 text-purple-700";

      case "accepted":
      case "hired":
        return "bg-green-50 text-green-700";

      case "rejected":
        return "bg-red-50 text-red-700";

      case "pending":
      case "applied":
      default:
        return "bg-amber-50 text-amber-700";
    }
  };

  // DATE FORMAT
  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // LOADING
  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading recruiter dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-w-0 overflow-x-clip bg-slate-50">
     

<main className="mx-auto w-full max-w-7xl min-w-0 px-4 pt-8 pb-6 sm:px-6 sm:pt-8 sm:pb-8 lg:px-8">



        {/* WELCOME HEADER */}
        <header className="mb-8 grid min-w-0 grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-blue-600">
              Recruiter Dashboard
            </p>

            <h1 className="mt-1 break-words text-2xl font-bold text-slate-950 sm:text-3xl">
              Welcome back{user?.name ? `, ${user.name}` : ""}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Manage your jobs, candidates, and recruitment process.
            </p>
          </div>

          <div className="flex min-w-0 flex-wrap items-center gap-3 lg:justify-end">
            <Link
              to="/recruiter/messages"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-600 sm:px-5"
            >
              <FiMessageCircle size={18} />
              Messages
            </Link>

            <Link
              to="/recruiter/jobs/create"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:px-5"
            >
              <FiPlus size={18} />
              Post a Job
            </Link>
          </div>
        </header>

        {/* ERROR */}
        {error && (
          <div className="mb-6 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 sm:flex-row sm:items-center sm:justify-between">
            <span className="break-words">{error}</span>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="shrink-0 self-start font-semibold hover:underline sm:self-auto"
            >
              Try again
            </button>
          </div>
        )}

        {/* STAT CARDS */}
        <section
          aria-label="Recruitment statistics"
          className="grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {statCards.map((stat) => (
            <div
              key={stat.title}
              className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-500">
                    {stat.title}
                  </p>

                  <h2 className="mt-2 text-3xl font-bold text-slate-950">
                    {stat.value}
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    {stat.description}
                  </p>
                </div>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* RESUME ACCESS */}
        <section className="mt-8 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 sm:p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                <FiDownload size={20} />
              </div>

              <div className="min-w-0">
                <h2 className="font-bold text-slate-950">
                  Candidate Resume Downloads
                </h2>

                <p className="mt-1 max-w-2xl break-words text-sm leading-6 text-slate-600">
                  You receive {resumeAccess.freeDownloadsTotal ?? 10} free
                  candidate CV unlocks every month. After those are used,
                  each new candidate CV unlock consumes{" "}
                  {resumeAccess.creditCost ?? 1} paid credit.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 md:shrink-0">
              <div className="min-w-[125px] flex-1 rounded-xl bg-white px-4 py-3 text-center shadow-sm">
                <p className="text-xs text-slate-500">Free remaining</p>

                <p className="mt-1 text-xl font-bold text-blue-600">
                  {resumeAccess.freeDownloadsRemaining ?? 10}/
                  {resumeAccess.freeDownloadsTotal ?? 10}
                </p>
              </div>

              <div className="min-w-[100px] flex-1 rounded-xl bg-white px-4 py-3 text-center shadow-sm">
                <p className="text-xs text-slate-500">Credits</p>

                <p className="mt-1 text-xl font-bold text-slate-950">
                  {resumeAccess.credits ?? 0}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section className="mt-8 min-w-0">
          <h2 className="mb-4 text-lg font-bold text-slate-950">
            Quick Actions
          </h2>

          <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {/* POST JOB */}
            <Link
              to="/recruiter/jobs/create"
              className="group min-w-0 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-200 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <FiPlus size={20} />
                </div>

                <FiArrowRight
                  className="text-slate-300 transition group-hover:text-blue-600"
                  size={20}
                />
              </div>

              <h3 className="mt-4 font-semibold text-slate-950">
                Post a New Job
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Create and publish a new job opening.
              </p>
            </Link>

            {/* MANAGE JOBS */}
            <Link
              to="/recruiter/jobs"
              className="group min-w-0 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-200 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <FiBriefcase size={20} />
                </div>

                <FiArrowRight
                  className="text-slate-300 transition group-hover:text-blue-600"
                  size={20}
                />
              </div>

              <h3 className="mt-4 font-semibold text-slate-950">
                Manage Jobs
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                View, edit, publish, close, and delete jobs.
              </p>
            </Link>

            {/* CANDIDATES */}
            <Link
              to="/recruiter/candidates"
              className="group min-w-0 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-200 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <FiUsers size={20} />
                </div>

                <FiArrowRight
                  className="text-slate-300 transition group-hover:text-blue-600"
                  size={20}
                />
              </div>

              <h3 className="mt-4 font-semibold text-slate-950">
                Search Candidates
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Search privacy-protected candidates and unlock CVs.
              </p>
            </Link>

            {/* CV PACKAGES */}
            <Link
              to="/recruiter/packages"
              className="group min-w-0 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-200 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <FiCreditCard size={20} />
                </div>

                <FiArrowRight
                  className="text-slate-300 transition group-hover:text-blue-600"
                  size={20}
                />
              </div>

              <h3 className="mt-4 font-semibold text-slate-950">
                Buy CV Credits
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Purchase additional CV credits securely with Razorpay.
              </p>
            </Link>

            {/* APPLICATIONS */}
            <Link
              to="/recruiter/applications"
              className="group min-w-0 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-200 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <FiUsers size={20} />
                </div>

                <FiArrowRight
                  className="text-slate-300 transition group-hover:text-blue-600"
                  size={20}
                />
              </div>

              <h3 className="mt-4 font-semibold text-slate-950">
                View Applications
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Review candidates who applied to your jobs.
              </p>
            </Link>
          </div>
        </section>

        {/* RECENT APPLICATIONS */}
        <section className="mt-8 min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="min-w-0">
              <h2 className="font-bold text-slate-950">
                Recent Applications
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Latest applications received for your jobs.
              </p>
            </div>

            <Link
              to="/recruiter/applications"
              className="inline-flex shrink-0 items-center gap-1 self-start text-sm font-semibold text-blue-600 hover:text-blue-700 sm:self-auto"
            >
              View all
              <FiArrowRight size={16} />
            </Link>
          </div>

          {recentApplications.length === 0 ? (
            <div className="px-4 py-14 text-center sm:px-6">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <FiFileText size={24} />
              </div>

              <h3 className="mt-4 font-semibold text-slate-800">
                No applications yet
              </h3>

              <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
                Applications from candidates will appear here when they
                apply to your job listings.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentApplications.map((application) => {
                const candidate =
                  application.candidate ||
                  application.user ||
                  application.applicant ||
                  {};

                const candidateName =
                  candidate.name ||
                  candidate.fullName ||
                  application.candidateName ||
                  application.applicantName ||
                  "Candidate";

                const candidateEmail =
                  candidate.email ||
                  application.candidateEmail ||
                  application.applicantEmail ||
                  "";

                const job =
                  application.job ||
                  application.jobId ||
                  {};

                const jobTitle =
                  job.title ||
                  application.jobTitle ||
                  "Job";

                const status = application.status || "pending";

                return (
                  <div
                    key={
                      application._id ||
                      application.id ||
                      `${candidateEmail}-${jobTitle}`
                    }
                    className="flex min-w-0 flex-col gap-4 px-4 py-5 sm:px-6 md:flex-row md:items-center md:justify-between"
                  >
                    {/* Candidate */}
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 font-semibold text-blue-600">
                        {candidateName.charAt(0).toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <h3 className="break-words font-semibold text-slate-900">
                          {candidateName}
                        </h3>

                        <p className="break-words text-sm text-slate-500">
                          {jobTitle}
                        </p>

                        {candidateEmail && (
                          <p className="mt-0.5 break-all text-xs text-slate-400">
                            {candidateEmail}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Application Info */}
                    <div className="flex flex-wrap items-center gap-4 md:justify-end">
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <FiClock size={15} />

                        {formatDate(
                          application.createdAt ||
                            application.appliedAt ||
                            application.date
                        )}
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClasses(
                          status
                        )}`}
                      >
                        {status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* BOTTOM CARDS */}
        <section className="mt-8 grid min-w-0 grid-cols-1 gap-6 md:grid-cols-2">

          {/* JOBS */}
          <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <FiBriefcase />
              </div>

              <div className="min-w-0">
                <h3 className="font-bold text-slate-950">
                  Your Job Listings
                </h3>

                <p className="text-sm text-slate-500">
                  Create and manage your job postings.
                </p>
              </div>
            </div>

            <Link
              to="/recruiter/jobs"
              className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-600"
            >
              Manage Jobs
              <FiArrowRight size={16} />
            </Link>
          </div>

          {/* PROFILE */}
          <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <FiSettings />
              </div>

              <div className="min-w-0">
                <h3 className="font-bold text-slate-950">
                  Recruiter Profile
                </h3>

                <p className="text-sm text-slate-500">
                  Manage your recruiter profile and information.
                </p>
              </div>
            </div>

            <Link
              to="/recruiter/profile"
              className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-600"
            >
              Manage Profile
              <FiArrowRight size={16} />
            </Link>
          </div>
        </section>

        {/* LOGOUT */}
        <div className="mt-8 flex justify-end pb-6">
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      </main>
    </div>
  );
}
