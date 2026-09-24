import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiBriefcase,
  FiBookOpen,
  FiFileText,
  FiEdit2,
  FiUpload,
  FiDownload,
  FiExternalLink,
  FiLinkedin,
  FiGlobe,
  FiX,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiSearch,
  FiHeart,
  FiSend,
  FiMessageCircle,
} from "react-icons/fi";
import { toast } from "react-toastify";

import axiosClient from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function CandidateDashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const profileImageRef = useRef(null);
  const resumeRef = useRef(null);

  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editOpen, setEditOpen] = useState(false);

  const [profileImage, setProfileImage] = useState(null);
  const [resume, setResume] = useState(null);

  const [profilePreview, setProfilePreview] = useState("");

  const [form, setForm] = useState({
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
  });

  const openCandidateResume = async (download = false) => {
    if (!profile?.resume) return;
    try {
      const response = await axiosClient.get(profile.resume, { responseType: "blob" });
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

  /*
  |--------------------------------------------------------------------------
  | AUTH CHECK
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }

    if (
      user?.role &&
      user.role !== "jobseeker"
    ) {
      if (user.role === "recruiter") {
        navigate("/recruiter/dashboard", {
          replace: true,
        });
      } else if (user.role === "admin") {
        navigate("/admin/dashboard", {
          replace: true,
        });
      }
    }
  }, [
    isAuthenticated,
    user,
    navigate,
  ]);

  /*
  |--------------------------------------------------------------------------
  | LOAD PROFILE
  |--------------------------------------------------------------------------
  */

  const loadProfile = async () => {
    try {
      setLoading(true);

      const response =
        await axiosClient.get(
          `/profile/me?_=${Date.now()}`
        );

      const data =
        response?.data?.profile;

      if (!data) {
        throw new Error(
          "Profile data was not returned by the server."
        );
      }

      setProfile(data);

      setForm({
        name: data.name || "",
        phone: data.phone || "",
        location: data.location || "",
        headline: data.headline || "",
        bio: data.bio || "",
        skills: Array.isArray(data.skills)
          ? data.skills.join(", ")
          : data.skills || "",
        education: data.education || "",
        experience: data.experience || "",
        linkedin: data.linkedin || "",
        portfolio: data.portfolio || "",
      });

      setProfilePreview(
        data.profileImage || ""
      );
    } catch (error) {
      console.error(
        "Load candidate profile error:",
        error
      );

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to load your profile.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      isAuthenticated &&
      user?.role === "jobseeker"
    ) {
      loadProfile();
    }
  }, [
    isAuthenticated,
    user?.role,
  ]);

  /*
  |--------------------------------------------------------------------------
  | FORM CHANGE
  |--------------------------------------------------------------------------
  */

  const handleChange = (event) => {
    const { name, value } =
      event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | PROFILE IMAGE SELECT
  |--------------------------------------------------------------------------
  */

  const handleProfileImageChange = (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      toast.error(
        "Please select JPG, JPEG, PNG or WEBP image."
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

    const previewUrl =
      URL.createObjectURL(file);

    setProfilePreview(previewUrl);
  };

  /*
  |--------------------------------------------------------------------------
  | RESUME SELECT
  |--------------------------------------------------------------------------
  */

  const handleResumeChange = (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const allowedExtensions = [
      ".pdf",
      ".doc",
      ".docx",
    ];

    const extension =
      file.name
        .substring(
          file.name.lastIndexOf(".")
        )
        .toLowerCase();

    if (
      !allowedTypes.includes(
        file.type
      ) &&
      !allowedExtensions.includes(
        extension
      )
    ) {
      toast.error(
        "Resume must be PDF, DOC or DOCX."
      );

      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(
        "Resume must be smaller than 5 MB."
      );

      event.target.value = "";
      return;
    }

    setResume(file);
  };

  /*
  |--------------------------------------------------------------------------
  | OPEN EDIT PROFILE
  |--------------------------------------------------------------------------
  */

  const openEditProfile = () => {
    if (!profile) return;

    setForm({
      name: profile.name || "",
      phone: profile.phone || "",
      location: profile.location || "",
      headline: profile.headline || "",
      bio: profile.bio || "",
      skills: Array.isArray(
        profile.skills
      )
        ? profile.skills.join(", ")
        : profile.skills || "",
      education:
        profile.education || "",
      experience:
        profile.experience || "",
      linkedin:
        profile.linkedin || "",
      portfolio:
        profile.portfolio || "",
    });

    setProfileImage(null);
    setResume(null);

    setProfilePreview(
      profile.profileImage || ""
    );

    if (profileImageRef.current) {
      profileImageRef.current.value =
        "";
    }

    if (resumeRef.current) {
      resumeRef.current.value = "";
    }

    setEditOpen(true);
  };

  /*
  |--------------------------------------------------------------------------
  | CLOSE EDIT PROFILE
  |--------------------------------------------------------------------------
  */

  const closeEditProfile = () => {
    if (saving) return;

    setEditOpen(false);
    setProfileImage(null);
    setResume(null);

    if (profileImageRef.current) {
      profileImageRef.current.value =
        "";
    }

    if (resumeRef.current) {
      resumeRef.current.value = "";
    }

    setProfilePreview(
      profile?.profileImage || ""
    );
  };

  /*
  |--------------------------------------------------------------------------
  | SAVE PROFILE
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (!form.name.trim()) {
      toast.error(
        "Name is required."
      );
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append(
        "name",
        form.name.trim()
      );

      formData.append(
        "phone",
        form.phone.trim()
      );

      formData.append(
        "location",
        form.location.trim()
      );

      formData.append(
        "headline",
        form.headline.trim()
      );

      formData.append(
        "bio",
        form.bio.trim()
      );

      formData.append(
        "skills",
        form.skills.trim()
      );

      formData.append(
        "education",
        form.education.trim()
      );

      formData.append(
        "experience",
        form.experience.trim()
      );

      formData.append(
        "linkedin",
        form.linkedin.trim()
      );

      formData.append(
        "portfolio",
        form.portfolio.trim()
      );

      if (profileImage) {
        formData.append(
          "profileImage",
          profileImage
        );
      }

      if (resume) {
        formData.append(
          "resume",
          resume
        );
      }

      const response =
        await axiosClient.put(
          "/profile/me",
          formData
        );

      const updatedProfile =
        response?.data?.profile;

      if (!updatedProfile) {
        throw new Error(
          "Updated profile was not returned by the server."
        );
      }

      setProfile(
        updatedProfile
      );

      setForm({
        name:
          updatedProfile.name || "",
        phone:
          updatedProfile.phone || "",
        location:
          updatedProfile.location || "",
        headline:
          updatedProfile.headline || "",
        bio:
          updatedProfile.bio || "",
        skills: Array.isArray(
          updatedProfile.skills
        )
          ? updatedProfile.skills.join(
              ", "
            )
          : "",
        education:
          updatedProfile.education ||
          "",
        experience:
          updatedProfile.experience ||
          "",
        linkedin:
          updatedProfile.linkedin ||
          "",
        portfolio:
          updatedProfile.portfolio ||
          "",
      });

      setProfilePreview(
        updatedProfile.profileImage ||
          ""
      );

      setProfileImage(null);
      setResume(null);

      setEditOpen(false);

      toast.success(
        "Profile updated successfully."
      );
    } catch (error) {
      console.error(
        "Update profile error:",
        error
      );

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to update profile.";

      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | HELPERS
  |--------------------------------------------------------------------------
  */

  const getInitials = () => {
    const name =
      profile?.name ||
      user?.name ||
      "User";

    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) =>
        part.charAt(0).toUpperCase()
      )
      .join("");
  };

  const skills = Array.isArray(
    profile?.skills
  )
    ? profile.skills
    : [];

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <FiRefreshCw
              className="mx-auto animate-spin text-blue-600"
              size={36}
            />

            <p className="mt-4 text-sm font-medium text-slate-600">
              Loading your profile...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | PAGE
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* TOP SECTION */}
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-600">
              Candidate Dashboard
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Welcome,{" "}
              {profile?.name ||
                user?.name ||
                "Jobseeker"}
              !
            </h1>

            <p className="mt-2 text-slate-500">
              Manage your professional
              profile and applications.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
            >
              <FiSearch size={17} />
              Find Jobs
            </Link>

            <button
              type="button"
              onClick={() => navigate("/candidate/profile")}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <FiEdit2 size={17} />
              Edit Profile
            </button>
          </div>
        </div>

        {/* DASHBOARD GRID */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* LEFT PROFILE CARD */}
          <div className="lg:col-span-1">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="h-28 bg-gradient-to-r from-blue-600 to-blue-500" />

              <div className="-mt-14 px-6 pb-6">
                {/* PROFILE IMAGE */}
                <div className="relative inline-block">
                  {profile?.profileImage ? (
                    <img
                      src={
                        profile.profileImage
                      }
                      alt={
                        profile.name ||
                        "Profile"
                      }
                      className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-md"
                      onError={(event) => {
                        event.currentTarget.style.display =
                          "none";
                      }}
                    />
                  ) : (
                    <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-blue-100 text-3xl font-bold text-blue-600 shadow-md">
                      {getInitials()}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={
                      openEditProfile
                    }
                    className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-white shadow transition hover:bg-blue-700"
                    title="Edit profile"
                  >
                    <FiEdit2 size={15} />
                  </button>
                </div>

                {/* NAME */}
                <div className="mt-4">
                  <h2 className="text-xl font-bold text-slate-900">
                    {profile?.name ||
                      "Your Name"}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {profile?.headline ||
                      "Add your professional headline"}
                  </p>
                </div>

                {/* CONTACT */}
                <div className="mt-6 space-y-3">
                  <ProfileInfo
                    icon={<FiMail />}
                    text={
                      profile?.email ||
                      user?.email ||
                      "Email not available"
                    }
                  />

                  <ProfileInfo
                    icon={<FiPhone />}
                    text={
                      profile?.phone ||
                      "Phone not added"
                    }
                  />

                  <ProfileInfo
                    icon={<FiMapPin />}
                    text={
                      profile?.location ||
                      "Location not added"
                    }
                  />
                </div>

                {/* VERIFICATION */}
                <div className="mt-6 border-t border-slate-100 pt-5">
                  {profile?.isVerified ? (
                    <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                      <FiCheckCircle />
                      Email verified
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm font-medium text-amber-600">
                      <FiAlertCircle />
                      Email not verified
                    </div>
                  )}
                </div>

                {/* QUICK LINKS */}
                <div className="mt-5 space-y-2">
                  <Link
                    to="/jobs"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-blue-600"
                  >
                    <FiSearch />
                    Find Jobs
                  </Link>

                  <Link
                    to="/candidate/applications"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-blue-600"
                  >
                    <FiSend />
                    My Applications
                  </Link>

                  <Link
                    to="/messages"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-blue-600"
                  >
                    <FiMessageCircle />
                    Messages
                  </Link>

                  <Link
                    to="/candidate/favorites"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-blue-600"
                  >
                    <FiHeart />
                    Saved Jobs
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT CONTENT */}
          <div className="space-y-6 lg:col-span-2">
            {/* ABOUT */}
            <SectionCard
              title="About Me"
              icon={<FiUser />}
              action={
                <button
                  type="button"
                  onClick={() => navigate("/candidate/profile?section=about")}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  Edit
                </button>
              }
            >
              {profile?.bio ? (
                <p className="whitespace-pre-line text-sm leading-7 text-slate-600">
                  {profile.bio}
                </p>
              ) : (
                <EmptyText text="Add a professional summary so recruiters can learn more about you." />
              )}
            </SectionCard>

            {/* SKILLS */}
            <SectionCard
              title="Skills"
              icon={<FiBriefcase />}
              action={
                <button
                  type="button"
                  onClick={() => navigate("/candidate/profile?section=skills")}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  Edit
                </button>
              }
            >
              {skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {skills.map(
                    (skill, index) => (
                      <span
                        key={`${skill}-${index}`}
                        className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700"
                      >
                        {skill}
                      </span>
                    )
                  )}
                </div>
              ) : (
                <EmptyText text="No skills added yet." />
              )}
            </SectionCard>

            {/* EDUCATION */}
            <SectionCard
              title="Education"
              icon={<FiBookOpen />}
              action={
                <button
                  type="button"
                  onClick={() => navigate("/candidate/profile?section=education")}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  Edit
                </button>
              }
            >
              {profile?.education ? (
                <p className="whitespace-pre-line text-sm leading-7 text-slate-600">
                  {profile.education}
                </p>
              ) : (
                <EmptyText text="Add your educational qualifications." />
              )}
            </SectionCard>

            {/* EXPERIENCE */}
            <SectionCard
              title="Experience"
              icon={<FiBriefcase />}
              action={
                <button
                  type="button"
                  onClick={() => navigate("/candidate/profile?section=experience")}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  Edit
                </button>
              }
            >
              {profile?.experience ? (
                <p className="whitespace-pre-line text-sm leading-7 text-slate-600">
                  {profile.experience}
                </p>
              ) : (
                <EmptyText text="Add your professional experience." />
              )}
            </SectionCard>

            {/* RESUME */}
            <SectionCard
              title="Resume"
              icon={<FiFileText />}
              action={
                <button
                  type="button"
                  onClick={() => navigate("/candidate/profile?section=resume")}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  Update
                </button>
              }
            >
              {profile?.resume ? (
                <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-50 text-red-600">
                      <FiFileText size={22} />
                    </div>

                    <div>
                      <p className="font-semibold text-slate-900">
                        Resume
                      </p>

                      <p className="text-sm text-slate-500">
                        Your current resume
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openCandidateResume(false)}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <FiExternalLink />
                      View
                    </button>

                    <button
                      type="button"
                      onClick={() => openCandidateResume(true)}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      <FiDownload />
                      Download
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                  <FiFileText
                    className="mx-auto text-slate-400"
                    size={30}
                  />

                  <p className="mt-3 font-medium text-slate-700">
                    No resume uploaded
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Upload your resume so
                    recruiters can review
                    your profile.
                  </p>

                  <button
                    type="button"
                    onClick={
                      openEditProfile
                    }
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    <FiUpload />
                    Upload Resume
                  </button>
                </div>
              )}
            </SectionCard>

            {/* SOCIAL LINKS */}
            <SectionCard
              title="Professional Links"
              icon={<FiGlobe />}
              action={
                <button
                  type="button"
                  onClick={() => navigate("/candidate/profile?section=links")}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  Edit
                </button>
              }
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {profile?.linkedin ? (
                  <a
                    href={
                      profile.linkedin
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-blue-300 hover:bg-blue-50"
                  >
                    <FiLinkedin
                      className="text-blue-600"
                      size={20}
                    />

                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-500">
                        LinkedIn
                      </p>

                      <p className="truncate text-sm font-semibold text-slate-800">
                        {profile.linkedin}
                      </p>
                    </div>
                  </a>
                ) : null}

                {profile?.portfolio ? (
                  <a
                    href={
                      profile.portfolio
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-blue-300 hover:bg-blue-50"
                  >
                    <FiGlobe
                      className="text-blue-600"
                      size={20}
                    />

                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-500">
                        Portfolio
                      </p>

                      <p className="truncate text-sm font-semibold text-slate-800">
                        {profile.portfolio}
                      </p>
                    </div>
                  </a>
                ) : null}

                {!profile?.linkedin &&
                !profile?.portfolio ? (
                  <div className="sm:col-span-2">
                    <EmptyText text="Add your LinkedIn or portfolio link." />
                  </div>
                ) : null}
              </div>
            </SectionCard>
          </div>
        </div>
      </main>

      {/* EDIT PROFILE MODAL */}
      {editOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4">
          <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Edit Profile
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Update your professional
                  information.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  closeEditProfile
                }
                disabled={saving}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <FiX size={22} />
              </button>
            </div>

            {/* MODAL BODY */}
            <form
              onSubmit={handleSubmit}
              className="overflow-y-auto"
            >
              <div className="space-y-7 p-6">
                {/* PROFILE PHOTO */}
                <div>
                  <label className="mb-3 block text-sm font-semibold text-slate-800">
                    Profile Picture
                  </label>

                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                    {profilePreview ? (
                      <img
                        src={
                          profilePreview
                        }
                        alt="Profile preview"
                        className="h-24 w-24 rounded-full border border-slate-200 object-cover"
                      />
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-600">
                        {getInitials()}
                      </div>
                    )}

                    <div>
                      <input
                        ref={
                          profileImageRef
                        }
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={
                          handleProfileImageChange
                        }
                        className="hidden"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          profileImageRef.current?.click()
                        }
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <FiUpload />
                        Choose Picture
                      </button>

                      <p className="mt-2 text-xs text-slate-500">
                        JPG, PNG or WEBP. Maximum
                        size 5 MB.
                      </p>

                      {profileImage && (
                        <p className="mt-2 text-xs font-medium text-blue-600">
                          Selected:{" "}
                          {
                            profileImage.name
                          }
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* BASIC DETAILS */}
                <div>
                  <h3 className="mb-4 text-base font-bold text-slate-900">
                    Basic Information
                  </h3>

                  <div className="grid gap-5 md:grid-cols-2">
                    <InputField
                      label="Full Name"
                      name="name"
                      value={
                        form.name
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Enter your full name"
                      required
                    />

                    <InputField
                      label="Phone"
                      name="phone"
                      value={
                        form.phone
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Enter phone number"
                    />

                    <InputField
                      label="Location"
                      name="location"
                      value={
                        form.location
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="e.g. Delhi, India"
                    />

                    <InputField
                      label="Professional Headline"
                      name="headline"
                      value={
                        form.headline
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="e.g. Full Stack MERN Developer"
                    />
                  </div>
                </div>

                {/* BIO */}
                <div>
                  <TextAreaField
                    label="Professional Summary"
                    name="bio"
                    value={
                      form.bio
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Tell recruiters about yourself..."
                    rows={5}
                    maxLength={2000}
                  />
                </div>

                {/* SKILLS */}
                <div>
                  <InputField
                    label="Skills"
                    name="skills"
                    value={
                      form.skills
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="React, Node.js, MongoDB, JavaScript"
                  />

                  <p className="mt-1.5 text-xs text-slate-500">
                    Separate multiple skills
                    with commas.
                  </p>
                </div>

                {/* EDUCATION */}
                <div>
                  <TextAreaField
                    label="Education"
                    name="education"
                    value={
                      form.education
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Add your degree, college, university, certifications..."
                    rows={4}
                    maxLength={2000}
                  />
                </div>

                {/* EXPERIENCE */}
                <div>
                  <TextAreaField
                    label="Experience"
                    name="experience"
                    value={
                      form.experience
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Add your work experience..."
                    rows={5}
                    maxLength={3000}
                  />
                </div>

                {/* LINKS */}
                <div>
                  <h3 className="mb-4 text-base font-bold text-slate-900">
                    Professional Links
                  </h3>

                  <div className="grid gap-5 md:grid-cols-2">
                    <InputField
                      label="LinkedIn"
                      name="linkedin"
                      value={
                        form.linkedin
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="https://linkedin.com/in/username"
                    />

                    <InputField
                      label="Portfolio"
                      name="portfolio"
                      value={
                        form.portfolio
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="https://yourportfolio.com"
                    />
                  </div>
                </div>

                {/* RESUME */}
                <div>
                  <label className="mb-3 block text-sm font-semibold text-slate-800">
                    Resume
                  </label>

                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5">
                    <input
                      ref={resumeRef}
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={
                        handleResumeChange
                      }
                      className="hidden"
                    />

                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-50 text-red-600">
                          <FiFileText
                            size={22}
                          />
                        </div>

                        <div>
                          <p className="font-semibold text-slate-900">
                            {resume
                              ? resume.name
                              : profile?.resume
                              ? "Current resume uploaded"
                              : "No resume selected"}
                          </p>

                          <p className="text-xs text-slate-500">
                            PDF, DOC or DOCX,
                            maximum 5 MB
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          resumeRef.current?.click()
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-white"
                      >
                        <FiUpload />
                        Choose Resume
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* MODAL FOOTER */}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={
                    closeEditProfile
                  }
                  disabled={saving}
                  className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <FiRefreshCw className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiCheckCircle />
                      Save Profile
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| SECTION CARD
|--------------------------------------------------------------------------
*/

function SectionCard({
  title,
  icon,
  action,
  children,
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            {icon}
          </div>

          <h2 className="text-lg font-bold text-slate-900">
            {title}
          </h2>
        </div>

        {action}
      </div>

      {children}
    </section>
  );
}

/*
|--------------------------------------------------------------------------
| PROFILE INFO
|--------------------------------------------------------------------------
*/

function ProfileInfo({
  icon,
  text,
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-slate-400">
        {icon}
      </span>

      <span className="min-w-0 break-all text-slate-600">
        {text}
      </span>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| EMPTY TEXT
|--------------------------------------------------------------------------
*/

function EmptyText({ text }) {
  return (
    <p className="text-sm leading-6 text-slate-500">
      {text}
    </p>
  );
}

/*
|--------------------------------------------------------------------------
| INPUT FIELD
|--------------------------------------------------------------------------
*/

function InputField({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold text-slate-800"
      >
        {label}
        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <input
        id={name}
        name={name}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| TEXTAREA FIELD
|--------------------------------------------------------------------------
*/

function TextAreaField({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 4,
  maxLength,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold text-slate-800"
      >
        {label}
      </label>

      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className="w-full resize-y rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />

      {maxLength && (
        <p className="mt-1 text-right text-xs text-slate-400">
          {value.length}/{maxLength}
        </p>
      )}
    </div>
  );
}