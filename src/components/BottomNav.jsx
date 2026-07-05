import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSidebar } from "../context/SidebarContext";

export default function BottomNav() {
  const { user } = useAuth();
  const { toggleMobileSidebar } = useSidebar();

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-theme-soft border-t border-theme-border z-50 flex items-center justify-between px-5 lg:hidden">
      {/* Menu Button */}
      <button
        onClick={toggleMobileSidebar}
        className="p-2 hover:bg-theme-border/50 rounded-full transition-colors text-theme-text"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      {/* Upload Button */}
      {user && (
        <Link
          to="/upload"
          className="bg-wine-primary text-white rounded-full px-6 py-2 shadow-lg shadow-wine-primary/30 font-semibold tracking-tight hover:bg-wine-accent transition-colors flex items-center gap-2 transform hover:scale-105"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Upload
        </Link>
      )}

      {/* Profile / Auth Buttons */}
      {user ? (
        <Link to={`/c/${user.username}`} className="w-8 h-8 rounded-full overflow-hidden border border-theme-border">
          {user.avatar ? (
            <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-theme-card flex items-center justify-center text-theme-text font-bold">
              {user.username.charAt(0).toUpperCase()}
            </div>
          )}
        </Link>
      ) : (
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-theme-muted hover:text-theme-text font-medium text-sm transition-colors">
            Log in
          </Link>
          <Link to="/register" className="bg-wine-primary text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-wine-accent transition-colors shadow-sm shadow-wine-primary/30">
            Sign up
          </Link>
        </div>
      )}
    </div>
  );
}
