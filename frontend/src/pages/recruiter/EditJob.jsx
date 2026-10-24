
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FiSave,
  FiBriefcase,
  FiMapPin,
  FiClock,
  FiDollarSign,
  FiUsers,
  FiCalendar,
} from "react-icons/fi";
import { toast } from "react-toastify";
import api from "../../services/api";
import BackLink from "../../components/layout/BackLink";

const JOB_TYPES = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
  { value: "freelance", label: "Freelance" },
];

const WORK_MODES = [
  { value: "onsite", label: "On-site" },
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
];

const initialForm = {
  title: "",
  company: "",
  location: "",
  jobType: "full-time",
  workMode: "onsite",
  salaryMin: "",
  salaryMax: "",
  experience: "",
  deadline: "",
  skills: "",
  description: "",
  requirements: "",
  responsibilities: "",
};

const toList = (value) =>
  Array.isArray(value)
    ? value.map((item) => String(item).trim()).filter(Boolean)
    : String(value || "")
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);

const toLines = (value) =>
  Array.isArray(value) ? value.join("\n") : String(value || "");

export default function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadJob();
  }, [id]);

  const loadJob = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        `/recruiter/jobs/${id}`
      );

      const job =
        response.data?.job ||
        response.data?.data ||
        response.data;

      const jobTypeValue = String(job.jobType || "full-time").toLowerCase();
      const workModeValue = String(job.workMode || "onsite").toLowerCase();

      setForm({
        title: job.title || "",
        company:
          typeof job.company === "object"
            ? job.company?.name || ""
            : job.company || "",
        location: job.location || "",
        jobType: jobTypeValue,
        workMode: workModeValue,
        salaryMin:
          job.salaryMin === null || job.salaryMin === undefined
            ? ""
            : String(job.salaryMin),
        salaryMax:
          job.salaryMax === null || job.salaryMax === undefined
            ? ""
            : String(job.salaryMax),
        experience: job.experience || "",
        deadline: formatDateForInput(job.applicationDeadline),
        skills: Array.isArray(job.skills)
          ? job.skills.join(", ")
          : job.skills || "",
        description: job.description || "",
        requirements: toLines(job.requirements),
        responsibilities: toLines(job.responsibilities),
      });
    } catch (error) {
      console.error("Load edit job error:", error);

      toast.error(
        error.response?.data?.message ||
          "Unable to load job."
      );

      navigate("/recruiter/jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const saveJob = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      toast.error("Job title is required.");
      return;
    }

    if (!form.description.trim()) {
      toast.error("Job description is required.");
      return;
    }

    try {
      setSaving(true);

      if (
        form.salaryMin !== "" &&
        form.salaryMax !== "" &&
        Number(form.salaryMin) > Number(form.salaryMax)
      ) {
        toast.error(
          "Minimum salary cannot be greater than maximum salary."
        );
        setSaving(false);
        return;
      }

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        jobType: form.jobType,
        workMode: form.workMode,
        experience: form.experience.trim(),
        salaryMin:
          form.salaryMin === "" ? null : Number(form.salaryMin),
        salaryMax:
          form.salaryMax === "" ? null : Number(form.salaryMax),
        skills: String(form.skills || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        requirements: toList(form.requirements),
        responsibilities: toList(form.responsibilities),
        applicationDeadline: form.deadline || null,
      };

      const response = await api.put(
        `/recruiter/jobs/${id}`,
        payload
      );

      toast.success(
        response.data?.message ||
          "Job updated successfully."
      );

      navigate("/recruiter/jobs");
    } catch (error) {
      console.error("Update job error:", error);

      toast.error(
        error.response?.data?.message ||
          "Unable to update job."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 text-sm text-slate-500">
            Loading job...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">

      <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">

          <BackLink to="/recruiter/jobs">Back to Jobs</BackLink>

          <p className="text-sm text-slate-500">
            Update your job posting
          </p>

        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="h-2 bg-blue-600" />

          <div className="p-6 sm:p-8">

            <div className="mb-8">

              <p className="text-sm font-semibold text-blue-600">
                Recruiter Jobs
              </p>

              <h1 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">
                Edit Job
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Update the information below and save
                your changes.
              </p>

            </div>

            <form
              onSubmit={saveJob}
              className="space-y-7"
            >

              {/* BASIC INFORMATION */}
              <div>

                <h2 className="mb-4 text-lg font-bold text-slate-950">
                  Basic Information
                </h2>

                <div className="grid gap-5 sm:grid-cols-2">

                  <Field
                    label="Job Title"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g. Full Stack Developer"
                    required
                    icon={<FiBriefcase />}
                  />

                  <Field
                    label="Company"
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    placeholder="Company name"
                    icon={<FiBriefcase />}
                    readOnly
                  />

                  <Field
                    label="Location"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="e.g. Mohali"
                    icon={<FiMapPin />}
                  />

                  <SelectField
                    label="Job Type"
                    name="jobType"
                    value={form.jobType}
                    onChange={handleChange}
                    icon={<FiClock />}
                    options={JOB_TYPES}
                  />

                  <SelectField
                    label="Work Mode"
                    name="workMode"
                    value={form.workMode}
                    onChange={handleChange}
                    icon={<FiMapPin />}
                    options={WORK_MODES}
                  />

                  <Field
                    label="Minimum Salary (INR)"
                    name="salaryMin"
                    type="number"
                    value={form.salaryMin}
                    onChange={handleChange}
                    placeholder="e.g. 25000"
                    icon={<FiDollarSign />}
                  />

                  <Field
                    label="Maximum Salary (INR)"
                    name="salaryMax"
                    type="number"
                    value={form.salaryMax}
                    onChange={handleChange}
                    placeholder="e.g. 40000"
                    icon={<FiDollarSign />}
                  />

                  <Field
                    label="Experience"
                    name="experience"
                    value={form.experience}
                    onChange={handleChange}
                    placeholder="e.g. 1-3 years"
                    icon={<FiUsers />}
                  />

                  <div className="sm:col-span-2">

                    <label className="mb-2 block text-sm font-semibold text-slate-800">
                      Application Deadline
                    </label>

                    <div className="relative">

                      <FiCalendar className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                      <input
                        type="date"
                        name="deadline"
                        value={form.deadline}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />

                    </div>

                  </div>

                </div>

              </div>

              {/* SKILLS */}
              <TextArea
                label="Skills (comma separated)"
                name="skills"
                value={form.skills}
                onChange={handleChange}
                placeholder="e.g. React, Node.js, MongoDB"
                rows={2}
              />

              {/* DESCRIPTION */}
              <TextArea
                label="Job Description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the role, team and opportunity..."
                rows={8}
                required
              />

              {/* REQUIREMENTS */}
              <TextArea
                label="Requirements"
                name="requirements"
                value={form.requirements}
                onChange={handleChange}
                placeholder="List the skills, qualifications and experience required..."
                rows={7}
              />

              {/* RESPONSIBILITIES */}
              <TextArea
                label="Responsibilities"
                name="responsibilities"
                value={form.responsibilities}
                onChange={handleChange}
                placeholder="Describe the key responsibilities..."
                rows={7}
              />

              {/* ACTIONS */}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">

                <Link
                  to="/recruiter/jobs"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FiSave />

                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>

              </div>

            </form>

          </div>
        </section>

      </main>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  icon,
  type = "text",
  readOnly = false,
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-semibold text-slate-800">
        {label}
        {required && " *"}
      </label>

      <div className="relative">

        {icon && (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        )}

        <input
          type={type}
          min={type === "number" ? 0 : undefined}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          readOnly={readOnly}
          placeholder={placeholder}
          className={`w-full rounded-xl border border-slate-200 py-3 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
            readOnly ? "cursor-not-allowed bg-slate-50 text-slate-500" : "bg-white"
          } ${icon ? "pl-11" : "pl-4"}`}
        />

      </div>

    </div>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  icon,
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-semibold text-slate-800">
        {label}
      </label>

      <div className="relative">

        {icon && (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        )}

        <select
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
            icon ? "pl-11" : "pl-4"
          }`}
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>

      </div>

    </div>
  );
}

function TextArea({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows,
  required = false,
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-semibold text-slate-800">
        {label}
        {required && " *"}
      </label>

      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
        className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />

    </div>
  );
}

function formatDateForInput(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().split("T")[0];
}
