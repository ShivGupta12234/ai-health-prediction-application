import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { Link } from "react-router-dom";
import {
  Activity,
  LayoutDashboard,
  Stethoscope,
  LogIn,
  LogOut,
  UserPlus,
  Menu,
  X,
  Heart,
  Linkedin,
  Mail,
  Code,
  Globe,
} from "lucide-react";
const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-gray-300">

        {/* Top section — 4 columns */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

            {/* Column 1 — Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <Activity className="w-7 h-7 text-primary-500" />
                <span className="text-xl font-bold text-white hover:opacity-80 tracking-tight">
                  HealthMateAI
                </span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed mb-6">
                AI-powered disease recognition, early diagnosis, and risk stratification system for accessible and intelligent healthcare.
              </p>
              {/* Social links */}
              <div className="flex items-center space-x-3">
                <a
                  href="https://github.com/ShivGupta12234/ai-health-prediction-application"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:bg-primary-600 hover:text-white transition-all"
                  aria-label="GitHub"
                >
                  <Code className="w-4 h-4" />
                </a>
                <a
                  href="https://healthmateai-app.vercel.app/"
                  className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:bg-primary-600 hover:text-white transition-all"
                  aria-label="Internet"
                >
                  
                  <Globe className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Column 2 — Navigation */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-widest mb-5">
                Navigation
              </h3>
              <ul className="space-y-3">
                {[
                  { label: "Home",           to: "/" },
                  { label: "Dashboard",      to: "/dashboard" },
                  { label: "New Prediction", to: "/predict" },
                  { label: "Health Results", to: "/result" },
                ].map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-gray-400 hover:text-primary-400 transition-colors hover:translate-x-1 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3 — Account */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-widest mb-5">
                Account
              </h3>
              <ul className="space-y-3">
                {[
                  { label: "HealthMateAI",   to: "/home" },
                  { label: "Login",          to: "/login" },
                  { label: "Register",       to: "/register" },
                  { label: "My Dashboard",   to: "/dashboard" },
                  { label: "Health History", to: "/dashboard" },
                ].map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-gray-400 hover:text-primary-400 transition-colors hover:translate-x-1 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4 — Project */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-widest mb-5">
                Project Details
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="https://github.com/ShivGupta12234/ai-health-prediction-application"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-400 hover:text-primary-400 transition-colors hover:translate-x-1 inline-block"
                  >
                    GitHub Repository
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/ShivGupta12234/ai-health-prediction-application/blob/main/README.MD"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-400 hover:text-primary-400 transition-colors hover:translate-x-1 inline-block"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/ShivGupta12234/ai-health-prediction-application/blob/main/DEPLOYMENT.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-400 hover:text-primary-400 transition-colors hover:translate-x-1 inline-block"
                  >
                    Deployment Guide
                  </a>
                </li>
                
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-600" />

        {/* Bottom bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-col items-center justify-between gap-5">
            <p className="text-sm text-gray-500 flex items-center space-x-1 mt-2">
              <span><b>Disclaimer: </b>The predictions of this application are generated by an AI system for informational purposes only and are in no way a substitute for professional medical advice{" · "}Consult a qualified healthcare professional for proper diagnosis{" · "}In case of emergency, contact your local emergency services immediately{" · "}This is a college-level AI-based project.</span>
            </p>
            <p className="text-sm text-gray-500 flex items-center space-x-1">
              <span>© 2026 HEALTHMATEAI. All rights reserved. </span>
              <p className="text-sm text-gray-500 flex items-center">
              Made with  <Heart className="w-3.5 h-3.5 text-danger-500 mx-1 fill-danger-500" />
              <span>by TeamID{" · "}26_CS_DS_4B_05 as a project which is a part of academic curriculum at PSIT, Kanpur.</span>
            </p>
            </p>
            
            
          </div>
        </div>

      </footer>
    </div>
  );
};

export default Layout;
