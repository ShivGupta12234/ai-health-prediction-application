import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { authAPI } from "../services/api";
import {
  User, Mail, Calendar, Users, FileText, Camera,
  ArrowLeft, Save, CheckCircle, AlertCircle, Loader2,
} from "lucide-react";
import LoadingOverlay from "../components/common/LoadingOverlay";

const ProfileEdit = () => {
  const { user, updateUser } = useAuth();
  const navigate             = useNavigate();
  const fileInputRef         = useRef(null);

  const [formData, setFormData] = useState({
    name:           user?.name           || "",
    age:            user?.age            || "",
    gender:         user?.gender         || "",
    bio:            user?.bio            || "",
    profilePicture: user?.profilePicture || "",
  });
  const [preview,  setPreview]  = useState(user?.profilePicture || null);
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be smaller than 2 MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      setFormData((prev) => ({ ...prev, profilePicture: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!formData.name.trim()) return setError("Name cannot be empty");
    if (formData.age && (formData.age < 1 || formData.age > 120))
      return setError("Please enter a valid age between 1 and 120");

    setLoading(true);
    try {
      const payload = {
        name:           formData.name.trim(),
        age:            formData.age ? parseInt(formData.age) : undefined,
        gender:         formData.gender  || undefined,
        bio:            formData.bio     || "",
        profilePicture: formData.profilePicture || undefined,
      };
      const res = await authAPI.updateProfile(payload);
      updateUser(res.data);
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <>
      
      <LoadingOverlay isVisible={loading} message="Updating profile…" />

      <div className="min-h-screen bg-gradient-to-r from-gray-100 via-blue-50 to-blue-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">

          
          <div className="mb-6">
            <Link to="/dashboard"
              className="inline-flex items-center space-x-2 
bg-gradient-to-r from-blue-500 via-blue-700 to-blue-500 text-white 
px-6 py-3 rounded-xl font-semibold 
hover:scale-[1.02] active:scale-95 
transition-all shadow-md hover:shadow-lg
border-0 dark:border dark:border-[#30363d]
disabled:opacity-60 disabled:cursor-not-allowed">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

            
            <div className="bg-gradient-to-r from-blue-800 via-blue-950 to-blue-800 px-6 sm:px-8 py-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white">Edit Your Profile</h1>
                  <p className="text-gray-400 text-sm mt-0.5">Update your personal information</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="px-6 sm:px-8 py-8 space-y-6">

              
              {success && (
                <div className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-sm font-medium text-green-700">Profile updated! Redirecting to dashboard…</p>
                </div>
              )}
              {error && (
                <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

            
              <div className="flex flex-col items-center space-y-3">
                <div className="relative">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-primary-200 shadow-lg bg-primary-100 flex items-center justify-center">
                    {preview ? (
                      <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl sm:text-3xl font-bold text-primary-600">{initials}</span>
                    )}
                  </div>
                  <button type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center shadow-md transition-colors"
                    title="Change photo">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <input ref={fileInputRef} type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden" onChange={handleImageChange} />
                <p className="text-xs text-gray-400">Click the camera icon to upload a photo (max 2 MB)</p>
              </div>

              <div className="border-t border-gray-100" />

              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input name="name" type="text" required
                    value={formData.name} onChange={handleChange}
                    className="input-field pl-10 w-full" placeholder="Your full name" />
                </div>
              </div>

              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address <span className="text-xs font-normal text-gray-400">(cannot be changed)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-300" />
                  </div>
                  <input type="email" readOnly value={user?.email || ""}
                    className="input-field pl-10 w-full bg-gray-50 text-gray-400 cursor-not-allowed" />
                </div>
              </div>

            
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input name="age" type="number" min="1" max="120"
                      value={formData.age} onChange={handleChange}
                      className="input-field pl-10 w-full" placeholder="Your age" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Users className="h-5 w-5 text-gray-400" />
                    </div>
                    <select name="gender" value={formData.gender} onChange={handleChange}
                      className="input-field pl-10 w-full appearance-none">
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bio
                  <span className="ml-2 text-xs font-normal text-gray-400">
                    ({formData.bio.length}/300 characters)
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea name="bio" rows={3} maxLength={300}
                    value={formData.bio} onChange={handleChange}
                    className="input-field pl-10 w-full resize-none"
                    placeholder="Tell us a little about yourself…" />
                </div>
              </div>

              
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button type="submit" disabled={loading || success}
                  className="flex-1 flex items-center justify-center space-x-2 
bg-gradient-to-r from-blue-500 via-blue-700 to-blue-500 text-white 
px-6 py-3 rounded-xl font-semibold 
hover:scale-[1.02] active:scale-95 
transition-all shadow-md hover:shadow-lg
border-0 dark:border dark:border-[#30363d]
disabled:opacity-60 disabled:cursor-not-allowed">
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Saving…</span>
                    </>
                  ) : success ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>

                <Link to="/dashboard"
                  className="flex-1 flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 hover:scale-[1.02] active:scale-95 transition-all shadow-md hover:shadow-lg">
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileEdit;
