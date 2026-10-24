import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiBriefcase,
  FiEdit2,
  FiEye,
  FiFilter,
  FiMapPin,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiXCircle,
  FiCheckCircle,
} from "react-icons/fi";

import api from "../../services/api";
import BackLink from "../../components/layout/BackLink";

export default function ManageJobs() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [error, setError] = useState("");

  // =====================================================
  // FETCH JOBS
  // =====================================================

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/recruiter/jobs");

      console.log("Recruiter jobs:", response.data);

      if (response.data?.success) {
        setJobs(response.data.jobs || []);
      } else {
        setError(
          response.data?.message || "Unable to load jobs."
        );
      }
    } catch (err) {
      console.error("Fetch recruiter jobs error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load your jobs."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // =====================================================
  // FILTER JOBS
  // =====================================================

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        job.title?.toLowerCase().includes(searchText) ||
        job.location?.toLowerCase().includes(searchText) ||
        job.company?.name?.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "all" ||
        job.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [jobs, search, statusFilter]);

  // =====================================================
  // CLOSE JOB
  // =====================================================

  const handleCloseJob = async (jobId) => {
    const confirmed = window.confirm(
      "Are you sure you want to close this job?"
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);

      const response = await api.patch(
        `/recruiter/jobs/${jobId}/close`
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Unable to close job."
        );
      }

      await fetchJobs();
    } catch (err) {
      console.error("Close job error:", err);

      alert(
        err.response?.data?.message ||
          "Unable to close job."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // PUBLISH JOB
  // =====================================================

  const handlePublishJob = async (jobId) => {
    try {
      setActionLoading(true);

      const response = await api.patch(
        `/recruiter/jobs/${jobId}/publish`
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Unable to publish job."
        );
      }

      await fetchJobs();
    } catch (err) {
      console.error("Publish job error:", err);

      alert(
        err.response?.data?.message ||
          "Unable to publish job."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // DELETE JOB
  // =====================================================

  const handleDeleteJob = async (jobId) => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this job?"
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);

      const response = await api.delete(
        `/recruiter/jobs/${jobId}`
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Unable to delete job."
        );
      }

      setJobs((currentJobs) =>
        currentJobs.filter(
          (job) => job._id !== jobId
        )
      );
    } catch (err) {
      console.error("Delete job error:", err);

      alert(
        err.response?.data?.message ||
          "Unable to delete job."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // STATUS STYLE
  // =====================================================

  const getStatusStyle = (status) => {
    switch (status) {
      case "active":
        return "bg-green-50 text-green-700 border-green-200";

      case "closed":
        return "bg-red-50 text-red-700 border-red-200";

      case "draft":
        return "bg-slate-50 text-slate-700 border-slate-200";

      default:
        return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">

        <div className="flex min-h-[70vh] items-center justify-center px-6">

          <div className="text-center">

            <FiRefreshCw
              className="mx-auto animate-spin text-blue-600"
              size={30}
            />

            <p className="mt-4 text-sm text-slate-500">
              Loading your jobs...
            </p>

          </div>

        </div>

      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-6 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-8">

          <div className="min-w-0">

            <BackLink to="/recruiter/dashboard" className="mb-3">Back to Dashboard</BackLink>

            <h1 className="text-2xl font-bold text-slate-950 sm:text-3xl">
              Manage Jobs
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              View and manage all your job postings.
            </p>

          </div>

          <div className="flex shrink-0">

            <Link
              to="/recruiter/jobs/create"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 sm:w-auto"
            >
              <FiPlus size={18} />
              Post a Job
            </Link>

          </div>

        </div>

      </header>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8 lg:px-8">

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-6 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600 sm:flex-row sm:items-center sm:justify-between">

            <span>{error}</span>

            <button
              type="button"
              onClick={fetchJobs}
              className="w-fit font-semibold hover:underline"
            >
              Try again
            </button>

          </div>
        )}

        {/* =================================================
            FILTER BAR
        ================================================= */}

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

          <div className="flex flex-col gap-4 lg:flex-row">

            {/* SEARCH */}

            <div className="relative min-w-0 flex-1">

              <FiSearch
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search jobs, location or company..."
                className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>

            {/* STATUS */}

            <div className="relative w-full lg:w-52">

              <FiFilter
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={17}
              />

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
                className="w-full appearance-none rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="all">
                  All Status
                </option>

                <option value="active">
                  Active
                </option>

                <option value="closed">
                  Closed
                </option>

                <option value="draft">
                  Draft
                </option>

              </select>

            </div>

            {/* REFRESH */}

            <button
              type="button"
              onClick={fetchJobs}
              disabled={loading || actionLoading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 lg:w-auto"
            >
              <FiRefreshCw
                className={
                  loading ? "animate-spin" : ""
                }
              />

              Refresh
            </button>

          </div>

        </div>

        {/* =================================================
            JOB COUNT
        ================================================= */}

        <div className="mb-5 flex items-center justify-between">

          <p className="text-sm text-slate-500">

            Showing{" "}

            <span className="font-semibold text-slate-900">
              {filteredJobs.length}
            </span>{" "}

            job
            {filteredJobs.length !== 1 ? "s" : ""}

          </p>

        </div>

        {/* =================================================
            NO JOBS
        ================================================= */}

        {filteredJobs.length === 0 ? (

          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">

              <FiBriefcase
                size={28}
                className="text-blue-600"
              />

            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-950">
              No jobs found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              You haven't posted any jobs yet, or no jobs
              match your current filters.
            </p>

            <Link
              to="/recruiter/jobs/create"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              <FiPlus />
              Post Your First Job
            </Link>

          </div>

        ) : (

          /* =================================================
             JOB LIST
          ================================================= */

          <div className="space-y-5">

            {filteredJobs.map((job) => (

              <article
                key={job._id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
              >

                <div className="flex flex-col gap-6">

                  {/* =================================================
                      JOB INFORMATION
                  ================================================= */}

                  <div className="min-w-0">

                    {/* TITLE + STATUS */}

                    <div className="flex flex-wrap items-center gap-3">

                      <h2 className="break-words text-xl font-bold text-slate-950">
                        {job.title}
                      </h2>

                      <span
                        className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusStyle(
                          job.status
                        )}`}
                      >
                        {job.status || "active"}
                      </span>

                    </div>

                    {/* COMPANY */}

                    <p className="mt-2 text-sm font-medium text-slate-600">
                      {job.company?.name || "Company"}
                    </p>

                    {/* JOB META */}

                    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-slate-500">

                      <span className="inline-flex items-center gap-2">
                        <FiMapPin className="shrink-0" />
                        {job.location || "Not specified"}
                      </span>

                      <span className="inline-flex items-center gap-2">
                        <FiBriefcase className="shrink-0" />
                        {job.jobType || "Full-time"}
                      </span>

                      {job.workMode && (
                        <span className="capitalize">
                          {job.workMode}
                        </span>
                      )}

                    </div>

                    {/* JOB STATS */}

                    <div className="mt-6 flex flex-wrap gap-x-10 gap-y-5 border-t border-slate-100 pt-5">

                      <div className="min-w-[90px]">

                        <span className="text-xs font-medium text-slate-400">
                          Applications
                        </span>

                        <p className="mt-1 text-lg font-bold text-slate-900">
                          {job.applicationsCount || 0}
                        </p>

                      </div>

                      <div className="min-w-[70px]">

                        <span className="text-xs font-medium text-slate-400">
                          Views
                        </span>

                        <p className="mt-1 text-lg font-bold text-slate-900">
                          {job.views || 0}
                        </p>

                      </div>

                      {job.applicationDeadline && (
                        <div className="min-w-[120px]">

                          <span className="text-xs font-medium text-slate-400">
                            Deadline
                          </span>

                          <p className="mt-1 text-lg font-bold text-slate-900">
                            {new Date(
                              job.applicationDeadline
                            ).toLocaleDateString()}
                          </p>

                        </div>
                      )}

                    </div>

                  </div>

                  {/* =================================================
                      ACTIONS
                  ================================================= */}

                  <div className="flex w-full flex-wrap items-center justify-start gap-2 border-t border-slate-100 pt-5 lg:justify-end">

                    {/* VIEW */}

                    {/* <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/recruiter/jobs/${job._id}`
                        )
                      }
                      className="inline-flex min-w-[82px] items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <FiEye size={16} />
                      View
                    </button> */}

                    {/* EDIT */}

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/recruiter/jobs/${job._id}/edit`
                        )
                      }
                      className="inline-flex min-w-[82px] items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <FiEdit2 size={16} />
                      Edit
                    </button>

                    {/* CLOSE / PUBLISH */}

                    {job.status === "active" ? (

                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() =>
                          handleCloseJob(job._id)
                        }
                        className="inline-flex min-w-[82px] items-center justify-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-700 transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <FiXCircle size={16} />
                        Close
                      </button>

                    ) : (

                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() =>
                          handlePublishJob(job._id)
                        }
                        className="inline-flex min-w-[82px] items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <FiCheckCircle size={16} />
                        Publish
                      </button>

                    )}

                    {/* DELETE */}

                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() =>
                        handleDeleteJob(job._id)
                      }
                      className="inline-flex min-w-[82px] items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <FiTrash2 size={16} />
                      Delete
                    </button>

                  </div>

                </div>

              </article>

            ))}

          </div>

        )}

      </main>

      {/* =================================================
          FOOTER
      ================================================= */}

   

        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">

            {/* BRAND */}

            <div>

              <h2 className="text-xl font-bold">
                Jobify
              </h2>

              <p className="mt-3 max-w-sm text-sm leading-6 text-slate-400">
                Connecting talented people with meaningful
                opportunities and helping businesses find
                the right talent.
              </p>

            </div>

            {/* JOB SEEKERS */}

            <div>

              <h3 className="font-semibold">
                For Job Seekers
              </h3>

              <div className="mt-4 flex flex-col gap-3 text-sm text-slate-400">

                <Link
                  to="/jobs"
                  className="transition hover:text-white"
                >
                  Find Jobs
                </Link>

                <Link
                  to="/register"
                  className="transition hover:text-white"
                >
                  Create Profile
                </Link>

                <Link
                  to="/register"
                  className="transition hover:text-white"
                >
                  Build Resume
                </Link>

              </div>

            </div>

            {/* EMPLOYERS */}

            <div>

              <h3 className="font-semibold">
                For Employers
              </h3>

              <div className="mt-4 flex flex-col gap-3 text-sm text-slate-400">

                <Link
                  to="/register"
                  className="transition hover:text-white"
                >
                  Post a Job
                </Link>

                <Link
                  to="/register"
                  className="transition hover:text-white"
                >
                  Find Candidates
                </Link>

              </div>

            </div>

            {/* COMPANY */}

            <div>

              <h3 className="font-semibold">
                Company
              </h3>

              <div className="mt-4 flex flex-col gap-3 text-sm text-slate-400">

                <Link
                  to="/about"
                  className="transition hover:text-white"
                >
                  About
                </Link>

                <Link
                  to="/contact"
                  className="transition hover:text-white"
                >
                  Contact
                </Link>

                <Link
                  to="/privacy-policy"
                  className="transition hover:text-white"
                >
                  Privacy Policy
                </Link>

                <Link
                  to="/terms-and-conditions"
                  className="transition hover:text-white"
                >
                  Terms & Conditions
                </Link>

              </div>

            </div>

          </div>

          <div className="mt-10 border-t border-slate-800 pt-6 text-sm text-slate-500">

            © {new Date().getFullYear()} Jobify. All rights reserved.

          </div>

        </div>

      
      

    </div>
  );
}