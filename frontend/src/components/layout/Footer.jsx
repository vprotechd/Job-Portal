
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-14">

        <div className="grid gap-10 md:grid-cols-4">

          {/* Jobify */}
          <div>
            <h2 className="text-xl font-bold">Jobify</h2>

            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">
              Connecting talented people with meaningful opportunities and
              helping businesses find the right talent.
            </p>
          </div>

          {/* For Job Seekers */}
          <div>
            <h3 className="font-semibold">For Job Seekers</h3>

            <div className="mt-4 flex flex-col gap-3 text-sm text-slate-400">
              <Link to="/jobs" className="hover:text-white">
                Find Jobs
              </Link>

              <Link to="/register" className="hover:text-white">
                Create Profile
              </Link>

              <Link to="/register" className="hover:text-white">
                Build Resume
              </Link>
            </div>
          </div>

          {/* For Employers */}
          <div>
            <h3 className="font-semibold">For Employers</h3>

            <div className="mt-4 flex flex-col gap-3 text-sm text-slate-400">
              <Link to="/register" className="hover:text-white">
                Post a Job
              </Link>

              <Link to="/register" className="hover:text-white">
                Find Candidates
              </Link>
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold">Company</h3>

            <div className="mt-4 flex flex-col gap-3 text-sm text-slate-400">
              <Link to="/about" className="hover:text-white">
                About
              </Link>

              <Link to="/contact" className="hover:text-white">
                Contact
              </Link>

              <Link to="/privacy-policy" className="hover:text-white">
                Privacy Policy
              </Link>

              <Link to="/terms" className="hover:text-white">
                Terms & Conditions
              </Link>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="mt-12 border-t border-slate-800 pt-6 text-sm text-slate-500">
          © {new Date().getFullYear()} Jobify. All rights reserved.
        </div>

      </div>
    </footer>
  );
}
