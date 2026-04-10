import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "react-hot-toast";
import Navbar from "./Navbar";
import { Activity, Heart } from "lucide-react";

const Layout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Global Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "rgba(30, 41, 59, 0.95)",
            color: "#e2e8f0",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(12px)",
            borderRadius: "12px",
            fontSize: "14px",
            padding: "12px 16px",
          },
          success: {
            iconTheme: {
              primary: "#4ade80",
              secondary: "#0f172a",
            },
          },
          error: {
            iconTheme: {
              primary: "#f43f5e",
              secondary: "#0f172a",
            },
          },
        }}
      />

      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Premium Footer */}
      <footer className="relative mt-16 border-t border-white/[0.06]">
        {/* Gradient line at top */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* Brand */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-neon-cyan flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-white">HealthMateAI</p>
                <p className="text-xs text-slate-500">AI-Powered Health Prediction</p>
              </div>
            </div>

            {/* Center info */}
            <div className="text-center">
              <p className="text-sm text-slate-400">
                © {new Date().getFullYear()} HealthMateAI. All rights reserved.
              </p>
              <p className="text-xs text-slate-600 mt-1 flex items-center justify-center gap-1">
                Made with <Heart className="w-3 h-3 text-danger-400 inline" /> by Team 26
              </p>
            </div>

            {/* Status */}
            <div className="flex items-center justify-end space-x-4">
              <div className="flex items-center space-x-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-green opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-neon-green"></span>
                </span>
                <span className="text-xs text-slate-500">System Operational</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
