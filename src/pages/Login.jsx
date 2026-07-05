import { useState } from "react";
import { loginUser, firebaseLogin } from "../api/auth.api";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { auth, googleProvider } from "../firebase";
import { signInWithPopup, sendSignInLinkToEmail } from "firebase/auth";

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [identifier, setIdentifier] = useState(""); // email OR username
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailLinkLoading, setEmailLinkLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [emailLinkEmail, setEmailLinkEmail] = useState("");
  const [emailLinkSent, setEmailLinkSent] = useState(false);

  /* -------------------------------------------------------
     Traditional email/password login
  ------------------------------------------------------- */
  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setErrorMessage("");

    if (!identifier || !password) {
      setErrorMessage("Email/Username and password are required");
      return;
    }

    try {
      setLoading(true);

      const payload = identifier.includes("@")
        ? { email: identifier, password }
        : { username: identifier, password };

      const res = await loginUser(payload);
      const { user, accessToken } = res.data.data;

      localStorage.setItem("accessToken", accessToken);
      setUser(user);
      navigate("/");
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------------------
     Google Sign-In via Firebase
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
      // User closed popup or other error
      if (error.code !== "auth/popup-closed-by-user") {
        setErrorMessage(
          error.response?.data?.message || "Google sign-in failed. Please try again."
        );
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  /* -------------------------------------------------------
     Email Link (passwordless) Sign-In via Firebase
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

      // Save email for the completion step
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
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="card backdrop-blur-md overflow-hidden border-theme-border p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4 hover:scale-105 transition-transform duration-300">
               <img src="/visdy-logo.svg" alt="Visdy Logo" className="w-full h-full" />
            </div>
            <h2 className="text-3xl font-bold text-theme-text tracking-tight">Welcome Back</h2>
            <p className="text-theme-muted mt-2">Enter your credentials to access Visdy</p>
          </div>

          {/* ─── Google Sign-In Button ─── */}
          <button
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
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* ─── Divider ─── */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-theme-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-theme-card px-3 text-theme-muted tracking-wider">or</span>
            </div>
          </div>

          {/* ─── Traditional Login Form ─── */}
          <form onSubmit={submit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-theme-muted ml-1">Email or Username</label>
              <input
                type="text"
                placeholder="johndoe or john@example.com"
                className="input-field"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-semibold text-theme-muted">Password</label>
                <Link to="#" className="text-xs text-wine-glow hover:text-wine-glow transition-colors">Forgot password?</Link>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              disabled={loading}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2 group overflow-hidden relative mt-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-wine-glow/10 border border-wine-glow/20 text-wine-glow text-sm text-center animate-shake">
                {errorMessage}
              </div>
            )}
          </form>

          {/* ─── Email Link (Passwordless) Section ─── */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-theme-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-theme-card px-3 text-theme-muted tracking-wider">or sign in with a link</span>
            </div>
          </div>

          {emailLinkSent ? (
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-center animate-in fade-in duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="text-green-400 font-semibold text-sm">Check your email!</p>
              <p className="text-theme-muted text-xs mt-1">
                We sent a sign-in link to <span className="text-theme-text font-medium">{emailLinkEmail}</span>
              </p>
            </div>
          ) : (
            <form onSubmit={handleEmailLinkSignIn} className="flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="input-field flex-1"
                value={emailLinkEmail}
                onChange={(e) => setEmailLinkEmail(e.target.value)}
                required
              />
              <button
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
            </form>
          )}

          <p className="mt-8 text-center text-theme-muted text-sm">
            Don't have an account?{" "}
            <Link to="/register" className="text-wine-glow hover:text-wine-glow font-semibold transition-colors">
              Register now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
