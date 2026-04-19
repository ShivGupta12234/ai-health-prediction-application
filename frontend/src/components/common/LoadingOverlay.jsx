const LoadingOverlay = ({ isVisible, message = "Loading…" }) => {
  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={message}
    >
      
      <div className="absolute inset-0 bg-gray-950/60 backdrop-blur-[3px]" />

      
      <div
        className="
          relative flex flex-col items-center gap-5
          bg-white rounded-2xl shadow-2xl
          px-10 py-9 mx-4
          min-w-[200px] w-full max-w-[260px]
          animate-[overlayFadeIn_0.2s_ease-out_both]
        "
      >
        
        <div className="relative w-12 h-12 flex-shrink-0">
          
          <svg
            className="absolute inset-0 w-12 h-12"
            viewBox="0 0 48 48"
            fill="none"
          >
            <circle
              cx="24" cy="24" r="20"
              stroke="#DBEAFE"
              strokeWidth="4"
            />
          </svg>

          
          <svg
            className="absolute inset-0 w-12 h-12 animate-spin"
            viewBox="0 0 48 48"
            fill="none"
            style={{ animationDuration: "0.75s", animationTimingFunction: "linear" }}
          >
            <circle
              cx="24" cy="24" r="20"
              stroke="#2563EB"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="62.83"
              strokeDashoffset="47.12"
            />
          </svg>

          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          </div>
        </div>

        
        <p className="text-sm font-semibold text-gray-700 text-center leading-snug tracking-tight select-none">
          {message}
        </p>
      </div>

      
      <style>{`
        @keyframes overlayFadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default LoadingOverlay;
