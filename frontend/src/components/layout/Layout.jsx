import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <footer className="bg-gradient-to-r from-[#0f172a] to-[#020617] text-gray-300 py-8 mt-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <p className="text-sm font-medium text-gray-200 tracking-wide">
            © 2025{" "}
            <span className="text-blue-400 font-semibold">HealthMateAI</span>.
            All rights reserved.
          </p>

        
          <div className="w-16 h-[1px] bg-gray-700 mx-auto my-3"></div>

          <p className="text-xs text-gray-400 tracking-wide">
            Made by with dedication by TeamID -{" "}
            <span className="text-gray-300 font-medium">26_CS_DS_4B_05</span>
            <span className="mx-2">•</span>
            AI-Powered Disease Prediction System
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
