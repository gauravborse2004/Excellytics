import './App.css';
import { Routes, Route, Navigate, useLocation } from "react-router-dom"
import LoginPage from "./pages/LoginPage";
import { useEffect } from 'react';
import { Loader } from "lucide-react";
import { Toaster } from 'react-hot-toast';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import { useSelector, useDispatch } from 'react-redux';
import { checkAuth } from './store/auth-slice/authSlice';
import Navbar from "./components/common/Navbar";
import DashboardPage from './pages/DashboardPage';
import SidebarLayout from './layouts/SidebarLayout';
import UserData from './pages/UserData';

function App() {
  const dispatch = useDispatch();

  const location = useLocation();
  const currentPath = location.pathname;
  const showNavbarRoutes = ["/", "/forgotpassword", "/resetpassword"];
  const showNavbar = showNavbarRoutes.includes(currentPath);



  // Accessing Redux state
  const authUser = useSelector((state) => state.auth.authUser);
  const isCheckingAuth = useSelector((state) => state.auth.isCheckingAuth);


  useEffect(() => {
    dispatch(checkAuth()); // Dispatch checkAuth thunk
  }, [dispatch]);


  if (isCheckingAuth && !authUser) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }
  return (
    <>

      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={!authUser ? <LoginPage /> : <Navigate to="/dashboard" />} />
        <Route path="/forgotpassword" element={<ForgotPasswordPage />} />
        <Route path="/resetpassword" element={<ResetPasswordPage />} />

        {/* Protected Sidebar Routes */}
        <Route element={<SidebarLayout />}>
          <Route path="/dashboard" element={authUser ? <DashboardPage /> : <Navigate to="/" />} />
          <Route path="/users" element={authUser ? <UserData/> : <Navigate to="/" />} />

        </Route>

      </Routes>

      <Toaster />
    </>
  )
}

export default App
