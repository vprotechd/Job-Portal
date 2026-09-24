import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/jobify.png";
import {
  FiBriefcase,
  FiMenu,
  FiX,
  FiLogOut,
  FiUser,
  FiMessageCircle,
} from "react-icons/fi";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "./NotificationBell";


export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const { user, isAuthenticated, logout } = useAuth();

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6">

        {/* Logo */}
        <Link
          to="/"
          onClick={closeMenu}
          className="flex items-center gap-2"
        >
          <img
  src={logo}
  alt="Jobify"
  className="h-10 w-10 rounded-lg object-contain"
/>

<span className="text-xl font-bold tracking-tight text-slate-900">
  Jobify
</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">

          <Link
            to="/jobs"
            className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
          >
            Find Jobs
          </Link>

          <Link
            to="/companies"
            className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
          >
            Companies
          </Link>
{/* 
          <Link
            to="/pricing"
            className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
          >
            Pricing
          </Link> */}

          <Link
            to="/about"
            className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
          >
            About
          </Link>

        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">

          {isAuthenticated ? (
            <>
              <NotificationBell />
              <Link
                to={user?.role === "recruiter" ? "/recruiter/messages" : "/messages"}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm hover:border-blue-300 hover:text-blue-600"
                title="Messages"
              >
                <FiMessageCircle size={18} />
                <span className="hidden lg:inline">Messages</span>
              </Link>

              {/* Logged in user */}
              <Link
                to={
                  user?.role === "recruiter"
                    ? "/recruiter/dashboard"
                    : user?.role === "admin"
                    ? "/admin/dashboard"
                    : "/candidate/dashboard"
                }
                className="flex items-center gap-3 rounded-lg px-3 py-2 transition hover:bg-slate-50"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <FiUser size={18} />
                </div>

                <div>
                  <p className="max-w-[140px] truncate text-sm font-semibold text-slate-900">
                    {user?.name || "User"}
                  </p>

                  <p className="text-xs capitalize text-slate-500">
                    {user?.role || "job seeker"}
                  </p>
                </div>
              </Link>

              {/* Logout */}
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
              >
                <FiLogOut size={17} />
                Logout
              </button>
            </>
          ) : (
            <>
              {/* Login */}
              <Link
                to="/login"
                className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Login
              </Link>

              {/* Register */}
              <Link
                to="/register"
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Get Started
              </Link>
            </>
          )}

        </div>

        {/* Mobile button */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-lg p-2 text-slate-700 md:hidden"
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <FiX size={24} />
          ) : (
            <FiMenu size={24} />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-slate-200 bg-white px-6 py-5 md:hidden">

          <div className="flex flex-col gap-4">

            <Link
              to="/jobs"
              onClick={closeMenu}
              className="text-sm font-medium text-slate-700"
            >
              Find Jobs
            </Link>

            <Link
              to="/companies"
              onClick={closeMenu}
              className="text-sm font-medium text-slate-700"
            >
              Companies
            </Link>

            <Link
              to="/pricing"
              onClick={closeMenu}
              className="text-sm font-medium text-slate-700"
            >
              Pricing
            </Link>

            <Link
              to="/about"
              onClick={closeMenu}
              className="text-sm font-medium text-slate-700"
            >
              About
            </Link>

            <div className="mt-2 border-t border-slate-200 pt-4">

              {isAuthenticated ? (
                <div className="space-y-4">

                  <div className="flex gap-3">
                    <Link to={user?.role === "recruiter" ? "/recruiter/messages" : "/messages"} onClick={closeMenu} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"><FiMessageCircle /> Messages</Link>
                    <div className="flex items-center"><NotificationBell /></div>
                  </div>

                  {/* Mobile User */}
                  <Link
                    to={
                      user?.role === "recruiter"
                        ? "/recruiter/dashboard"
                        : user?.role === "admin"
                        ? "/admin/dashboard"
                        : "/candidate/dashboard"
                    }
                    onClick={closeMenu}
                    className="flex items-center gap-3 rounded-xl bg-slate-50 p-4"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <FiUser size={19} />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {user?.name || "User"}
                      </p>

                      <p className="text-xs capitalize text-slate-500">
                        {user?.role || "job seeker"}
                      </p>
                    </div>
                  </Link>

                  {/* Mobile Logout */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    <FiLogOut size={17} />
                    Logout
                  </button>

                </div>
              ) : (
                <div className="flex gap-3">

                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-center text-sm font-semibold"
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    onClick={closeMenu}
                    className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white"
                  >
                    Register
                  </Link>

                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </header>
  );
}