
import { useState } from "react";
import {
  Phone,
  MapPin,
  AlertTriangle,
  X,
  ExternalLink,
  Navigation,
  PhoneCall,
} from "lucide-react";

const getSpecialist = (disease) => {
  const d = (disease || "").toLowerCase();
  if (
    /heart|cardiac|coronary|hypertension|angina|arrhythmia|chest pain/.test(d)
  )
    return "cardiologist";
  if (/diabetes|thyroid|endocrine|hormonal|insulin|blood sugar/.test(d))
    return "endocrinologist";
  if (
    /lung|asthma|pneumonia|respiratory|bronchitis|tuberculosis|copd|wheez/.test(
      d,
    )
  )
    return "pulmonologist";
  if (/neuro|brain|migraine|seizure|parkinson|alzheimer|stroke|epilep/.test(d))
    return "neurologist";
  if (/kidney|renal|urinary|nephro/.test(d)) return "nephrologist";
  if (/skin|dermat|eczema|psoriasis/.test(d)) return "dermatologist";
  if (/gastro|stomach|digestive|liver|colon|hepatitis|ulcer|jaundice/.test(d))
    return "gastroenterologist";
  if (/cancer|tumor|leukemia|lymphoma|oncol/.test(d)) return "oncologist";
  if (/bone|joint|arthritis|fracture|ortho|back pain/.test(d))
    return "orthopedist";
  if (/eye|vision|cataract|glaucoma|retina/.test(d)) return "ophthalmologist";
  if (/ear|nose|throat|sinus|tonsil/.test(d)) return "ENT specialist";
  if (/anxiety|depression|mental|psychiatric|stress/.test(d))
    return "psychiatrist";
  if (/dengue|malaria|typhoid|fever|infection|viral|bacterial|flu/.test(d))
    return "general physician";
  return "general practitioner";
};


const EMERGENCY_CONTACTS = [
  { number: "112", label: "National Emergency", flag: "🚨" },
  { number: "108", label: "Ambulance", flag: "🚑" },
  { number: "102", label: "Ambulance (Alt)", flag: "🏥" },
  { number: "1800-180-1104", label: "National Health Helpline", flag: "📞" },
];

const EmergencySOS = ({ predictedDisease, riskLevel }) => {
  const specialist = getSpecialist(predictedDisease);
  const isCritical = riskLevel === "Critical" || riskLevel === "High";
  const [locState, setLocState] = useState("idle"); // idle | requesting | granted | denied | error
  const [coords, setCoords] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocState("error");
      return;
    }
    setLocState("requesting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocState("granted");
      },
      () => setLocState("denied"),
      { timeout: 12000 },
    );
  };

  
  const mapEmbedUrl = coords
    ? `https://maps.google.com/maps?q=${encodeURIComponent(specialist + " hospital")}&ll=${coords.lat},${coords.lng}&z=13&output=embed`
    : null;

  const mapsLink = coords
    ? `https://www.google.com/maps/search/${encodeURIComponent(specialist + " near me")}/@${coords.lat},${coords.lng},13z`
    : `https://www.google.com/maps/search/${encodeURIComponent(specialist + " near me")}`;

  return (
    <>
      
      <div className="mb-6 rounded-2xl overflow-hidden border-2 border-red-200 shadow-lg">
        {/* Header */}
        <div className="bg-gradient-to-br from-red-600 via-red-700 to-red-600 px-5 sm:px-6 py-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 flex-shrink-0 rounded-full bg-white/20 flex items-center justify-center">
              <PhoneCall className="w-5 h-5 !text-gray-50" />
            </div>
            <div>
              <h3 className="!text-gray-50 font-bold text-base sm:text-lg leading-tight">
                Emergency SOS &amp; Nearby Specialists
              </h3>
              <p className="text-red-100 text-sm mt-0.5">
                Recommended:{" "}
                <span className="font-semibold capitalize">{specialist}</span>
              </p>
            </div>
          </div>
          {isCritical && (
            <span className="bg-white dark:bg-[#161b22] text-red-600 text-xs font-bold px-3 py-1 rounded-full animate-pulse flex-shrink-0">
              URGENT
            </span>
          )}
        </div>

        
        <div className="bg-white dark:bg-[#161b22] p-5 sm:p-6 space-y-4">
          
          <div className="flex flex-col sm:flex-row gap-3">
            
            <button
              onClick={() => setShowModal(true)}
              className="flex-1 flex items-center justify-center space-x-2 
bg-gradient-to-r from-red-500 via-red-600 to-red-500 
hover:bg-none hover:bg-danger-700
!text-gray-50 py-3 px-5 rounded-xl border border-red-400 
font-bold transition-all shadow-md hover:shadow-lg 
hover:scale-[1.02] active:scale-95"
            >
              <Phone className="w-5 h-5" />
              <span>Emergency SOS</span>
            </button>

            {locState === "idle" && (
              <button
                onClick={requestLocation}
                className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 !text-gray-50 py-3 px-5 rounded-xl border border-blue-400 font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-md hover:shadow-lg"
              >
                <MapPin className="w-5 h-5" />
                <span>
                  Find Nearby{" "}
                  {specialist.charAt(0).toUpperCase() + specialist.slice(1)}s
                </span>
              </button>
            )}

            {locState === "requesting" && (
              <div className="flex-1 flex items-center justify-center space-x-2 bg-blue-50 border-2 border-blue-200 py-3 px-5 rounded-xl text-blue-600 font-medium">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-300 border-t-blue-600" />
                <span>Requesting location…</span>
              </div>
            )}

            
            {locState === "granted" && (
              <a
                href={mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 !text-gray-50 py-3 px-5 rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-md hover:shadow-lg"
              >
                <ExternalLink className="w-5 h-5" />
                <span>Open in Google Maps</span>
              </a>
            )}
          </div>

          {(locState === "denied" || locState === "error") && (
            <div className="flex items-start space-x-3 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-yellow-800">
                  {locState === "denied"
                    ? "Location permission was denied"
                    : "Geolocation is not supported by your browser"}
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  You can still search manually on Google Maps:
                </p>
                <a
                  href={mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 mt-2 text-sm font-medium text-blue-600 hover:text-blue-800 underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Search {specialist}s on Google Maps</span>
                </a>
              </div>
            </div>
          )}

          
          {locState === "granted" && mapEmbedUrl && (
            <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
              {/* Map toolbar */}
              <div className="bg-gray-50 px-4 py-2 flex items-center justify-between border-b border-gray-200">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Navigation className="w-4 h-4 text-blue-500" />
                  <span className="font-medium capitalize">
                    Nearby {specialist}s
                  </span>
                </div>
                <a
                  href={mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 hover:text-blue-700 flex items-center space-x-1 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>View larger map</span>
                </a>
              </div>

              <iframe
                title={`Nearby ${specialist}s`}
                src={mapEmbedUrl}
                width="100%"
                height="320"
                style={{ border: 0, display: "block" }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          )}


          <p className="text-xs text-gray-500 dark:text-gray-400 text-center pt-1">
            📍 Map shows real nearby{" "}
            {specialist.charAt(0).toUpperCase() + specialist.slice(1)}s via
            Google Maps. Always call emergency services (112) for
            life-threatening situations.
          </p>
        </div>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-[99998] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Emergency contacts"
        >
          
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
            aria-hidden="true"
          />

          
          <div className="relative w-full max-w-sm bg-white dark:bg-[#161b22] rounded-2xl shadow-2xl overflow-hidden animate-[sosIn_0.2s_ease-out_both]">
            
            <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Phone className="w-5 h-5 !text-gray-50 animate-pulse" />
                <h3 className="!text-gray-50 font-bold text-lg">
                  Emergency Contacts
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-white/70 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            
            <div className="p-5 space-y-3">
              <p className="text-sm text-gray-500 mb-1">
                Tap any number to call immediately
              </p>
              {EMERGENCY_CONTACTS.map(({ number, label, flag }) => (
                <a
                  key={number}
                  href={`tel:${number}`}
                  className="flex items-center justify-between w-full px-4 py-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-all hover:scale-[1.02] active:scale-95 group"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{flag}</span>
                    <div>
                      <p className="font-bold text-red-700 text-lg tracking-wider leading-none">
                        {number}
                      </p>
                      <p className="text-xs text-red-400 mt-0.5">{label}</p>
                    </div>
                  </div>
                  <Phone className="w-5 h-5 text-red-300 group-hover:text-red-600 transition-colors" />
                </a>
              ))}
              <p className="text-xs text-gray-400 text-center mt-3">
                🇮🇳 India emergency numbers · In immediate danger, call{" "}
                <strong>112</strong>
              </p>
            </div>
          </div>

          
          <style>{`
            @keyframes sosIn {
              from { opacity: 0; transform: scale(0.95) translateY(8px); }
              to   { opacity: 1; transform: scale(1) translateY(0); }
            }
          `}</style>
        </div>
      )}
    </>
  );
};

export default EmergencySOS;
