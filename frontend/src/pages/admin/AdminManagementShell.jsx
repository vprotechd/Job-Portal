import { FiRefreshCw } from "react-icons/fi";
import BackLink from "../../components/layout/BackLink";

export default function AdminManagementShell({ title, description, onRefresh, children, actions }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <BackLink to="/admin/dashboard">Back to Dashboard</BackLink>
          <div className="flex gap-2">{actions}{onRefresh && <button onClick={onRefresh} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:text-blue-600"><FiRefreshCw /> Refresh</button>}</div>
        </div>
        <p className="text-sm font-semibold text-blue-600">Admin</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-950">{title}</h1>
        <p className="mt-2 text-slate-500">{description}</p>
        <div className="mt-7">{children}</div>
      </main>
    </div>
  );
}
