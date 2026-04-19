import { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

const ConfirmModal = ({
  isOpen,
  onConfirm,
  onCancel,
  title        = "Are you sure?",
  message      = "Please confirm you want to continue.",
  confirmLabel = "Confirm",
  cancelLabel  = "Cancel",
  variant      = "warning",
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const styles = {
    danger: {
      badge:   "bg-red-100",
      icon:    "text-red-600",
      button:  "bg-gradient-to-r from-red-600 via-red-700 to-red-600 hover:from-red-700 hover:to-red-700",
    },
    warning: {
      badge:   "bg-red-100",
      icon:    "text-red-600",
      button:  "bg-gradient-to-r from-red-500 via-red-600 to-red-500 hover:from-red-600 hover:to-red-600",
    },
    primary: {
      badge:   "bg-red-100",
      icon:    "text-blue-600",
      button:  "bg-gradient-to-r from-red-600 via-red-700 to-red-600 hover:from-red-700 hover:to-red-700",
    },
  };
  const s = styles[variant] ?? styles.warning;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />

      
      <div className="relative w-full max-w-sm sm:max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-[fadeInScale_0.18s_ease-out]">

        
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        
        <div className="px-6 pt-8 pb-6 text-center">
          
          <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full mb-4 ${s.badge}`}>
            <AlertTriangle className={`w-7 h-7 ${s.icon}`} />
          </div>

          <h2
            id="confirm-modal-title"
            className="text-lg sm:text-xl font-bold text-gray-900 mb-2"
          >
            {title}
          </h2>
          <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
            {message}
          </p>
        </div>

        
        <div className="flex flex-col-reverse sm:flex-row gap-3 px-6 pb-6">
          
          <button
            onClick={onCancel}
            className="flex-1 px-5 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-gray-700 font-semibold text-sm hover:bg-gray-50 hover:border-gray-300 active:scale-95 transition-all"
          >
            {cancelLabel}
          </button>

          
          <button
            onClick={onConfirm}
            className={`flex-1 px-5 py-2.5 rounded-xl text-white font-semibold text-sm active:scale-95 transition-all shadow-md ${s.button}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;