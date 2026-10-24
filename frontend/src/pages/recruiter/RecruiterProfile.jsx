
import { useEffect, useMemo, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
  FiBriefcase,
  FiCheckCircle,
  FiEdit2,
  FiGlobe,
  FiLinkedin,
  FiMail,
  FiMapPin,
  FiPhone,
  FiSave,
  FiX,
} from "react-icons/fi";

import api from "../../services/api";
import BackLink from "../../components/layout/BackLink";

const emptyForm = {
  name: "",
  phone: "",
  location: "",
  headline: "",
  bio: "",
  company: "",
  designation: "",
  linkedin: "",
  website: "",
  portfolio: "",
};

const normalizeUrl = (value) => {
  if (!value) return "";

  return /^https?:\/\//i.test(value)
    ? value
    : `https://${value}`;
};

export default function RecruiterProfile() {
  const navigate = useNavigate();
  const imageRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [error, setError] = useState("");

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/recruiter/profile");
      const data = response.data?.profile;

      if (!data) {
        throw new Error(
          "Profile data was not returned by the server."
        );
      }

      setProfile(data);
      setPreview(data.profileImage || "");

      setForm({
        name: data.name || "",
        phone: data.phone || "",
        location: data.location || "",
        headline: data.headline || "",
        bio: data.bio || "",
        company: data.company || "",
        designation: data.designation || "",
        linkedin: data.linkedin || "",
        website: data.website || "",
        portfolio: data.portfolio || "",
      });
    } catch (err) {
      console.error("Recruiter profile error:", err);

      if ([401, 403].includes(err.response?.status)) {
        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");

        navigate("/login", { replace: true });
        return;
      }

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load recruiter profile."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const initials = useMemo(() => {
    const name = profile?.name || "Recruiter";

    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  }, [profile?.name]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const openEdit = () => {
    setForm({
      name: profile?.name || "",
      phone: profile?.phone || "",
      location: profile?.location || "",
      headline: profile?.headline || "",
      bio: profile?.bio || "",
      company: profile?.company || "",
      designation: profile?.designation || "",
      linkedin: profile?.linkedin || "",
      website: profile?.website || "",
      portfolio: profile?.portfolio || "",
    });

    setProfileImage(null);
    setPreview(profile?.profileImage || "");

    if (imageRef.current) {
      imageRef.current.value = "";
    }

    setEditOpen(true);
  };

  const closeEdit = () => {
    if (saving) return;

    setEditOpen(false);
    setProfileImage(null);
    setPreview(profile?.profileImage || "");

    if (imageRef.current) {
      imageRef.current.value = "";
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowed = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowed.includes(file.type)) {
      toast.error(
        "Profile picture must be JPG, JPEG, PNG or WEBP."
      );

      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(
        "Profile picture must be smaller than 5 MB."
      );

      event.target.value = "";
      return;
    }

    setProfileImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const saveProfile = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      toast.error("Name is required.");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value.trim());
      });

      if (profileImage) {
        formData.append("profileImage", profileImage);
      }

      const response = await api.put(
        "/recruiter/profile",
        formData
      );

      const updated = response.data?.profile;

      if (!updated) {
        throw new Error(
          "Updated profile was not returned by the server."
        );
      }

      setProfile(updated);
      setPreview(updated.profileImage || "");
      setEditOpen(false);
      setProfileImage(null);

      toast.success(
        response.data?.message ||
          "Profile updated successfully."
      );
    } catch (err) {
      console.error(
        "Save recruiter profile error:",
        err
      );

      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Unable to update recruiter profile."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

        {/* BACK BUTTON */}
        <BackLink to="/recruiter/dashboard" className="mb-6">Back to Dashboard</BackLink>

        {error ? (
          <section className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>

            <button
              type="button"
              onClick={loadProfile}
              className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Try Again
            </button>
          </section>
        ) : (
          <>
            {/* PROFILE HEADER */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              {/* COVER */}
              <div className="h-24 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 sm:h-32" />

              <div className="px-5 pb-7 sm:px-8">

                {/* IMPORTANT:
                    Image is no longer pulled too far upward.
                    This prevents overlap on tablet/mobile screens.
                */}
                <div className="relative -mt-10 sm:-mt-12">

                  <div className="flex flex-col gap-5">

                    {/* PROFILE IMAGE + NAME */}
                    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end sm:gap-5">

                      {/* PROFILE IMAGE */}
                      <div className="relative z-10 flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-blue-50 text-2xl font-bold text-blue-600 shadow-lg sm:h-28 sm:w-28">
                        {profile?.profileImage ? (
                          <img
                            src={profile.profileImage}
                            alt={
                              profile.name ||
                              "Recruiter"
                            }
                            className="block h-full w-full object-cover"
                          />
                        ) : (
                          initials
                        )}
                      </div>

                      {/* NAME / DESIGNATION */}
                      <div className="min-w-0 flex-1 pb-0 text-center sm:pb-1 sm:text-left">

                        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">

                          <h1 className="break-words text-2xl font-bold text-slate-950 sm:text-3xl">
                            {profile?.name ||
                              "Recruiter"}
                          </h1>

                          {profile?.isVerified && (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                              <FiCheckCircle />
                              Verified
                            </span>
                          )}
                        </div>

                        <p className="mt-1 break-words text-sm text-slate-500">
                          {profile?.designation ||
                            profile?.headline ||
                            "Recruiter Profile"}
                        </p>
                      </div>

                    </div>

                    {/* EDIT BUTTON */}
                    <div className="flex justify-center sm:justify-end">

                      <button
                        type="button"
                        onClick={openEdit}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:w-auto"
                      >
                        <FiEdit2 size={16} />
                        Edit Profile
                      </button>

                    </div>

                  </div>

                </div>

                {/* CONTACT / COMPANY INFORMATION */}
                <div className="mt-7 grid gap-3 border-t border-slate-100 pt-6 sm:grid-cols-2 lg:grid-cols-4">

                  <ProfileItem
                    icon={<FiMail />}
                    label="Email"
                    value={
                      profile?.email || "—"
                    }
                  />

                  <ProfileItem
                    icon={<FiPhone />}
                    label="Phone"
                    value={
                      profile?.phone || "—"
                    }
                  />

                  <ProfileItem
                    icon={<FiMapPin />}
                    label="Location"
                    value={
                      profile?.location || "—"
                    }
                  />

                  <ProfileItem
                    icon={<FiBriefcase />}
                    label="Company"
                    value={
                      profile?.company || "—"
                    }
                  />

                </div>

              </div>
            </section>

            {/* PROFILE DETAILS */}
            <div className="mt-6 grid gap-6 lg:grid-cols-3">

              {/* ABOUT */}
              <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-2">

                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">

                  <div>
                    <h2 className="font-bold text-slate-950">
                      About
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Professional information
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={openEdit}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Edit
                  </button>

                </div>

                <div className="mt-5 space-y-5">

                  <Detail
                    label="Professional Headline"
                    value={profile?.headline}
                  />

                  <Detail
                    label="About Me"
                    value={profile?.bio}
                    multiline
                  />

                  <Detail
                    label="Designation"
                    value={profile?.designation}
                  />

                </div>

              </section>

              {/* PROFESSIONAL LINKS */}
              <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <FiGlobe />
                  </div>

                  <div className="min-w-0">
                    <h2 className="font-bold text-slate-950">
                      Professional Links
                    </h2>

                    <p className="text-sm text-slate-500">
                      Online presence
                    </p>
                  </div>

                </div>

                <div className="mt-5 space-y-3">

                  <LinkItem
                    icon={<FiLinkedin />}
                    label="LinkedIn"
                    value={profile?.linkedin}
                  />

                  <LinkItem
                    icon={<FiGlobe />}
                    label="Website"
                    value={profile?.website}
                  />

                  <LinkItem
                    icon={<FiGlobe />}
                    label="Portfolio"
                    value={profile?.portfolio}
                  />

                </div>

              </section>

            </div>
          </>
        )}
      </main>

      {/* EDIT PROFILE MODAL */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/50 p-3 sm:items-center sm:p-4">

          <div className="my-2 max-h-[96vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl sm:my-0 sm:max-h-[92vh]">

            {/* MODAL HEADER */}
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 sm:px-6 sm:py-5">

              <div className="min-w-0">
                <p className="text-sm font-semibold text-blue-600">
                  Recruiter Profile
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-950">
                  Edit Profile
                </h2>
              </div>

              <button
                type="button"
                onClick={closeEdit}
                disabled={saving}
                className="ml-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <FiX size={20} />
              </button>

            </div>

            {/* FORM */}
            <form
              onSubmit={saveProfile}
              className="max-h-[calc(96vh-75px)] overflow-y-auto sm:max-h-[calc(92vh-75px)]"
            >

              <div className="space-y-5 p-5 sm:p-6">

                {/* PROFILE IMAGE */}
                <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center">

                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100 font-bold text-blue-600">

                    {preview ? (
                      <img
                        src={preview}
                        alt="Preview"
                        className="block h-full w-full object-cover"
                      />
                    ) : (
                      initials
                    )}

                  </div>

                  <div className="min-w-0">

                    <p className="font-semibold text-slate-900">
                      Profile Picture
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      JPG, PNG or WEBP · maximum 5 MB
                    </p>

                    <input
                      ref={imageRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleImageChange}
                      className="mt-2 block max-w-full text-sm text-slate-600"
                    />

                  </div>

                </div>

                {/* FORM FIELDS */}
                <div className="grid gap-4 sm:grid-cols-2">

                  <Field
                    label="Full Name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />

                  <Field
                    label="Designation"
                    name="designation"
                    value={form.designation}
                    onChange={handleChange}
                    placeholder="HR Manager / Talent Acquisition"
                  />

                  <Field
                    label="Company"
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    placeholder="Company name"
                  />

                  <Field
                    label="Phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                  />

                  <Field
                    label="Location"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                  />

                  <Field
                    label="Headline"
                    name="headline"
                    value={form.headline}
                    onChange={handleChange}
                    placeholder="Connecting great people with great opportunities"
                  />

                  <Field
                    label="LinkedIn"
                    name="linkedin"
                    value={form.linkedin}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/..."
                  />

                  <Field
                    label="Website"
                    name="website"
                    value={form.website}
                    onChange={handleChange}
                    placeholder="https://company.com"
                  />

                  <Field
                    label="Portfolio"
                    name="portfolio"
                    value={form.portfolio}
                    onChange={handleChange}
                    placeholder="https://..."
                  />

                </div>

                {/* ABOUT */}
                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-800">
                    About
                  </label>

                  <textarea
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    rows={5}
                    maxLength={2000}
                    placeholder="Tell candidates about your role, hiring focus and company..."
                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                  />

                </div>

              </div>

              {/* MODAL FOOTER */}
              <div className="sticky bottom-0 z-20 flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">

                <button
                  type="button"
                  onClick={closeEdit}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FiSave />

                  {saving
                    ? "Saving..."
                    : "Save Profile"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}
    </div>
  );
}

function ProfileItem({ icon, label, value }) {
  return (
    <div className="min-w-0 rounded-xl bg-slate-50 p-4">

      <div className="flex min-w-0 items-center gap-2 text-blue-600">
        {icon}

        <span className="min-w-0 truncate text-xs font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </span>
      </div>

      <p
        title={value}
        className="mt-2 break-words text-sm font-semibold text-slate-800"
      >
        {value}
      </p>

    </div>
  );
}

function Detail({
  label,
  value,
  multiline = false,
}) {
  return (
    <div className="min-w-0">

      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p
        className={`mt-2 break-words text-sm leading-6 text-slate-600 ${
          multiline ? "whitespace-pre-line" : ""
        }`}
      >
        {value || "Not added yet."}
      </p>

    </div>
  );
}

function LinkItem({
  icon,
  label,
  value,
}) {
  if (!value) {
    return (
      <div className="flex min-w-0 items-center gap-3 rounded-xl border border-dashed border-slate-200 p-3 text-sm text-slate-400">

        <span className="shrink-0 text-slate-300">
          {icon}
        </span>

        <span className="min-w-0 truncate">
          {label} not added
        </span>

      </div>
    );
  }

  return (
    <a
      href={normalizeUrl(value)}
      target="_blank"
      rel="noopener noreferrer"
      className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-blue-300 hover:bg-blue-50"
    >

      <span className="shrink-0 text-blue-600">
        {icon}
      </span>

      <span
        title={value}
        className="min-w-0 break-all text-sm font-semibold text-slate-700"
      >
        {value}
      </span>

    </a>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  placeholder = "",
  required = false,
}) {
  return (
    <div className="min-w-0">

      <label className="mb-2 block text-sm font-semibold text-slate-800">
        {label}
        {required ? " *" : ""}
      </label>

      <input
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full min-w-0 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
      />

    </div>
  );
}
