import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Search } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 relative">
      {/* Ambient glows */}
      <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-accent/8 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md relative z-10"
      >
        {/* 404 Number */}
        <motion.div
          className="mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        >
          <span className="text-8xl sm:text-9xl font-extrabold gradient-text">
            404
          </span>
        </motion.div>

        {/* Icon */}
        <motion.div
          className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/[0.04] border border-white/[0.08] mb-6"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Search className="w-10 h-10 text-slate-600" />
        </motion.div>

        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
          Page Not Found
        </h1>
        <p className="text-slate-400 mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="btn-primary px-6 py-3 inline-flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="btn-secondary px-6 py-3 inline-flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
