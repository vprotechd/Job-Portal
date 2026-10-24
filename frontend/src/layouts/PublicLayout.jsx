import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";


export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />

      <main>
        <Outlet />
      </main>

   
    </div>
  );
}