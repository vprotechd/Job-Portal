import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiChevronDown,
  FiClock,
  FiEye,
  FiFilter,
  FiMail,
  FiMessageCircle,
  FiMapPin,
  FiPhone,
  FiRefreshCw,
  FiSearch,
  FiUser,
  FiXCircle,
} from "react-icons/fi";

import api from "../../services/api";

export default function ViewApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedApplication, setSelectedApplication] =
    useState(null);

  const [detailsLoading, setDetailsLoading] = useState(false);

  const downloadResume = async (applicationId) => {
    try {
      const response = await api.get(`/applications/recruiter/applications/${applicationId}/resume/download`, { responseType: "blob" });
      const url = URL.createObjectURL(response.data);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "candidate-resume";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setSelectedApplication((current) =>
        current && current._id === applicationId
          ? { ...current, cvUnlocked: true }
          : current
      );
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) {
      alert(error?.response?.data?.message || "Unable to download candidate resume.");
    }
  };

  // =====================================================
  // FETCH APPLICATIONS
  // =====================================================

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/applications/recruiter/applications"
      );

      console.log(
        "Recruiter applications:",
        response.data
      );

      if (response.data?.success) {
        setApplications(
          response.data.applications || []
        );
      } else {
        setError(
          response.data?.message ||
            "Unable to load applications."
        );
      }
    } catch (err) {
      console.error(
        "Fetch applications error:",
        err
      );

      setError(
        err.response?.data?.message ||
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
  // FETCH SINGLE APPLICATION
  // =====================================================

  const viewApplication = async (application) => {
    try {
      setDetailsLoading(true);
      setError("");

      // If there is no valid ID, use the already loaded object
      if (!application?._id) {
        setSelectedApplication(application);
        return;
      }

      const response = await api.get(
        `/applications/recruiter/applications/${application._id}`
      );

      if (response.data?.success) {
        setSelectedApplication(
          response.data.application
        );
      } else {
        setSelectedApplication(application);
      }
    } catch (err) {
      console.error(
        "Fetch application details error:",
        err
      );

      // Fallback to the application already loaded
      setSelectedApplication(application);
    } finally {
      setDetailsLoading(false);
    }
  };

  // =====================================================
  // UPDATE APPLICATION STATUS
  // =====================================================

  const updateStatus = async (
    applicationId,
    status
  ) => {
    try {
      const response = await api.patch(
        `/applications/recruiter/applications/${applicationId}/status`,
        {
          status,
        }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Unable to update status."
        );
      }

      const updatedApplication =
        response.data.application;

      // Update table
      setApplications((prev) =>
        prev.map((application) =>
          application._id === applicationId
            ? {
                ...application,
                ...updatedApplication,
              }
            : application
        )
      );

      // Update modal
      setSelectedApplication(
        updatedApplication
      );
    } catch (err) {
      console.error(
        "Update application status error:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Unable to update application status."
      );
    }
  };

  // =====================================================
  // FILTER APPLICATIONS
  // =====================================================

  const filteredApplications = useMemo(() => {
    return applications.filter(
      (application) => {
        const candidate =
          application.candidate ||
          application.applicant ||
          application.user ||
          {};

        const job =
          application.job || {};

        const candidateName =
          candidate.name ||
          candidate.fullName ||
          "";

        const candidateEmail =
          candidate.email || "";

        const jobTitle =
          job.title || "";

        const searchText =
          search.toLowerCase().trim();

        const matchesSearch =
          !searchText ||
          candidateName
            .toLowerCase()
            .includes(searchText) ||
          candidateEmail
            .toLowerCase()
            .includes(searchText) ||
          jobTitle
            .toLowerCase()
            .includes(searchText);

        const applicationStatus =
          application.status || "pending";

        const matchesStatus =
          statusFilter === "all" ||
          applicationStatus ===
            statusFilter;

        return (
          matchesSearch &&
          matchesStatus
        );
      }
    );
  }, [
    applications,
    search,
    statusFilter,
  ]);

  // =====================================================
  // STATUS STYLE
  // =====================================================

  const getStatusStyle = (status) => {
    switch (status) {
      case "accepted":
        return "bg-green-50 text-green-700 border-green-200";

      case "rejected":
        return "bg-red-50 text-red-700 border-red-200";

      case "interview":
        return "bg-purple-50 text-purple-700 border-purple-200";

      case "reviewing":
        return "bg-blue-50 text-blue-700 border-blue-200";

      default:
        return "bg-orange-50 text-orange-700 border-orange-200";
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <FiRefreshCw
              size={30}
              className="mx-auto animate-spin text-blue-600"
            />

            <p className="mt-4 text-sm text-slate-500">
              Loading applications...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">

          <div>
            <Link
              to="/recruiter/dashboard"
              className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
            >
              <FiArrowLeft />
              Back to Dashboard
            </Link>

            <h1 className="text-2xl font-bold text-slate-950">
              Applications
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Review and manage candidates who
              applied to your jobs.
            </p>
          </div>

        </div>
      </div>

      {/* =================================================
          CONTENT
      ================================================= */}

      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8">

        {/* ERROR */}

        {error && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
            <span>{error}</span>

            <button
              onClick={fetchApplications}
              className="font-semibold hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* =================================================
            FILTERS
        ================================================= */}

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

          <div className="flex flex-col gap-4 md:flex-row">

            {/* SEARCH */}

            <div className="relative flex-1">
              <FiSearch
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search candidate or job..."
                className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* STATUS */}

            <div className="relative md:w-52">

              <FiFilter
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={17}
              />

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
                className="w-full appearance-none rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-10 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="all">
                  All Applications
                </option>

                <option value="pending">
                  Pending
                </option>

                <option value="reviewing">
                  Reviewing
                </option>

                <option value="interview">
                  Interview
                </option>

                <option value="accepted">
                  Accepted
                </option>

                <option value="rejected">
                  Rejected
                </option>
              </select>

              <FiChevronDown
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />

            </div>

            {/* REFRESH */}

            <button
              onClick={fetchApplications}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiRefreshCw
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>

          </div>
        </div>

        {/* =================================================
            COUNT
        ================================================= */}

        <div className="mb-4 flex items-center justify-between">

          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-900">
              {filteredApplications.length}
            </span>{" "}
            application
            {filteredApplications.length !== 1
              ? "s"
              : ""}
          </p>

          <p className="text-xs text-slate-400">
            Total: {applications.length}
          </p>

        </div>

        {/* =================================================
            APPLICATIONS
        ================================================= */}

        {filteredApplications.length === 0 ? (

          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
              <FiUser
                size={28}
                className="text-blue-600"
              />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-950">
              No applications found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Try changing your search or status
              filter. New candidate applications
              will appear here automatically after
              they apply.
            </p>

          </div>

        ) : (

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="overflow-x-auto">

              <table className="w-full min-w-[950px]">

                <thead className="border-b border-slate-200 bg-slate-50">

                  <tr>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Candidate
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Job
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Applied
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {filteredApplications.map(
                    (application) => {

                      const candidate =
                        application.candidate ||
                        application.applicant ||
                        application.user ||
                        {};

                      const job =
                        application.job ||
                        {};

                      const status =
                        application.status ||
                        "pending";

                      return (
                        <tr
                          key={
                            application._id
                          }
                          className="transition hover:bg-slate-50"
                        >

                          {/* CANDIDATE */}

                          <td className="px-6 py-5">

                            <div className="flex items-center gap-3">

                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                                <FiUser />
                              </div>

                              <div className="min-w-0">

                                <p className="truncate font-semibold text-slate-950">
                                  {candidate.name ||
                                    candidate.fullName ||
                                    "Candidate"}
                                </p>

                                <p className="mt-1 truncate text-sm text-slate-500">
                                  {candidate.email ||
                                    "No email"}
                                </p>

                              </div>

                            </div>

                          </td>

                          {/* JOB */}

                          <td className="px-6 py-5">

                            <p className="font-semibold text-slate-900">
                              {job.title ||
                                "Job"}
                            </p>

                            <div className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                              <FiMapPin size={13} />

                              {job.location ||
                                "Location not specified"}
                            </div>

                          </td>

                          {/* DATE */}

                          <td className="px-6 py-5">

                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <FiCalendar />

                              {application.createdAt
                                ? new Date(
                                    application.createdAt
                                  ).toLocaleDateString(
                                    "en-IN",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    }
                                  )
                                : "N/A"}
                            </div>

                          </td>

                          {/* STATUS */}

                          <td className="px-6 py-5">

                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusStyle(
                                status
                              )}`}
                            >
                              {status}
                            </span>

                          </td>

                          {/* ACTION */}

                          <td className="px-6 py-5 text-right">

                            <button
                              onClick={() =>
                                viewApplication(
                                  application
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                            >
                              <FiEye />
                              View Details
                            </button>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          </div>
        )}

      </main>

      {/* =================================================
          DETAILS MODAL
      ================================================= */}

      {selectedApplication && (
        <ApplicationDetails
          application={selectedApplication}
          loading={detailsLoading}
          onClose={() =>
            setSelectedApplication(null)
          }
          onStatusUpdate={updateStatus}
          onResumeDownload={downloadResume}
          onMessage={() => navigate(`/recruiter/messages/${selectedApplication._id}`)}
        />
      )}

    </div>
  );
}

// =====================================================
// APPLICATION DETAILS MODAL
// =====================================================

function ApplicationDetails({
  application,
  loading,
  onClose,
  onStatusUpdate,
  onResumeDownload,
  onMessage,
}) {
  const candidate =
    application.candidate ||
    application.applicant ||
    application.user ||
    {};

  const job =
    application.job || {};

  const status =
    application.status || "pending";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >

      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

        {/* HEADER */}

        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">

          <div>
            <h2 className="text-xl font-bold text-slate-950">
              Application Details
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Review candidate information and
              application status.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <FiXCircle size={22} />
          </button>

        </div>

        <div className="space-y-6 p-6">

          {/* =================================================
              CANDIDATE
          ================================================= */}

          <section className="rounded-xl border border-slate-200 p-5">

            <div className="flex items-center gap-4">

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <FiUser size={24} />
              </div>

              <div className="min-w-0">

                <h3 className="text-lg font-bold text-slate-950">
                  {candidate.name ||
                    candidate.fullName ||
                    "Candidate"}
                </h3>

                <p className="text-sm text-slate-500">
                  Candidate
                </p>

              </div>

            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">

              <div className="flex items-center gap-3">

                <FiMail className="shrink-0 text-blue-600" />

                <div className="min-w-0">

                  <p className="text-xs text-slate-400">
                    Email
                  </p>

                  <p className="break-all text-sm font-medium text-slate-800">
                    {candidate.email ||
                      "Not provided"}
                  </p>

                </div>

              </div>

              <div className="flex items-center gap-3">

                <FiPhone className="shrink-0 text-blue-600" />

                <div>

                  <p className="text-xs text-slate-400">
                    Phone
                  </p>

                  <p className="text-sm font-medium text-slate-800">
                    {candidate.phone ||
                      "Not provided"}
                  </p>

                </div>

              </div>

            </div>

          </section>

          {/* =================================================
              JOB
          ================================================= */}

          <section className="rounded-xl border border-slate-200 p-5">

            <h3 className="text-base font-bold text-slate-950">
              Job Information
            </h3>

            <div className="mt-4 grid gap-4 md:grid-cols-2">

              <InfoItem
                icon={<FiBriefcase />}
                label="Position"
                value={
                  job.title ||
                  "Not available"
                }
              />

              <InfoItem
                icon={<FiMapPin />}
                label="Location"
                value={
                  job.location ||
                  "Not specified"
                }
              />

              <InfoItem
                icon={<FiBriefcase />}
                label="Job Type"
                value={
                  formatText(
                    job.jobType
                  )
                }
              />

              <InfoItem
                icon={<FiClock />}
                label="Work Mode"
                value={
                  formatText(
                    job.workMode
                  )
                }
              />

            </div>

          </section>

          {/* =================================================
              APPLICATION STATUS
          ================================================= */}

          <section className="rounded-xl border border-slate-200 p-5">

            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

              <div>

                <h3 className="text-base font-bold text-slate-950">
                  Application Status
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Update the candidate's current
                  application stage.
                </p>

              </div>

              <span
                className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusStyle(
                  status
                )}`}
              >
                {status}
              </span>

            </div>

            <div className="mt-5">

              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Change Status
              </label>

              <select
                value={status}
                disabled={loading}
                onChange={(e) =>
                  onStatusUpdate(
                    application._id,
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
              >
                <option value="pending">
                  Pending
                </option>

                <option value="reviewing">
                  Reviewing
                </option>

                <option value="interview">
                  Interview
                </option>

                <option value="accepted">
                  Accepted
                </option>

                <option value="rejected">
                  Rejected
                </option>
              </select>

            </div>

          </section>

          {/* =================================================
              APPLICATION INFORMATION
          ================================================= */}

          <section className="rounded-xl border border-slate-200 p-5">

            <h3 className="text-base font-bold text-slate-950">
              Application Information
            </h3>

            <div className="mt-4 grid gap-4 md:grid-cols-2">

              <InfoItem
                icon={<FiCalendar />}
                label="Applied On"
                value={
                  application.createdAt
                    ? new Date(
                        application.createdAt
                      ).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        }
                      )
                    : "Not available"
                }
              />

              <InfoItem
                icon={<FiCheckCircle />}
                label="Current Status"
                value={formatText(status)}
              />

            </div>

          </section>

          {/* =================================================
              COVER LETTER
          ================================================= */}

          {application.coverLetter && (
            <section className="rounded-xl border border-slate-200 p-5">

              <h3 className="text-base font-bold text-slate-950">
                Cover Letter
              </h3>

              <div className="mt-3 rounded-xl bg-slate-50 p-4">

                <p className="whitespace-pre-line text-sm leading-7 text-slate-600">
                  {application.coverLetter}
                </p>

              </div>

            </section>
          )}

          {/* =================================================
              RESUME
          ================================================= */}

          {application.resume && (
            <section className="rounded-xl border border-slate-200 p-5">

              <h3 className="text-base font-bold text-slate-950">
                Resume
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Open the candidate's submitted
                resume.
              </p>

              <button
                type="button"
                onClick={() => onResumeDownload(application._id)}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <FiEye />
                View / Download Resume
              </button>

              {application.cvUnlocked && (
                <button
                  type="button"
                  onClick={onMessage}
                  className="ml-2 mt-4 inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                >
                  <FiMessageCircle />
                  Message Candidate
                </button>
              )}

            </section>
          )}

        </div>

        {/* FOOTER */}

        <div className="sticky bottom-0 border-t border-slate-200 bg-white px-6 py-4 text-right">

          <button
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Close
          </button>

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
    <div className="flex items-center gap-3">

      <div className="text-blue-600">
        {icon}
      </div>

      <div className="min-w-0">

        <p className="text-xs text-slate-400">
          {label}
        </p>

        <p className="text-sm font-medium capitalize text-slate-800">
          {value || "Not available"}
        </p>

      </div>

    </div>
  );
}

// =====================================================
// FORMAT TEXT
// =====================================================

function formatText(value) {
  if (!value) {
    return "Not specified";
  }

  return String(value)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}

// =====================================================
// STATUS STYLE
// =====================================================

function getStatusStyle(status) {
  switch (status) {
    case "accepted":
      return "bg-green-50 text-green-700 border-green-200";

    case "rejected":
      return "bg-red-50 text-red-700 border-red-200";

    case "interview":
      return "bg-purple-50 text-purple-700 border-purple-200";

    case "reviewing":
      return "bg-blue-50 text-blue-700 border-blue-200";

    default:
      return "bg-orange-50 text-orange-700 border-orange-200";
  }
}