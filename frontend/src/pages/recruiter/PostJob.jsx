import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiDollarSign,
  FiFileText,
  FiMapPin,
  FiPlus,
  FiTag,
  FiX,
} from "react-icons/fi";
import BackLink from "../../components/layout/BackLink";

export default function PostJob() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    jobType: "Full-time",
    workplace: "On-site",
    experience: "",
    salaryMin: "",
    salaryMax: "",
    description: "",
    requirements: "",
    skills: "",
    deadline: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (!formData.title.trim()) {
      setError("Job title is required.");
      return;
    }

    if (!formData.company.trim()) {
      setError("Company name is required.");
      return;
    }

    if (!formData.location.trim()) {
      setError("Location is required.");
      return;
    }

    if (!formData.description.trim()) {
      setError("Job description is required.");
      return;
    }

    if (!formData.requirements.trim()) {
      setError("Job requirements are required.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/recruiter/jobs", {
          title: formData.title.trim(),
          company: formData.company.trim(),
          location: formData.location.trim(),
          jobType: formData.jobType,
          workMode: formData.workplace,
          experience: formData.experience.trim(),
          salaryMin: formData.salaryMin
            ? Number(formData.salaryMin)
            : null,
          salaryMax: formData.salaryMax
            ? Number(formData.salaryMax)
            : null,
          description: formData.description.trim(),

          requirements: formData.requirements
            .split("\n")
            .map((item) => item.trim())
            .filter(Boolean),

          skills: formData.skills
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),

          applicationDeadline: formData.deadline || null,
        });

      const data = response.data;

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      if (!response.data?.success) {
        throw new Error(data.message || "Unable to create job.");
      }

      setSuccess(data.message || "Job posted successfully.");

      setTimeout(() => {
        navigate("/recruiter/jobs");
      }, 1200);
    } catch (err) {
      console.error("Post job error:", err);

      setError(
        err.message || "Something went wrong while posting the job."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">

          <Link
            to="/recruiter/dashboard"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-lg font-bold text-white">
              J
            </div>

            <span className="text-xl font-bold text-slate-950">
              Jobify
            </span>
          </Link>

          <BackLink to="/recruiter/dashboard">Dashboard</BackLink>

        </div>
      </header>

      {/* MAIN */}
      <main className="mx-auto max-w-4xl px-6 py-8 lg:px-8">

        {/* PAGE TITLE */}
        <div className="mb-8">

          <p className="text-sm font-semibold text-blue-600">
            Recruiter
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-950">
            Post a New Job
          </h1>

          <p className="mt-2 text-slate-500">
            Create a job listing and publish it for candidates.
          </p>

        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            <FiCheckCircle size={18} />
            {success}
          </div>
        )}

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* BASIC INFORMATION */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-6 flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <FiBriefcase size={20} />
              </div>

              <div>
                <h2 className="font-bold text-slate-950">
                  Basic Information
                </h2>

                <p className="text-sm text-slate-500">
                  Enter the basic details of the job.
                </p>
              </div>

            </div>

            <div className="grid gap-5 md:grid-cols-2">

              {/* TITLE */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Job Title *
                </label>

                <div className="relative">
                  <FiBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. React Developer"
                    className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    required
                  />
                </div>
              </div>

              {/* COMPANY */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Company Name *
                </label>

                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Company name"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>

              {/* LOCATION */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Location *
                </label>

                <div className="relative">
                  <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Mohali, Punjab"
                    className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    required
                  />
                </div>
              </div>

              {/* JOB TYPE */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Job Type
                </label>

                <select
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                  <option value="Temporary">Temporary</option>
                </select>
              </div>

              {/* WORKPLACE */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Workplace
                </label>

                <select
                  name="workplace"
                  value={formData.workplace}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="On-site">On-site</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              {/* EXPERIENCE */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Experience
                </label>

                <input
                  type="text"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="e.g. 2-4 years"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

            </div>

          </section>

          {/* SALARY */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-6 flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <FiDollarSign size={20} />
              </div>

              <div>
                <h2 className="font-bold text-slate-950">
                  Salary
                </h2>

                <p className="text-sm text-slate-500">
                  Specify the salary range for this position.
                </p>
              </div>

            </div>

            <div className="grid gap-5 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Minimum Salary
                </label>

                <input
                  type="number"
                  name="salaryMin"
                  value={formData.salaryMin}
                  onChange={handleChange}
                  placeholder="e.g. 30000"
                  min="0"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Maximum Salary
                </label>

                <input
                  type="number"
                  name="salaryMax"
                  value={formData.salaryMax}
                  onChange={handleChange}
                  placeholder="e.g. 60000"
                  min="0"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

            </div>

          </section>

          {/* DESCRIPTION */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-6 flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <FiFileText size={20} />
              </div>

              <div>
                <h2 className="font-bold text-slate-950">
                  Job Description
                </h2>

                <p className="text-sm text-slate-500">
                  Describe the role and responsibilities.
                </p>
              </div>

            </div>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={7}
              placeholder="Describe the job, responsibilities, team, and role..."
              className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
            />

          </section>

          {/* REQUIREMENTS */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-6 flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <FiCheckCircle size={20} />
              </div>

              <div>
                <h2 className="font-bold text-slate-950">
                  Requirements
                </h2>

                <p className="text-sm text-slate-500">
                  Add one requirement per line.
                </p>
              </div>

            </div>

            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              rows={6}
              placeholder={`Bachelor's degree in Computer Science
2+ years of relevant experience
Strong communication skills
Experience with REST APIs`}
              className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
            />

          </section>

          {/* SKILLS */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-6 flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <FiTag size={20} />
              </div>

              <div>
                <h2 className="font-bold text-slate-950">
                  Skills
                </h2>

                <p className="text-sm text-slate-500">
                  Separate skills with commas.
                </p>
              </div>

            </div>

            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="React, JavaScript, Node.js, MongoDB"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

          </section>

          {/* DEADLINE */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-6 flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <FiCalendar size={20} />
              </div>

              <div>
                <h2 className="font-bold text-slate-950">
                  Application Deadline
                </h2>

                <p className="text-sm text-slate-500">
                  Optional closing date for applications.
                </p>
              </div>

            </div>

            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              min={new Date().toISOString().split("T")[0]}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 md:w-1/2"
            />

          </section>

          {/* BUTTONS */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <Link
              to="/recruiter/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <FiX />
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiPlus />

              {loading ? "Publishing..." : "Publish Job"}
            </button>

          </div>

        </form>

      </main>

    </div>
  );
}