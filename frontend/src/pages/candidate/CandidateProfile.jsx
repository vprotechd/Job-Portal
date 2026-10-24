import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  FiBriefcase,
  FiCheckCircle,
  FiFileText,
  FiGlobe,
  FiLinkedin,
  FiLoader,
  FiMail,
  FiSave,
  FiUpload,
  FiUser,
  FiX,
} from "react-icons/fi";
import { toast } from "react-toastify";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import BackLink from "../../components/layout/BackLink";

const EMPTY_FORM = {
  name: "",
  phone: "",
  location: "",
  headline: "",
  bio: "",
  skills: "",
  education: "",
  experience: "",
  linkedin: "",
  portfolio: "",
};

export default function CandidateProfile() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const profileImageRef = useRef(null);
  const resumeRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [profileImage, setProfileImage] = useState(null);
  const [resume, setResume] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const section = searchParams.get("section") || "basic";

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }

    if (user?.role !== "jobseeker") {
      if (user?.role === "recruiter") navigate("/recruiter/dashboard", { replace: true });
      else if (user?.role === "admin") navigate("/admin/dashboard", { replace: true });
      else navigate("/login", { replace: true });
    }
  }, [authLoading, isAuthenticated, user, navigate]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.role === "jobseeker") {
      loadProfile();
    }
  }, [authLoading, isAuthenticated, user?.role]);

  useEffect(() => {
    if (!loading && section !== "basic") {
      requestAnimationFrame(() => {
        document.getElementById(`profile-section-${section}`)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }
  }, [loading, section]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/profile/me?_=${Date.now()}`);
      const data = response?.data?.profile;

      if (!data) throw new Error("Profile data was not returned by the server.");

      setProfile(data);
      setForm({
        name: data.name || "",
        phone: data.phone || "",
        location: data.location || "",
        headline: data.headline || "",
        bio: data.bio || "",
        skills: Array.isArray(data.skills) ? data.skills.join(", ") : data.skills || "",
        education: data.education || "",
        experience: data.experience || "",
        linkedin: data.linkedin || "",
        portfolio: data.portfolio || "",
      });
      setPreview(data.profileImage || "");
    } catch (error) {
      console.error("Candidate profile load error:", error);
      toast.error(error?.response?.data?.message || "Unable to load your profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Profile picture must be JPG, JPEG, PNG or WEBP.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Profile picture must be smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    setProfileImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const openCurrentResume = async (download = false) => {
    if (!profile?.resume) return;
    try {
      const response = await api.get(profile.resume, { responseType: "blob" });
      const url = URL.createObjectURL(response.data);
      if (download) {
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "Jobify-Resume";
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
      } else {
        window.open(url, "_blank", "noopener,noreferrer");
      }
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to open your resume.");
    }
  };

  const handleResumeChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validMimeTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const validExtensions = [".pdf", ".doc", ".docx"];
    const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();

    if (!validMimeTypes.includes(file.type) && !validExtensions.includes(extension)) {
      toast.error("Resume must be PDF, DOC or DOCX.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Resume must be smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    setResume(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      toast.error("Full name is required.");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value.trim());
      });

      if (profileImage) formData.append("profileImage", profileImage);
      if (resume) formData.append("resume", resume);

      const response = await api.put("/profile/me", formData);
      const updated = response?.data?.profile;

      if (!updated) throw new Error("Updated profile was not returned by the server.");

      setProfile(updated);
      setForm({
        ...EMPTY_FORM,
        name: updated.name || "",
        phone: updated.phone || "",
        location: updated.location || "",
        headline: updated.headline || "",
        bio: updated.bio || "",
        skills: Array.isArray(updated.skills) ? updated.skills.join(", ") : updated.skills || "",
        education: updated.education || "",
        experience: updated.experience || "",
        linkedin: updated.linkedin || "",
        portfolio: updated.portfolio || "",
      });
      setPreview(updated.profileImage || "");
      setProfileImage(null);
      setResume(null);
      if (profileImageRef.current) profileImageRef.current.value = "";
      if (resumeRef.current) resumeRef.current.value = "";

      toast.success("Profile updated successfully.");

      // Return to the dashboard so the candidate immediately sees the
      // saved information. The dashboard fetches the latest profile again.
      navigate("/candidate/dashboard", { replace: true });
    } catch (error) {
      console.error("Candidate profile update error:", error);
      toast.error(error?.response?.data?.message || error?.message || "Unable to update your profile.");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <FiLoader className="mx-auto animate-spin text-blue-600" size={36} />
          <p className="mt-3 text-sm font-medium text-slate-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <BackLink to="/candidate/dashboard" className="mb-4">Back to Dashboard</BackLink>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Candidate Profile</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-950">Complete your professional profile</h1>
            <p className="mt-2 text-slate-500">Recruiters will use these details when reviewing your applications.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section id="profile-section-basic" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm scroll-mt-6">
            <SectionHeading icon={<FiUser />} title="Basic Information" description="Your name and contact details." />
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <Field label="Full Name" name="name" value={form.name} onChange={handleChange} required placeholder="Enter your full name" />
              <Field label="Phone" name="phone" value={form.phone} onChange={handleChange} placeholder="Enter phone number" />
              <Field label="Location" name="location" value={form.location} onChange={handleChange} placeholder="e.g. Delhi, India" />
              <Field label="Professional Headline" name="headline" value={form.headline} onChange={handleChange} placeholder="e.g. Full Stack MERN Developer" />
            </div>
          </section>

          <section id="profile-section-about" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm scroll-mt-6">
            <SectionHeading icon={<FiUser />} title="About Me" description="Tell recruiters about your strengths and career goals." />
            <div className="mt-6">
              <TextArea label="Professional Summary" name="bio" value={form.bio} onChange={handleChange} rows={6} maxLength={2000} placeholder="Write a short professional summary..." />
            </div>
          </section>

          <section id="profile-section-skills" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm scroll-mt-6">
            <SectionHeading icon={<FiBriefcase />} title="Skills" description="Add skills that match the jobs you want." />
            <div className="mt-6">
              <Field label="Skills" name="skills" value={form.skills} onChange={handleChange} placeholder="React, Node.js, MongoDB, JavaScript" />
              <p className="mt-2 text-xs text-slate-500">Separate multiple skills with commas.</p>
            </div>
          </section>

          <section id="profile-section-education" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm scroll-mt-6">
            <SectionHeading icon={<FiMail />} title="Education" description="Add degrees, colleges, universities and certifications." />
            <div className="mt-6">
              <TextArea label="Education Details" name="education" value={form.education} onChange={handleChange} rows={6} maxLength={2000} placeholder="B.Tech in Computer Science — ABC University — 2024&#10;Certification — ..." />
            </div>
          </section>

          <section id="profile-section-experience" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm scroll-mt-6">
            <SectionHeading icon={<FiBriefcase />} title="Experience" description="Add internships, jobs and other relevant professional experience." />
            <div className="mt-6">
              <TextArea label="Professional Experience" name="experience" value={form.experience} onChange={handleChange} rows={8} maxLength={3000} placeholder="Software Developer Intern — Company — 2024&#10;• Built ...&#10;• Worked with ..." />
            </div>
          </section>

          <section id="profile-section-links" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm scroll-mt-6">
            <SectionHeading icon={<FiGlobe />} title="Professional Links" description="Give recruiters a way to see your professional work." />
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <Field label="LinkedIn" name="linkedin" value={form.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/username" icon={<FiLinkedin />} />
              <Field label="Portfolio" name="portfolio" value={form.portfolio} onChange={handleChange} placeholder="https://yourportfolio.com" icon={<FiGlobe />} />
            </div>
          </section>

          <section id="profile-section-resume" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm scroll-mt-6">
            <SectionHeading icon={<FiFileText />} title="Resume" description="Upload the latest version of your resume." />
            <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5">
              <input ref={resumeRef} type="file" className="hidden" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleResumeChange} />
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><FiFileText size={23} /></div>
                  <div>
                    <p className="font-semibold text-slate-900">{resume?.name || (profile?.resume ? "Current resume uploaded" : "No resume uploaded")}</p>
                    <p className="text-xs text-slate-500">PDF, DOC or DOCX • Maximum 5 MB</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile?.resume && (
                    <button type="button" onClick={() => openCurrentResume(false)} className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100">View Current</button>
                  )}
                  <button type="button" onClick={() => resumeRef.current?.click()} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"><FiUpload /> Choose Resume</button>
                </div>
              </div>
            </div>
          </section>

          <section id="profile-section-photo" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm scroll-mt-6">
            <SectionHeading icon={<FiUser />} title="Profile Picture" description="Use a clear professional photo." />
            <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
              {preview ? (
                <img src={preview} alt="Profile preview" className="h-28 w-28 rounded-full border-4 border-white object-cover shadow" />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-blue-100 text-3xl font-bold text-blue-600">{initials(form.name || user?.name)}</div>
              )}
              <div>
                <input ref={profileImageRef} type="file" className="hidden" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handleImageChange} />
                <button type="button" onClick={() => profileImageRef.current?.click()} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"><FiUpload /> Choose Picture</button>
                <p className="mt-2 text-xs text-slate-500">JPG, PNG or WEBP • Maximum 5 MB</p>
              </div>
            </div>
          </section>

          <div className="sticky bottom-4 z-20 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500"><FiCheckCircle className="mr-2 inline text-green-600" />Your changes are saved to your Jobify profile.</p>
            <div className="flex gap-3">
              <Link to="/candidate/dashboard" className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"><FiX /> Cancel</Link>
              <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
                {saving ? <><FiLoader className="animate-spin" /> Saving...</> : <><FiSave /> Save Profile</>}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

function SectionHeading({ icon, title, description }) {
  return (
    <div className="flex items-start gap-3 border-b border-slate-100 pb-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">{icon}</div>
      <div><h2 className="text-lg font-bold text-slate-900">{title}</h2><p className="mt-1 text-sm text-slate-500">{description}</p></div>
    </div>
  );
}

function Field({ label, name, value, onChange, placeholder, required = false, icon }) {
  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-sm font-semibold text-slate-800">{label}{required && <span className="ml-1 text-red-500">*</span>}</label>
      <div className="relative">
        {icon && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>}
        <input id={name} name={name} value={value} onChange={onChange} required={required} placeholder={placeholder} className={`w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${icon ? "pl-10" : ""}`} />
      </div>
    </div>
  );
}

function TextArea({ label, name, value, onChange, placeholder, rows, maxLength }) {
  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-sm font-semibold text-slate-800">{label}</label>
      <textarea id={name} name={name} value={value} onChange={onChange} placeholder={placeholder} rows={rows} maxLength={maxLength} className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
      {maxLength && <p className="mt-1 text-right text-xs text-slate-400">{value.length}/{maxLength}</p>}
    </div>
  );
}

function initials(name = "Jobseeker") {
  return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "J";
}
