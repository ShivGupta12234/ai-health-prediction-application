import { motion } from "framer-motion";

const LoadingSpinner = ({ size = "medium", text = "" }) => {
  const sizeClasses = {
    small: { outer: "h-8 w-8", inner: "h-5 w-5", dot: "h-2 w-2" },
    medium: { outer: "h-16 w-16", inner: "h-10 w-10", dot: "h-3 w-3" },
    large: { outer: "h-24 w-24", inner: "h-16 w-16", dot: "h-4 w-4" },
  };

  const s = sizeClasses[size] || sizeClasses.medium;

  return (
    <div className="flex flex-col justify-center items-center gap-4">
      <div className="relative">
        {/* Outer ring */}
        <motion.div
          className={`${s.outer} rounded-full border-2 border-accent/20`}
          style={{ borderTopColor: "rgb(99, 102, 241)" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        />
        {/* Inner ring */}
        <motion.div
          className={`absolute inset-0 m-auto ${s.inner} rounded-full border-2 border-neon-cyan/20`}
          style={{ borderBottomColor: "rgb(34, 211, 238)" }}
          animate={{ rotate: -360 }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
        />
        {/* Center dot */}
        <motion.div
          className={`absolute inset-0 m-auto ${s.dot} rounded-full bg-accent`}
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      {text && (
        <motion.p
          className="text-slate-400 text-sm font-medium"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

export default LoadingSpinner;
