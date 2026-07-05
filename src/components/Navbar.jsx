import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { logoutUser } from "../api/auth.api";
import { useSidebar } from "../context/SidebarContext";
import { useTheme } from "../context/ThemeContext";


export default function Navbar() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const { toggleSidebar } = useSidebar();
  const { theme, toggleTheme } = useTheme();

  const logout = async () => {
    try {
      await logoutUser();
    } catch {
      // error omitted
    }
    localStorage.removeItem("accessToken");
    setUser(null);
    navigate("/login");
  };

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="hidden lg:flex sticky top-0 z-50 w-full h-16 px-4 bg-theme-soft/80 backdrop-blur-md border-b border-theme-border shadow-lg shadow-wine-primary/5 items-center">
        <div className="w-full flex items-center justify-between relative">
          {/* Left Side: Hamburger and Logo */}
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleSidebar}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-theme-text hidden md:block -ml-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
               <div className="w-10 h-10 flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300">
                 <img src="/visdy-logo.svg" alt="Visdy Logo" className="w-full h-full" />
               </div>
               <span className="text-2xl font-bold text-theme-text tracking-tight">Visdy</span>
            </Link>
          </div>

          {/* Center: Global Search Bar (Absolutely Centered) */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl pointer-events-none">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const query = new FormData(e.target).get('searchQuery');
                if (query !== null) {
                  navigate(`/?query=${encodeURIComponent(query)}`);
                }
              }} 
              className="w-full relative flex items-center bg-theme-card rounded-full px-4 py-2 border border-theme-border focus-within:border-wine-primary focus-within:ring-1 focus-within:ring-wine-primary transition-all pointer-events-auto shadow-black/40"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-theme-muted mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                name="searchQuery"
                placeholder="Search specifically..."
                className="w-full bg-transparent text-theme-text placeholder-zinc-500 focus:outline-none"
              />
            </form>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="p-2 hover:bg-theme-border/50 rounded-full transition-colors text-theme-muted hover:text-theme-text"
              title="Toggle Dark Mode"
            >
              {theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                </svg>
              )}
            </button>
            {user ? (
              <>
                <Link to="/upload" className="btn-primary flex items-center gap-2 py-2 px-4 shadow-wine-primary/25">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  <span>Upload</span>
                </Link>
                
                <div className="relative group">
                  <Link to={`/c/${user.username}`}>
                      <img 
                        src={user.avatar} 
                        alt="Avatar" 
                        className="w-10 h-10 rounded-full object-cover border-2 border-transparent group-hover:border-wine-primary transition-all"
                      />
                  </Link>
                  <div className="absolute right-0 mt-2 w-48 bg-theme-card border border-theme-border rounded-xl shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right z-50">
                      <div className="px-4 py-2 border-b border-theme-border mb-2">
                          <p className="text-sm font-semibold text-theme-text">{user.fullName}</p>
                          <p className="text-xs text-theme-muted">@{user.username}</p>
                      </div>
                      <Link to="/settings" className="block px-4 py-2 text-sm text-theme-muted hover:bg-[#1F1F1F] hover:text-theme-text transition-colors">Settings</Link>
                      <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-wine-glow hover:bg-[#1F1F1F] transition-colors">Logout</button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-theme-muted hover:text-theme-text font-medium transition-colors">Log in</Link>
                <Link to="/register" className="btn-primary">Sign up</Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Navbar */}
      <nav className="flex lg:hidden fixed top-0 left-0 right-0 h-14 bg-theme-soft border-b border-theme-border z-50 items-center justify-between px-3">
        {/* Mobile Logo */}
        <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center">
              <img src="/visdy-logo.svg" alt="Visdy Logo" className="w-full h-full" />
            </div>
            <span className="text-xl font-bold text-theme-text tracking-tight">Visdy</span>
        </Link>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleTheme}
            className="p-2 hover:bg-theme-border/50 rounded-full transition-colors text-theme-muted hover:text-theme-text"
          >
            {theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
              </svg>
            )}
          </button>
        {/* Mobile Search */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            const query = new FormData(e.target).get('searchQuery');
            if (query !== null) {
              navigate(`/?query=${encodeURIComponent(query)}`);
            }
          }} 
          className="w-40 sm:w-48 h-9 rounded-full bg-[#151515] border border-[#252525] flex items-center px-3 focus-within:border-[#7A001F] focus-within:ring-1 focus-within:ring-[#7A001F] transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#A1A1AA] mr-2 shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            name="searchQuery"
            placeholder="Search videos..."
            className="w-full bg-transparent text-theme-text placeholder:text-theme-muted text-sm focus:outline-none"
          />
        </form>
        </div>
      </nav>
    </>
  );
}