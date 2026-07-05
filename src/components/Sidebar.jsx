import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSidebar } from "../context/SidebarContext";
import { logoutUser } from "../api/auth.api";

export default function Sidebar() {
  const { user, setUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { collapsed, isMobileOpen, setIsMobileOpen } = useSidebar();

  if (['/login', '/register'].includes(location.pathname)) return null;

  const isActive = (path) => location.pathname === path ? "bg-gradient-to-r from-wine-primary to-wine-accent text-white shadow-lg shadow-wine-primary/30" : "text-theme-muted hover:bg-theme-card hover:text-theme-text";
  const getIconColor = (path) => location.pathname === path ? "text-white" : "text-wine-glow";

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // error omitted
    }
    localStorage.removeItem("accessToken");
    setUser(null);
    navigate("/login");
  };

  const closeMobile = () => setIsMobileOpen(false);

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden ${isMobileOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={closeMobile}
      />

      <aside 
        className={`fixed left-0 top-0 lg:top-[64px] h-full lg:h-[calc(100vh-64px)] border-r border-theme-border bg-theme-bg flex flex-col pt-4 overflow-y-auto transition-all duration-300 ease-in-out z-50 lg:z-0
          ${collapsed ? "lg:w-[80px]" : "lg:w-[300px]"}
          w-[300px] lg:translate-x-0
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex flex-col space-y-2 px-2">
          {/* Mobile Header inside Drawer */}
          <div className="flex items-center gap-2 px-4 py-2 lg:hidden mb-4 border-b border-theme-border pb-4">
            <div className="w-8 h-8 flex items-center justify-center">
              <img src="/visdy-logo.svg" alt="Visdy Logo" className="w-full h-full" />
            </div>
            <span className="text-2xl font-bold text-theme-text tracking-tight">Visdy</span>
          </div>

          <Link to="/" onClick={closeMobile} className={`flex items-center ${collapsed ? 'lg:justify-center' : 'gap-3 px-4'} py-3 rounded-xl transition-colors ${isActive('/')}`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 flex-shrink-0 ${getIconColor('/')}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              <span className={`font-medium whitespace-nowrap ${collapsed ? 'lg:hidden' : 'block'}`}>Home</span>
          </Link>
          <Link to="/subscriptions" onClick={closeMobile} className={`flex items-center ${collapsed ? 'lg:justify-center' : 'gap-3 px-4'} py-3 rounded-xl transition-colors ${isActive('/subscriptions')}`}>
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 flex-shrink-0 ${getIconColor('/subscriptions')}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25a2.25 2.25 0 00-2.25 2.25v12.75m0 0h9.75a2.25 2.25 0 002.25-2.25V9.75m0 0h2.25a2.25 2.25 0 002.25-2.25V14.25m-6 3.75h6.75a2.25 2.25 0 002.25-2.25v-3m0 0H16.5" />
             </svg>
             <span className={`font-medium whitespace-nowrap ${collapsed ? 'lg:hidden' : 'block'}`}>Subscriptions</span>
          </Link>
          <Link to="/tweets" onClick={closeMobile} className={`flex items-center ${collapsed ? 'lg:justify-center' : 'gap-3 px-4'} py-3 rounded-xl transition-colors ${isActive('/tweets')}`}>
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 flex-shrink-0 ${getIconColor('/tweets')}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
             </svg>
             <span className={`font-medium whitespace-nowrap ${collapsed ? 'lg:hidden' : 'block'}`}>Tweets</span>
          </Link>
          <Link to="/history" onClick={closeMobile} className={`flex items-center ${collapsed ? 'lg:justify-center' : 'gap-3 px-4'} py-3 rounded-xl transition-colors ${isActive('/history')}`}>
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 flex-shrink-0 ${getIconColor('/history')}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
             <span className={`font-medium whitespace-nowrap ${collapsed ? 'lg:hidden' : 'block'}`}>History</span>
          </Link>
          <Link to="/liked-videos" onClick={closeMobile} className={`flex items-center ${collapsed ? 'lg:justify-center' : 'gap-3 px-4'} py-3 rounded-xl transition-colors ${isActive('/liked-videos')}`}>
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 flex-shrink-0 ${getIconColor('/liked-videos')}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
             </svg>
             <span className={`font-medium whitespace-nowrap ${collapsed ? 'lg:hidden' : 'block'}`}>Liked Videos</span>
          </Link>
          <Link to="/playlists" onClick={closeMobile} className={`flex items-center ${collapsed ? 'lg:justify-center' : 'gap-3 px-4'} py-3 rounded-xl transition-colors ${isActive('/playlists')}`}>
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 flex-shrink-0 ${getIconColor('/playlists')}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
             </svg>
             <span className={`font-medium whitespace-nowrap ${collapsed ? 'lg:hidden' : 'block'}`}>Playlists</span>
          </Link>
          <Link to="/watch-later" onClick={closeMobile} className={`flex items-center ${collapsed ? 'lg:justify-center' : 'gap-3 px-4'} py-3 rounded-xl transition-colors ${isActive('/watch-later')}`}>
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 flex-shrink-0 ${getIconColor('/watch-later')}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 12v3" />
             </svg>
             <span className={`font-medium whitespace-nowrap ${collapsed ? 'lg:hidden' : 'block'}`}>Watch Later</span>
          </Link>
          <Link to="/dashboard" onClick={closeMobile} className={`flex items-center ${collapsed ? 'lg:justify-center' : 'gap-3 px-4'} py-3 rounded-xl transition-colors ${isActive('/dashboard')}`}>
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 flex-shrink-0 ${getIconColor('/dashboard')}`}>
               <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
             </svg>
             <span className={`font-medium whitespace-nowrap ${collapsed ? 'lg:hidden' : 'block'}`}>Dashboard</span>
          </Link>
        </div>

        <div className="mt-auto flex flex-col space-y-2 px-2 pb-4">
          {user?.role === "admin" && (
            <Link to="/admin" onClick={closeMobile} className={`flex items-center ${collapsed ? 'lg:justify-center' : 'gap-3 px-4'} py-3 rounded-xl transition-colors ${isActive('/admin')}`}>
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 flex-shrink-0 ${getIconColor('/admin')}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
               </svg>
               <span className={`font-medium whitespace-nowrap ${collapsed ? 'lg:hidden' : 'block'}`}>Admin Panel</span>
            </Link>
          )}
          <Link to="/settings" onClick={closeMobile} className={`flex items-center ${collapsed ? 'lg:justify-center' : 'gap-3 px-4'} py-3 rounded-xl transition-colors ${isActive('/settings')}`}>
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 flex-shrink-0 ${getIconColor('/settings')}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
             </svg>
             <span className={`font-medium whitespace-nowrap ${collapsed ? 'lg:hidden' : 'block'}`}>Settings</span>
          </Link>
          <Link to="/support" onClick={closeMobile} className={`flex items-center ${collapsed ? 'lg:justify-center' : 'gap-3 px-4'} py-3 rounded-xl transition-colors ${isActive('/support')}`}>
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 flex-shrink-0 ${getIconColor('/support')}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
             </svg>
             <span className={`font-medium whitespace-nowrap ${collapsed ? 'lg:hidden' : 'block'}`}>Support</span>
          </Link>
          {user && (
            <button onClick={handleLogout} className={`flex items-center lg:hidden gap-3 px-4 py-3 rounded-xl transition-colors text-wine-glow hover:bg-theme-card hover:text-theme-text w-full text-left`}>
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 flex-shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
               </svg>
               <span className="font-medium whitespace-nowrap">Logout</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
