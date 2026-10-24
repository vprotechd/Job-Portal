
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FiBriefcase,
  FiCalendar,
  FiClock,
  FiEdit2,
  FiMapPin,
  FiUsers,
  FiEye,
  FiDollarSign,
} from "react-icons/fi";
import { toast } from "react-toastify";
import api from "../../services/api";
import BackLink from "../../components/layout/BackLink";

export default function ViewJob() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJob();
  }, [id]);

  const loadJob = async () => {
    try {
      setLoading(true);

      const response = await api.get(`/recruiter/jobs/${id}`);

      setJob(
        response.data?.job ||
          response.data?.data ||
          response.data
      );
    } catch (error) {
      console.error("View job error:", error);

      toast.error(
        error.response?.data?.message ||
          "Unable to load job details."
      );

      navigate("/recruiter/jobs");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
          <p className="mt-4 text-sm text-slate-500">
            Loading job details...
          </p>
        </div>
      </div>
    );
  }

  if (!job) return null;

  const jobId = job._id || job.id;

  return (
    <div className="min-h-screen bg-slate-50">

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">

        {/* BACK */}
        <BackLink to="/recruiter/jobs" className="mb-6">Back to Jobs</BackLink>

        {/* HEADER */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="h-2 bg-blue-600" />

          <div className="p-6 sm:p-8">

            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

              <div className="min-w-0">

                <div className="flex flex-wrap items-center gap-3">

                  <h1 className="break-words text-2xl font-bold text-slate-950 sm:text-3xl">
                    {job.title || job.jobTitle}
                  </h1>

                  <StatusBadge status={job.status} />

                </div>

                <p className="mt-3 flex items-center gap-2 text-base font-medium text-slate-600">
                  <FiBriefcase />
                  {job.company || "Company"}
                </p>

              </div>

              <div className="flex flex-wrap gap-3">

                <Link
                  to={`/recruiter/jobs/${jobId}/edit`}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <FiEdit2 />
                  Edit Job
                </Link>

              </div>

            </div>

            {/* STATS */}
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

              <InfoCard
                icon={<FiMapPin />}
                label="Location"
                value={job.location || "Not specified"}
              />

              <InfoCard
                icon={<FiClock />}
                label="Job Type"
                value={
                  job.jobType ||
                  job.type ||
                  "Not specified"
                }
              />

              <InfoCard
                icon={<FiUsers />}
                label="Applications"
                value={job.applicationsCount ?? 0}
              />

              <InfoCard
                icon={<FiEye />}
                label="Views"
                value={job.views ?? 0}
              />

            </div>

          </div>
        </section>

        {/* CONTENT */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">

          <div className="space-y-6 lg:col-span-2">

            {/* DESCRIPTION */}
            <Section title="Job Description">

              <div className="whitespace-pre-line break-words text-sm leading-7 text-slate-600">
                {job.description ||
                  "No job description has been added."}
              </div>

            </Section>

            {/* REQUIREMENTS */}
            <Section title="Requirements">

              <div className="whitespace-pre-line break-words text-sm leading-7 text-slate-600">
                {job.requirements ||
                  job.requiredSkills ||
                  "No requirements have been added."}
              </div>

            </Section>

            {/* RESPONSIBILITIES */}
            {(job.responsibilities ||
              job.responsibility) && (
              <Section title="Responsibilities">

                <div className="whitespace-pre-line break-words text-sm leading-7 text-slate-600">
                  {job.responsibilities ||
                    job.responsibility}
                </div>

              </Section>
            )}

          </div>

          {/* SIDEBAR */}
          <aside className="space-y-6">

            <Section title="Job Information">

              <div className="space-y-4">

                <SideItem
                  icon={<FiBriefcase />}
                  label="Company"
                  value={job.company}
                />

                <SideItem
                  icon={<FiMapPin />}
                  label="Location"
                  value={job.location}
                />

                <SideItem
                  icon={<FiClock />}
                  label="Employment Type"
                  value={
                    job.jobType ||
                    job.type
                  }
                />

                <SideItem
                  icon={<FiDollarSign />}
                  label="Salary"
                  value={
                    job.salary ||
                    job.salaryRange ||
                    "Not specified"
                  }
                />

                <SideItem
                  icon={<FiUsers />}
                  label="Experience"
                  value={
                    job.experience ||
                    job.experienceLevel ||
                    "Not specified"
                  }
                />

                <SideItem
                  icon={<FiCalendar />}
                  label="Deadline"
                  value={
                    formatDate(
                      job.deadline ||
                        job.applicationDeadline
                    ) || "Not specified"
                  }
                />

              </div>

            </Section>

            <Section title="Job Activity">

              <div className="grid grid-cols-2 gap-3">

                <Stat
                  label="Applications"
                  value={job.applicationsCount ?? 0}
                />

                <Stat
                  label="Views"
                  value={job.views ?? 0}
                />

              </div>

            </Section>

          </aside>

        </div>

      </main>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

      <h2 className="border-b border-slate-100 pb-4 text-lg font-bold text-slate-950">
        {title}
      </h2>

      <div className="pt-5">
        {children}
      </div>

    </section>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">

      <div className="flex items-center gap-2 text-blue-600">
        {icon}

        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </span>
      </div>

      <p className="mt-2 break-words text-sm font-semibold text-slate-800">
        {value}
      </p>

    </div>
  );
}

function SideItem({ icon, label, value }) {
  return (
    <div className="flex gap-3">

      <div className="mt-0.5 shrink-0 text-blue-600">
        {icon}
      </div>

      <div className="min-w-0">

        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-medium text-slate-700">
          {value || "Not specified"}
        </p>

      </div>

    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4 text-center">

      <p className="text-2xl font-bold text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-xs font-medium text-slate-500">
        {label}
      </p>

    </div>
  );
}

function StatusBadge({ status }) {
  const normalized = String(status || "active").toLowerCase();

  const isClosed =
    normalized === "closed" ||
    normalized === "inactive";

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        isClosed
          ? "bg-red-50 text-red-600"
          : "bg-green-50 text-green-600"
      }`}
    >
      {isClosed ? "Closed" : "Active"}
    </span>
  );
}

function formatDate(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
}
