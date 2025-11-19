import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <footer className="bg-gray-800 text-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">© 2025 HealthMateAI. All rights reserved.</p>
          <p className="text-xs text-gray-400 mt-2">
            Team 26_CS_DS_4B_5 - AI-Powered Disease Prediction System
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
