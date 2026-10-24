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

  // =====================================================
  // LOAD LOGGED-IN RECRUITER
  // =====================================================

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

  // =====================================================
  // FETCH RECRUITER DASHBOARD
  // =====================================================

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

        /*
         * api.js baseURL:
         *
         * http://localhost:5000/api
         *
         * Therefore:
         *
         * /recruiter/dashboard
         *
         * becomes:
         *
         * http://localhost:5000/api/recruiter/dashboard
         */

        const response = await api.get("/recruiter/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = response.data;

        console.log("Recruiter dashboard response:", data);

        // =================================================
        // AUTHORIZATION
        // =================================================

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          navigate("/login", { replace: true });
          return;
        }

        // =================================================
        // SUCCESS
        // =================================================

        if (!data.success) {
          throw new Error(
            data.message || "Unable to load recruiter dashboard."
          );
        }

        // =================================================
        // STATISTICS
        // =================================================

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

        // =================================================
        // RECENT APPLICATIONS
        // =================================================

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

        // =================================================
        // RECRUITER INFORMATION
        // =================================================

        if (data.recruiter) {
          setUser((previousUser) => ({
            ...(previousUser || {}),
            ...data.recruiter,
          }));
        }
      } catch (err) {
        console.error("Recruiter dashboard error:", err);

        // =================================================
        // AUTH ERROR
        // =================================================

        if (
          err.response?.status === 401 ||
          err.response?.status === 403
        ) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          navigate("/login", { replace: true });
          return;
        }

        // =================================================
        // OTHER ERROR
        // =================================================

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

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("rememberMe");

    navigate("/login", { replace: true });
  };

  // =====================================================
  // STAT CARDS
  // =====================================================

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

  // =====================================================
  // STATUS COLORS
  // =====================================================

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

  // =====================================================
  // DATE FORMAT
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

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

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading recruiter dashboard...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // DASHBOARD
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8">

        {/* ================================================= */}
        {/* WELCOME */}
        {/* ================================================= */}

        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              Recruiter Dashboard
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-950">
              Welcome back
              {user?.name ? `, ${user.name}` : ""}
            </h1>

            <p className="mt-2 text-slate-500">
              Manage your jobs, candidates, and recruitment process.
            </p>
          </div>

          <Link
            to="/recruiter/messages"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-600"
          >
            <FiMessageCircle size={18} />
            Messages
          </Link>

          <Link
            to="/recruiter/jobs/create"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <FiPlus size={18} />
            Post a Job
          </Link>
        </div>

        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {error && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="font-semibold hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* ================================================= */}
        {/* STAT CARDS */}
        {/* ================================================= */}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <div
              key={stat.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
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

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ================================================= */}
        {/* RESUME ACCESS */}
        {/* ================================================= */}

        <section className="mt-8 rounded-2xl border border-blue-100 bg-blue-50/60 p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                <FiDownload size={20} />
              </div>
              <div>
                <h2 className="font-bold text-slate-950">Candidate Resume Downloads</h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                  You receive {resumeAccess.freeDownloadsTotal || 0} free candidate CV unlocks every month. After those are used, each new candidate CV unlock consumes {resumeAccess.creditCost || 1} paid credit.
                </p>
              </div>
            </div>
            <div className="flex shrink-0 gap-3">
              <div className="rounded-xl bg-white px-4 py-3 text-center shadow-sm">
                <p className="text-xs text-slate-500">Free remaining</p>
                <p className="mt-1 text-xl font-bold text-blue-600">{resumeAccess.freeDownloadsRemaining}/{resumeAccess.freeDownloadsTotal || 0}</p>
              </div>
              <div className="rounded-xl bg-white px-4 py-3 text-center shadow-sm">
                <p className="text-xs text-slate-500">Credits</p>
                <p className="mt-1 text-xl font-bold text-slate-950">{resumeAccess.credits}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* QUICK ACTIONS */}
        {/* ================================================= */}

        <section className="mt-8">
          <h2 className="mb-4 text-lg font-bold text-slate-950">
            Quick Actions
          </h2>

          <div className="grid gap-4 md:grid-cols-3">

            {/* POST JOB */}

            <Link
              to="/recruiter/jobs/create"
              className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-200 hover:shadow-md"
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
              className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-200 hover:shadow-md"
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
              className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-200 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <FiUsers size={20} />
                </div>
                <FiArrowRight className="text-slate-300 transition group-hover:text-blue-600" size={20} />
              </div>
              <h3 className="mt-4 font-semibold text-slate-950">Search Candidates</h3>
              <p className="mt-1 text-sm text-slate-500">Search privacy-protected candidates and unlock CVs.</p>
            </Link>

            {/* CV PACKAGES */}

            <Link
              to="/recruiter/packages"
              className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-200 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <FiCreditCard size={20} />
                </div>
                <FiArrowRight className="text-slate-300 transition group-hover:text-blue-600" size={20} />
              </div>
              <h3 className="mt-4 font-semibold text-slate-950">Buy CV Credits</h3>
              <p className="mt-1 text-sm text-slate-500">Purchase additional CV credits securely with Razorpay.</p>
            </Link>

            {/* APPLICATIONS */}

            <Link
              to="/recruiter/applications"
              className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-200 hover:shadow-md"
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

        {/* ================================================= */}
        {/* RECENT APPLICATIONS */}
        {/* ================================================= */}

        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <div>
              <h2 className="font-bold text-slate-950">
                Recent Applications
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Latest applications received for your jobs.
              </p>
            </div>

            <Link
              to="/recruiter/applications"
              className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              View all
              <FiArrowRight size={16} />
            </Link>
          </div>

          {recentApplications.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <FiFileText size={24} />
              </div>

              <h3 className="mt-4 font-semibold text-slate-800">
                No applications yet
              </h3>

              <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
                Applications from candidates will appear here when
                they apply to your job listings.
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

                const status =
                  application.status || "pending";

                return (
                  <div
                    key={
                      application._id ||
                      application.id ||
                      `${candidateEmail}-${jobTitle}`
                    }
                    className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
                  >

                    {/* Candidate */}

                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 font-semibold text-blue-600">
                        {candidateName
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {candidateName}
                        </h3>

                        <p className="text-sm text-slate-500">
                          {jobTitle}
                        </p>

                        {candidateEmail && (
                          <p className="mt-0.5 text-xs text-slate-400">
                            {candidateEmail}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Application Info */}

                    <div className="flex flex-wrap items-center gap-4 sm:justify-end">
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

        {/* ================================================= */}
        {/* BOTTOM CARDS */}
        {/* ================================================= */}

        <section className="mt-8 grid gap-6 md:grid-cols-2">

          {/* JOBS */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <FiBriefcase />
              </div>

              <div>
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

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <FiSettings />
              </div>

              <div>
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

        {/* ================================================= */}
        {/* LOGOUT */}
        {/* ================================================= */}

        <div className="mt-8 flex justify-end">
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