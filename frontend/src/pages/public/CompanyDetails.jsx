import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FiBriefcase,
  FiGlobe,
  FiMapPin,
  FiUsers,
} from "react-icons/fi";
import api from "../../services/api";
import BackLink from "../../components/layout/BackLink";

export default function CompanyDetails() {
  const { id } = useParams();

  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [following, setFollowing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCompany();
    }
  }, [id]);

  const fetchCompany = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/companies/${id}`);
      const data = response.data;
      if (!data?.success) throw new Error(data?.message || "Company not found");

      const companyData = data.company || data.data;

      setCompany(companyData);

      /*
       * The backend can return jobs along with the company.
       * If it doesn't, this remains an empty array.
       */
      setJobs(data.jobs || companyData?.jobs || []);
    } catch (err) {
      console.error("Fetch company error:", err);
      setError("Unable to load this company.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">
          Loading company details...
        </p>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <FiBriefcase className="text-xl text-slate-400" />
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-950">
            Company not found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            This company may have been removed or is no longer available.
          </p>

          <Link
            to="/companies"
            className="mt-6 inline-flex rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Browse Companies
          </Link>

        </div>
      </div>
    );
  }

  const companyName = company.name || "Company";

  const companyLogo =
    company.logo ||
    company.companyLogo;

  const industry =
    company.industry ||
    company.category;

  const location =
    company.location ||
    company.address;

  const employees =
    company.employeeCount ||
    company.employees ||
    company.companySize;

  const website =
    company.website ||
    company.websiteUrl;

  const description =
    company.description ||
    "No company description has been provided yet.";

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Company Header */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10">

          <BackLink to="/companies" className="mb-8">Back to companies</BackLink>

          <div className="flex flex-col gap-6 md:flex-row md:items-center">

            {/* Logo */}
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-blue-50 text-3xl font-bold text-blue-600">

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

              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div>
                  <h1 className="text-3xl font-bold text-slate-950 md:text-4xl">
                    {companyName}
                  </h1>

                  {industry && (
                    <p className="mt-2 text-slate-500">
                      {industry}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => setFollowing(!following)}
                  className={`rounded-xl px-6 py-3 text-sm font-semibold transition ${
                    following
                      ? "border border-slate-300 bg-white text-slate-700"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {following ? "Following" : "Follow Company"}
                </button>

              </div>

              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500">

                {location && (
                  <span className="flex items-center gap-2">
                    <FiMapPin />
                    {location}
                  </span>
                )}

                {employees && (
                  <span className="flex items-center gap-2">
                    <FiUsers />
                    {employees} employees
                  </span>
                )}

                {website && (
                  <a
                    href={
                      website.startsWith("http")
                        ? website
                        : `https://${website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                  >
                    <FiGlobe />
                    Visit website
                  </a>
                )}

              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[1fr_360px]">

          {/* Main */}
          <div className="space-y-8">

            {/* About */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8">

              <h2 className="text-2xl font-bold text-slate-950">
                About {companyName}
              </h2>

              <p className="mt-5 whitespace-pre-line leading-8 text-slate-600">
                {description}
              </p>

            </div>

            {/* Open Jobs */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8">

              <div className="flex items-center justify-between">

                <div>
                  <h2 className="text-2xl font-bold text-slate-950">
                    Open positions
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Current opportunities at {companyName}
                  </p>
                </div>

                <span className="text-sm font-medium text-blue-600">
                  {jobs.length}{" "}
                  {jobs.length === 1 ? "job" : "jobs"}
                </span>

              </div>

              {/* No Jobs */}
              {jobs.length === 0 && (
                <div className="mt-6 rounded-xl border border-dashed border-slate-300 px-6 py-12 text-center">

                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                    <FiBriefcase className="text-slate-400" />
                  </div>

                  <h3 className="mt-4 font-semibold text-slate-950">
                    No open positions
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    This company currently has no active job postings.
                  </p>

                </div>
              )}

              {/* Recruiter Jobs */}
              {jobs.length > 0 && (
                <div className="mt-6 space-y-4">

                  {jobs.map((job) => {

                    const jobId =
                      job._id || job.id;

                    const jobType =
                      job.jobType || job.type;

                    const experience =
                      job.experience ||
                      job.experienceLevel;

                    return (
                      <div
                        key={jobId}
                        className="rounded-xl border border-slate-200 p-5 transition hover:border-blue-200 hover:shadow-sm"
                      >

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                          <div>

                            <h3 className="font-bold text-slate-950">
                              {job.title}
                            </h3>

                            <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">

                              {job.location && (
                                <span className="flex items-center gap-1.5">
                                  <FiMapPin />
                                  {job.location}
                                </span>
                              )}

                              {jobType && (
                                <span className="flex items-center gap-1.5">
                                  <FiBriefcase />
                                  {jobType}
                                </span>
                              )}

                              {experience && (
                                <span>
                                  {experience}
                                </span>
                              )}

                            </div>

                          </div>

                          <Link
                            to={`/jobs/${jobId}`}
                            className="shrink-0 rounded-lg border border-blue-600 px-5 py-2.5 text-center text-sm font-semibold text-blue-600 transition hover:bg-blue-600 hover:text-white"
                          >
                            View Job
                          </Link>

                        </div>

                      </div>
                    );
                  })}

                </div>
              )}

            </div>

          </div>

          {/* Sidebar */}
          <aside className="space-y-6">

            <div className="rounded-2xl border border-slate-200 bg-white p-6">

              <h3 className="font-bold text-slate-950">
                Company information
              </h3>

              <div className="mt-5 space-y-5">

                {industry && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Industry
                    </p>

                    <p className="mt-1 text-sm text-slate-700">
                      {industry}
                    </p>
                  </div>
                )}

                {location && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Location
                    </p>

                    <p className="mt-1 text-sm text-slate-700">
                      {location}
                    </p>
                  </div>
                )}

                {employees && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Company size
                    </p>

                    <p className="mt-1 text-sm text-slate-700">
                      {employees}
                    </p>
                  </div>
                )}

                {website && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Website
                    </p>

                    <a
                      href={
                        website.startsWith("http")
                          ? website
                          : `https://${website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block break-all text-sm text-blue-600 hover:text-blue-700"
                    >
                      {website}
                    </a>
                  </div>
                )}

              </div>

            </div>

            <div className="rounded-2xl bg-blue-600 p-6 text-white">

              <h3 className="text-xl font-bold">
                Interested in working here?
              </h3>

              <p className="mt-3 text-sm leading-6 text-blue-100">
                Explore open positions and find an opportunity that matches
                your skills and experience.
              </p>

              <Link
                to="/jobs"
                className="mt-5 block rounded-lg bg-white px-4 py-3 text-center text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
              >
                Browse Jobs
              </Link>

            </div>

          </aside>

        </div>
      </section>

    </div>
  );
}
