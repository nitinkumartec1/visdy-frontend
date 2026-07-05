import { useState, useRef } from "react";
import { registerUser, firebaseLogin } from "../api/auth.api";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { auth, googleProvider } from "../firebase";
import { signInWithPopup, sendSignInLinkToEmail } from "firebase/auth";

/* -------------------------------------------------------
   File validation limits (must match backend)
------------------------------------------------------- */
const LIMITS = {
  IMAGE_MAX_SIZE: 10 * 1024 * 1024,     // 10 MB
  IMAGE_MAX_MEGAPIXELS: 25,             // 25 MP
};

const formatSize = (bytes) => `${(bytes / (1024 * 1024)).toFixed(1)}MB`;

const getImageDimensions = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const megapixels = (img.width * img.height) / 1_000_000;
      resolve({ width: img.width, height: img.height, megapixels });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error("Could not read image dimensions"));
    };
    img.src = URL.createObjectURL(file);
  });
};

export default function Register() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
  });

  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailLinkLoading, setEmailLinkLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [emailLinkEmail, setEmailLinkEmail] = useState("");
  const [emailLinkSent, setEmailLinkSent] = useState(false);

  const handleChange = (e) => {
    setErrorMessage(""); 
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > LIMITS.IMAGE_MAX_SIZE) {
      setErrorMessage(`Avatar exceeds 10MB limit (${formatSize(file.size)} selected)`);
      e.target.value = "";
      return;
    }
    try {
      const dims = await getImageDimensions(file);
      if (dims.megapixels > LIMITS.IMAGE_MAX_MEGAPIXELS) {
        setErrorMessage(`Avatar exceeds 25MP limit (${dims.megapixels.toFixed(1)}MP — ${dims.width}×${dims.height})`);
        e.target.value = "";
        return;
      }
    } catch {
      // If we can't read dimensions, let server handle it
    }
    // FIX: Revoke old URL to prevent memory leak
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
    setErrorMessage("");
  };

  const handleCoverChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > LIMITS.IMAGE_MAX_SIZE) {
      setErrorMessage(`Cover image exceeds 10MB limit (${formatSize(file.size)} selected)`);
      e.target.value = "";
      return;
    }
    try {
      const dims = await getImageDimensions(file);
      if (dims.megapixels > LIMITS.IMAGE_MAX_MEGAPIXELS) {
        setErrorMessage(`Cover image exceeds 25MP limit (${dims.megapixels.toFixed(1)}MP — ${dims.width}×${dims.height})`);
        e.target.value = "";
        return;
      }
    } catch {
      // If we can't read dimensions, let server handle it
    }
    // FIX: Revoke old URL to prevent memory leak
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverImage(file);
    setCoverPreview(URL.createObjectURL(file));
    setErrorMessage("");
  };

  /* -------------------------------------------------------
     Traditional registration
  ------------------------------------------------------- */
  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setErrorMessage("");
    setSuccessMessage("");

    if (!form.fullName.trim()) {
      setErrorMessage("Full Name is required");
      return;
    }
    if (!form.username.trim()) {
      setErrorMessage("Username is required");
      return;
    }
    if (!form.email.trim()) {
      setErrorMessage("Email is required");
      return;
    }
    if (!form.password) {
      setErrorMessage("Password is required");
      return;
    }
    if (!avatar) {
      setErrorMessage("Please select an avatar image");
      return;
    }

    const formData = new FormData();
    formData.append("fullName", form.fullName);
    formData.append("email", form.email);
    formData.append("username", form.username);
    formData.append("password", form.password);
    formData.append("avatar", avatar);

    if (coverImage) {
      formData.append("coverImage", coverImage);
    }

    try {
      setLoading(true);
      const res = await registerUser(formData);
      
      const { user, accessToken } = res.data.data;
      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
      }
      setUser(user);
      
      setSuccessMessage("Account created successfully 🎉 redirecting...");
      
      // Delay navigation so user sees the success toast
      setTimeout(() => {
        navigate("/");
      }, 1500);

    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------------------
     Google Sign-Up via Firebase
  ------------------------------------------------------- */
  const handleGoogleSignIn = async () => {
    if (googleLoading) return;
    setErrorMessage("");

    try {
      setGoogleLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      const res = await firebaseLogin(idToken);
      const { user, accessToken } = res.data.data;

      localStorage.setItem("accessToken", accessToken);
      setUser(user);
      navigate("/");
    } catch (error) {
      if (error.code !== "auth/popup-closed-by-user") {
        setErrorMessage(
          error.response?.data?.message || "Google sign-up failed. Please try again."
        );
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  /* -------------------------------------------------------
     Email Link (passwordless) Sign-Up via Firebase
  ------------------------------------------------------- */
  const handleEmailLinkSignIn = async (e) => {
    e.preventDefault();
    if (emailLinkLoading) return;
    setErrorMessage("");

    if (!emailLinkEmail || !emailLinkEmail.includes("@")) {
      setErrorMessage("Please enter a valid email address");
      return;
    }

    try {
      setEmailLinkLoading(true);

      const actionCodeSettings = {
        url: `${window.location.origin}/finish-sign-in`,
        handleCodeInApp: true,
      };

      await sendSignInLinkToEmail(auth, emailLinkEmail, actionCodeSettings);
      localStorage.setItem("emailForSignIn", emailLinkEmail);
      setEmailLinkSent(true);
    } catch (error) {
      setErrorMessage(
        error.message || "Failed to send sign-in link. Please try again."
      );
    } finally {
      setEmailLinkLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-theme-bg selection:bg-wine-primary/30">
      <div className="w-full max-w-xl animate-in fade-in zoom-in duration-500">
        <div className="card backdrop-blur-md overflow-hidden border-theme-border">
          {/* Header / Cover Area */}
          <div 
            className="h-32 bg-gradient-to-r from-wine-primary/20 to-wine-accent/20 relative group cursor-pointer"
            onClick={() => coverInputRef.current.click()}
          >
            {coverPreview ? (
              <img src={coverPreview} className="w-full h-full object-cover" alt="Cover Preview" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-theme-muted border-b border-theme-border">
                <span className="text-sm font-medium">Click to add cover image</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-theme-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <input 
              type="file" 
              className="hidden" 
              ref={coverInputRef} 
              accept="image/*" 
              onChange={handleCoverChange} 
            />
          </div>

          <form onSubmit={submit} className="p-8 pt-0">
            {/* Avatar Section */}
            <div className="flex flex-col items-center -mt-12 mb-6 relative">
              <div 
                className="w-24 h-24 rounded-full border-4 border-[#18181b] bg-theme-card overflow-hidden group cursor-pointer relative shadow-2xl"
                onClick={() => avatarInputRef.current.click()}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} className="w-full h-full object-cover" alt="Avatar Preview" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800 text-theme-muted">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-[10px] font-bold text-theme-text uppercase tracking-wider">Change</span>
                </div>
              </div>
              <input 
                type="file" 
                className="hidden" 
                ref={avatarInputRef} 
                accept="image/*" 
                onChange={handleAvatarChange} 
                required 
              />
              <h2 className="text-2xl font-bold text-theme-text mt-4">Create Account</h2>
              <p className="text-theme-muted text-sm">Join the Visdy community today</p>
            </div>

            {/* ─── Google Sign-Up Button ─── */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-theme-border bg-theme-card hover:bg-white/5 transition-all duration-200 text-theme-text font-medium group mb-4"
            >
              {googleLoading ? (
                <div className="w-5 h-5 border-2 border-theme-muted/30 border-t-theme-text rounded-full animate-spin"></div>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Sign up with Google</span>
                </>
              )}
            </button>

            {/* ─── Email Link Sign-Up ─── */}
            {emailLinkSent ? (
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-center animate-in fade-in duration-300 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="text-green-400 font-semibold text-sm">Check your email!</p>
                <p className="text-theme-muted text-xs mt-1">
                  We sent a sign-in link to <span className="text-theme-text font-medium">{emailLinkEmail}</span>
                </p>
              </div>
            ) : (
              <div className="flex gap-2 mb-4">
                <input
                  type="email"
                  placeholder="Or sign up with email link..."
                  className="input-field flex-1"
                  value={emailLinkEmail}
                  onChange={(e) => setEmailLinkEmail(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleEmailLinkSignIn}
                  disabled={emailLinkLoading}
                  className="btn-primary px-4 py-2.5 rounded-xl whitespace-nowrap text-sm flex items-center gap-2"
                >
                  {emailLinkLoading ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <span>Send Link</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* ─── Divider ─── */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-theme-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-theme-card px-3 text-theme-muted tracking-wider">or fill in manually</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-theme-muted ml-1">Full Name</label>
                <input
                  name="fullName"
                  placeholder="John Doe"
                  className="input-field"
                  onChange={handleChange}
                  required
                  autoComplete="name"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-theme-muted ml-1">Username</label>
                <input
                  name="username"
                  placeholder="johndoe"
                  className="input-field"
                  onChange={handleChange}
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-theme-muted ml-1">Email Address</label>
                <input
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  className="input-field"
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-theme-muted ml-1">Password</label>
                <input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="input-field"
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2 group overflow-hidden relative"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Create Account</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>

            {errorMessage && (
              <div className="mt-4 p-3 rounded-xl bg-wine-glow/10 border border-wine-glow/20 text-wine-glow text-sm text-center animate-shake">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="mt-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center animate-in">
                {successMessage}
              </div>
            )}

            <p className="mt-8 text-center text-theme-muted text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-wine-glow hover:text-wine-glow font-semibold transition-colors">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
