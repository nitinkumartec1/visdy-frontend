import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { auth } from "../firebase";
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { firebaseLogin } from "../api/auth.api";

/* -------------------------------------------------------
   FinishSignIn Page
   Landing page for email link authentication.
   When a user clicks the sign-in link in their email,
   they land here. Firebase completes the auth, then we
   send the ID token to our backend.
------------------------------------------------------- */
export default function FinishSignIn() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [status, setStatus] = useState("processing"); // "processing" | "success" | "error" | "need-email"
  const [errorMessage, setErrorMessage] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);


  const handleSignIn = async (overrideEmail) => {
    const url = window.location.href;

    // Verify this is a valid sign-in link
    if (!isSignInWithEmailLink(auth, url)) {
      setStatus("error");
      setErrorMessage("This link is invalid or has expired. Please request a new one.");
      return;
    }

    // Get the email from localStorage (saved when the link was sent)
    const storedEmail = overrideEmail || localStorage.getItem("emailForSignIn");

    if (!storedEmail) {
      // If email isn't in localStorage (e.g., different device),
      // ask the user to provide it
      setStatus("need-email");
      return;
    }

    try {
      setStatus("processing");

      // Complete Firebase sign-in
      const result = await signInWithEmailLink(auth, storedEmail, url);
      const idToken = await result.user.getIdToken();

      // Send to our backend
      const res = await firebaseLogin(idToken);
      const { user, accessToken } = res.data.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.removeItem("emailForSignIn"); // Cleanup
      setUser(user);

      setStatus("success");

      // Brief delay to show success state
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error.response?.data?.message ||
        error.message ||
        "Sign-in failed. The link may have expired."
      );
    }
  };

  useEffect(() => {
    handleSignIn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (loading || !email.includes("@")) return;

    setLoading(true);
    await handleSignIn(email);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-theme-bg selection:bg-wine-primary/30">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="card backdrop-blur-md overflow-hidden border-theme-border p-8">
          <div className="text-center">
            <div className="w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <img src="/visdy-logo.svg" alt="Visdy Logo" className="w-full h-full" />
            </div>

            {/* Processing State */}
            {status === "processing" && (
              <div className="space-y-4">
                <div className="w-10 h-10 border-3 border-wine-primary/20 border-t-wine-primary rounded-full animate-spin mx-auto"></div>
                <h2 className="text-2xl font-bold text-theme-text">Signing you in...</h2>
                <p className="text-theme-muted text-sm">Verifying your email link</p>
              </div>
            )}

            {/* Success State */}
            {status === "success" && (
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-theme-text">Welcome to Visdy!</h2>
                <p className="text-theme-muted text-sm">Redirecting you to the homepage...</p>
              </div>
            )}

            {/* Error State */}
            {status === "error" && (
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-full bg-wine-glow/10 flex items-center justify-center mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-wine-glow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-theme-text">Sign-in Failed</h2>
                <div className="p-3 rounded-xl bg-wine-glow/10 border border-wine-glow/20 text-wine-glow text-sm">
                  {errorMessage}
                </div>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-wine-glow hover:text-wine-glow font-semibold text-sm transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Login
                </Link>
              </div>
            )}

            {/* Need Email State (opened on different device) */}
            {status === "need-email" && (
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-full bg-wine-primary/10 flex items-center justify-center mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-wine-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-theme-text">Confirm Your Email</h2>
                <p className="text-theme-muted text-sm">
                  Please enter the email address you used to request the sign-in link.
                </p>
                <form onSubmit={handleEmailSubmit} className="space-y-3">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="input-field"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                  <button
                    disabled={loading}
                    className="w-full btn-primary py-3 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <span>Continue</span>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
