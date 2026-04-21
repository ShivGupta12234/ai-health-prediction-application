import { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import { Link } from "react-router-dom";
import { Activity, Heart, Code, Globe } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import ConfirmModal from "../common/ConfirmModal";
import LoadingOverlay from "../common/LoadingOverlay";

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [modal, setModal] = useState({
    isOpen: false,
    destination: "",
    title: "",
    message: "",
    confirmLabel: "",
  });
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayMessage, setOverlayMessage] = useState("");

  const handleFooterNavClick = (e, destination) => {
    if (!user) return;
    e.preventDefault();
    setModal({
      isOpen: true,
      destination,
      title: "You're already signed in",
      message:
        destination === "/login"
          ? "Going to the Login page will end your current session. Are you sure you want to continue?"
          : "Going to the Register page will end your current session. Are you sure you want to continue?",
      confirmLabel: destination === "/login" ? "Go to Login" : "Go to Register",
      variant: "danger",
    });
  };


  const handleModalConfirm = () => {
    const dest = modal.destination;
    const message =
      dest === "/login"
        ? "Logging out!! Redirecting to Login Page…"
        : "Logging out!! Redirecting to Register Page…";

    setModal((m) => ({ ...m, isOpen: false }));


    logout();

    setOverlayMessage(message);
    setOverlayVisible(true);

    setTimeout(() => {

      navigate(dest, { replace: true });
      setOverlayVisible(false);
    }, 700);
  };

  const handleModalCancel = () => setModal((m) => ({ ...m, isOpen: false }));


  const isHandlingRef = useRef(false);

  const [showBackModal, setShowBackModal] = useState(false);

  useEffect(() => {
    if (!user) return;

    window.history.replaceState(
      { ...window.history.state, hmTagged: true },
      "",
    );

    const handlePopState = (event) => {
      if (isHandlingRef.current) return;
      isHandlingRef.current = true;

      if (event.state?.hmTagged === true) {
        isHandlingRef.current = false;
        return;
      }

      window.history.go(1);
      setShowBackModal(true);

      setTimeout(() => {
        isHandlingRef.current = false;
      }, 300);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [user, location.pathname]);

  const handleBackLeave = () => {
    setShowBackModal(false);

    setOverlayMessage("Logging out!! Redirecting to the Home Page...");
    setOverlayVisible(true);

    setTimeout(() => {
      logout();
      navigate("/", { replace: true });
      setOverlayVisible(false);
    }, 900);
  };

  const handleBackStay = () => setShowBackModal(false);

  return (
    <div className="min-h-screen bg-gray-50">

      <LoadingOverlay isVisible={overlayVisible} message={overlayMessage} />

      <Navbar />
      <main>
        <Outlet />
      </main>

      <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-gray-300">


        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">


            <div className="lg:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <Activity className="w-7 h-7 text-primary-500" />
                <span className="text-xl font-bold text-white hover:opacity-80 tracking-tight">
                  HealthMateAI
                </span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed mb-6">
                AI-powered disease recognition, early diagnosis, and risk
                stratification system for accessible and intelligent healthcare.
              </p>
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
                  aria-label="Website"
                >
                  <Globe className="w-4 h-4" />
                </a>
              </div>
            </div>



            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-widest mb-5">
                Navigation
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/"
                    className="text-sm text-gray-400 hover:text-primary-400 transition-colors hover:translate-x-1 inline-block"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dashboard"
                    className="text-sm text-gray-400 hover:text-primary-400 transition-colors hover:translate-x-1 inline-block"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/predict"
                    className="text-sm text-gray-400 hover:text-primary-400 transition-colors hover:translate-x-1 inline-block"
                  >
                    New Prediction
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dashboard"
                    state={{ scrollToRecent: true }}
                    className="text-sm text-gray-400 hover:text-primary-400 transition-colors hover:translate-x-1 inline-block"
                  >
                    Health Results
                  </Link>
                </li>
              </ul>
            </div>



            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-widest mb-5">
                Account
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/"
                    className="text-sm text-gray-400 hover:text-primary-400 transition-colors hover:translate-x-1 inline-block"
                  >
                    HealthMateAI
                  </Link>
                </li>

                <li>
                  <Link
                    to="/login"
                    onClick={(e) => handleFooterNavClick(e, "/login")}
                    className="text-sm text-gray-400 hover:text-primary-400 transition-colors hover:translate-x-1 inline-block"
                  >
                    Login
                  </Link>
                </li>

                <li>
                  <Link
                    to="/register"
                    onClick={(e) => handleFooterNavClick(e, "/register")}
                    className="text-sm text-gray-400 hover:text-primary-400 transition-colors hover:translate-x-1 inline-block"
                  >
                    Register
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dashboard"
                    className="text-sm text-gray-400 hover:text-primary-400 transition-colors hover:translate-x-1 inline-block"
                  >
                    My Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dashboard"
                    state={{ scrollToRecent: true }}
                    className="text-sm text-gray-400 hover:text-primary-400 transition-colors hover:translate-x-1 inline-block"
                  >
                    Health History
                  </Link>
                </li>
              </ul>
            </div>



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


        <div className="border-t border-gray-600" />


        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col items-center justify-center gap-5 text-center">
            <p className="text-sm text-gray-500 text-center mt-2">
              <b>Disclaimer: </b>The predictions of this application are
              generated by an AI system for informational purposes only and are
              in no way a substitute for professional medical advice{" · "}
              Consult a qualified healthcare professional for proper diagnosis
              {" · "}In case of emergency, contact your local emergency services
              immediately{" · "}This is a college-level AI-based project.
            </p>
            <p className="text-sm text-gray-500 flex flex-col sm:flex-row items-center justify-center gap-1 text-center">
              <span>© 2026 HEALTHMATEAI. All rights reserved.</span>
              <span className="flex items-center">
                Made with&nbsp;
                <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                &nbsp;by TeamID · 26_CS_DS_4B_05 as a project which is a part of
                academic curriculum at PSIT, Kanpur.
              </span>
            </p>
          </div>
        </div>
      </footer>


      <ConfirmModal
        isOpen={modal.isOpen}
        onConfirm={handleModalConfirm}
        onCancel={handleModalCancel}
        title={modal.title}
        message={modal.message}
        confirmLabel={modal.confirmLabel}
        cancelLabel="Stay on Page"
        variant="danger"
      />


      <ConfirmModal
        isOpen={showBackModal}
        onConfirm={handleBackLeave}
        onCancel={handleBackStay}
        title="Do you want to exit HealthMateAI?"
        message="Your current session will end. Do you want to continue?"
        confirmLabel="Yes, Leave"
        cancelLabel="No, Stay"
        variant="danger"
      />
    </div>
  );
};

export default Layout;
