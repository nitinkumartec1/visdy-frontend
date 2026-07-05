import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, useSidebar } from "./context/SidebarContext";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import BottomNav from "./components/BottomNav";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const FinishSignIn = lazy(() => import("./pages/FinishSignIn"));
const VideoDetails = lazy(() => import("./pages/VideoDetails"));
const UploadVideo = lazy(() => import("./pages/UploadVideo"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const History = lazy(() => import("./pages/History"));
const LikedVideos = lazy(() => import("./pages/LikedVideos"));
const Subscriptions = lazy(() => import("./pages/Subscriptions"));
const EditProfile = lazy(() => import("./pages/EditProfile"));
const Playlists = lazy(() => import("./pages/Playlists"));
const PlaylistDetails = lazy(() => import("./pages/PlaylistDetails"));
const Tweets = lazy(() => import("./pages/Tweets"));
const WatchLater = lazy(() => import("./pages/WatchLater"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

function AppLayout() {
  const { collapsed } = useSidebar();

  return (
    <>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main 
          className={`flex-1 transition-all duration-300 w-full min-h-screen max-w-none
            px-0 sm:px-6 lg:px-8
            pt-24 lg:pt-10 pb-24 ml-0 lg:pb-8
            ${collapsed ? "lg:ml-[80px]" : "lg:ml-[300px]"}
          `}
        >
          <Suspense fallback={
            <div className="flex h-[50vh] w-full items-center justify-center">
              <div className="w-10 h-10 border-4 border-wine-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          }>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/finish-sign-in" element={<FinishSignIn />} />
              <Route path="/video/:id" element={<VideoDetails />} />
              <Route path="/c/:username" element={<Profile />} />

              {/* Protected Routes */}
              <Route
                path="/upload"
                element={
                  <ProtectedRoute>
                    <UploadVideo />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <History />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/liked-videos"
                element={
                  <ProtectedRoute>
                    <LikedVideos />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/subscriptions"
                element={
                  <ProtectedRoute>
                    <Subscriptions />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <EditProfile />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/playlists"
                element={
                  <ProtectedRoute>
                    <Playlists />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/playlist/:playlistId"
                element={
                  <ProtectedRoute>
                    <PlaylistDetails />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/tweets"
                element={
                  <ProtectedRoute>
                    <Tweets />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/watch-later"
                element={
                  <ProtectedRoute>
                    <WatchLater />
                  </ProtectedRoute>
                }
              />

              {/* Admin Route */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
            </Routes>
          </Suspense>
        </main>
      </div>
      <BottomNav />
    </>
  );
}

export default function App() {
  return (
    <SidebarProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </SidebarProvider>
  );
}