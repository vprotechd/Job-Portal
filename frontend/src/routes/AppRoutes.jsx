import { Routes, Route, Navigate } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout";
import ProtectedRoute from "./ProtectedRoute";

// ==================== PUBLIC PAGES ====================
import Home from "../pages/public/Home";
import Jobs from "../pages/public/Jobs";
import JobDetails from "../pages/public/JobDetails";
import Companies from "../pages/public/Companies";
import CompanyDetails from "../pages/public/CompanyDetails";
import Pricing from "../pages/public/Pricing";
import About from "../pages/public/About";
import Contact from "../pages/public/Contact";

// ==================== CANDIDATE / JOBSEEKER ====================
import CandidateDashboard from "../pages/candidate/CandidateDashboard";
import CandidateProfile from "../pages/candidate/CandidateProfile";
import CandidateApplications from "../pages/candidate/CandidateApplications";
import CandidateFavorites from "../pages/candidate/CandidateFavorites";

// ==================== RECRUITER ====================
import RecruiterDashboard from "../pages/recruiter/RecruiterDashboard";
import PostJob from "../pages/recruiter/PostJob";
import ManageJobs from "../pages/recruiter/ManageJobs";
import RecruiterApplications from "../pages/recruiter/RecruiterApplications";
import RecruiterProfile from "../pages/recruiter/RecruiterProfile";
import ViewApplications from "../pages/recruiter/ViewApplications";
import CandidateSearch from "../pages/recruiter/CandidateSearch";
import CvPackages from "../pages/recruiter/CvPackages";
import Messages from "../pages/Messages";

// ==================== ADMIN ====================
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminUsers from "../pages/admin/Users";
import AdminRecruiters from "../pages/admin/Recruiters";
import AdminJobs from "../pages/admin/Jobs";
import AdminApplications from "../pages/admin/Applications";
import AdminCompanies from "../pages/admin/Companies";
import AdminPackages from "../pages/admin/Packages";
import AdminPayments from "../pages/admin/Payments";
import AdminReports from "../pages/admin/Reports";
import AdminAnalytics from "../pages/admin/Analytics";
import AdminPricing from "../pages/admin/Pricing";
import AdminCommissions from "../pages/admin/Commissions";
import AdminFeatures from "../pages/admin/Features";
import AdminSettings from "../pages/admin/Settings";

// ==================== AUTH ====================
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import VerifyOTP from "../pages/auth/VerifyOTP";

// ==================== PROTECTED ROUTE WRAPPER ====================
const Protected = ({ role, children }) => {
  return (
    <ProtectedRoute allowedRoles={[role]}>
      {children}
    </ProtectedRoute>
  );
};

// ==================== ROUTES ====================
export default function AppRoutes() {
  return (
    <Routes>

      {/* =====================================================
          PUBLIC ROUTES
      ====================================================== */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />

        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetails />} />

        <Route path="/companies" element={<Companies />} />
        <Route path="/companies/:id" element={<CompanyDetails />} />

        <Route path="/pricing" element={<Pricing />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Route>


      {/* =====================================================
          AUTH ROUTES
      ====================================================== */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />


      {/* =====================================================
          CANDIDATE / JOBSEEKER ROUTES
      ====================================================== */}

      {/* Backward-compatible dashboard URL */}
      <Route
        path="/dashboard"
        element={
          <Protected role="jobseeker">
            <CandidateDashboard />
          </Protected>
        }
      />

      <Route
        path="/candidate/dashboard"
        element={
          <Protected role="jobseeker">
            <CandidateDashboard />
          </Protected>
        }
      />

      <Route
        path="/candidate/profile"
        element={
          <Protected role="jobseeker">
            <CandidateProfile />
          </Protected>
        }
      />

      <Route
        path="/candidate/applications"
        element={
          <Protected role="jobseeker">
            <CandidateApplications />
          </Protected>
        }
      />

      <Route
        path="/candidate/favorites"
        element={
          <Protected role="jobseeker">
            <CandidateFavorites />
          </Protected>
        }
      />

      <Route
        path="/messages"
        element={
          <Protected role="jobseeker">
            <Messages />
          </Protected>
        }
      />

      <Route
        path="/messages/:applicationId"
        element={
          <Protected role="jobseeker">
            <Messages />
          </Protected>
        }
      />


      {/* =====================================================
          RECRUITER ROUTES
      ====================================================== */}

      <Route
        path="/recruiter/dashboard"
        element={
          <Protected role="recruiter">
            <RecruiterDashboard />
          </Protected>
        }
      />

      <Route
        path="/recruiter/jobs/create"
        element={
          <Protected role="recruiter">
            <PostJob />
          </Protected>
        }
      />

      <Route
        path="/recruiter/jobs"
        element={
          <Protected role="recruiter">
            <ManageJobs />
          </Protected>
        }
      />

      <Route
        path="/recruiter/applications"
        element={
          <Protected role="recruiter">
            <RecruiterApplications />
          </Protected>
        }
      />

      <Route
        path="/recruiter/applications/view"
        element={
          <Protected role="recruiter">
            <ViewApplications />
          </Protected>
        }
      />

      <Route
        path="/recruiter/profile"
        element={
          <Protected role="recruiter">
            <RecruiterProfile />
          </Protected>
        }
      />

      <Route
        path="/recruiter/candidates"
        element={
          <Protected role="recruiter">
            <CandidateSearch />
          </Protected>
        }
      />

      <Route
        path="/recruiter/packages"
        element={
          <Protected role="recruiter">
            <CvPackages />
          </Protected>
        }
      />

      <Route
        path="/recruiter/messages"
        element={
          <Protected role="recruiter">
            <Messages />
          </Protected>
        }
      />

      <Route
        path="/recruiter/messages/:applicationId"
        element={
          <Protected role="recruiter">
            <Messages />
          </Protected>
        }
      />


      {/* =====================================================
          ADMIN ROUTES
      ====================================================== */}

      {/* Admin main dashboard */}
      <Route
        path="/admin"
        element={
          <Protected role="admin">
            <AdminDashboard />
          </Protected>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <Protected role="admin">
            <AdminDashboard />
          </Protected>
        }
      />

      <Route
        path="/admin/users"
        element={
          <Protected role="admin">
            <AdminUsers />
          </Protected>
        }
      />

      <Route
        path="/admin/recruiters"
        element={
          <Protected role="admin">
            <AdminRecruiters />
          </Protected>
        }
      />

      <Route
        path="/admin/jobs"
        element={
          <Protected role="admin">
            <AdminJobs />
          </Protected>
        }
      />

      <Route
        path="/admin/applications"
        element={
          <Protected role="admin">
            <AdminApplications />
          </Protected>
        }
      />

      <Route
        path="/admin/companies"
        element={
          <Protected role="admin">
            <AdminCompanies />
          </Protected>
        }
      />

      <Route
        path="/admin/packages"
        element={
          <Protected role="admin">
            <AdminPackages />
          </Protected>
        }
      />

      <Route
        path="/admin/payments"
        element={
          <Protected role="admin">
            <AdminPayments />
          </Protected>
        }
      />

      <Route
        path="/admin/reports"
        element={
          <Protected role="admin">
            <AdminReports />
          </Protected>
        }
      />

      <Route
        path="/admin/analytics"
        element={
          <Protected role="admin">
            <AdminAnalytics />
          </Protected>
        }
      />

      <Route
        path="/admin/pricing"
        element={
          <Protected role="admin">
            <AdminPricing />
          </Protected>
        }
      />

      <Route
        path="/admin/commission"
        element={
          <Protected role="admin">
            <AdminCommissions />
          </Protected>
        }
      />

      <Route
        path="/admin/features"
        element={
          <Protected role="admin">
            <AdminFeatures />
          </Protected>
        }
      />

      <Route
        path="/admin/settings"
        element={
          <Protected role="admin">
            <AdminSettings />
          </Protected>
        }
      />


      {/* =====================================================
          404 FALLBACK
      ====================================================== */}
      <Route path="*" element={<NavigateFallback />} />

    </Routes>
  );
}


// ==========================================================
// 404 PAGE
// ==========================================================
function NavigateFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">

        <h1 className="text-2xl font-bold text-slate-900">
          Page not found
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          The page you requested does not exist.
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Go Back
          </button>

          <a
            href="/"
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Go Home
          </a>
        </div>

      </div>
    </div>
  );
}