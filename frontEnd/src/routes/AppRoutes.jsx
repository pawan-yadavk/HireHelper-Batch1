import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Register from "../pages/Register";
import VerifyOtp from "../pages/VerifyOtp";
import ForgotPassword from "../pages/ForgotPassword";
import ResetVerifyOtp from "../pages/ResetVerifyOtp";
import ResetPassword from "../pages/ResetPassword";

import Dashboard from "../pages/Dashboard";
import Feed from "../pages/Feed";
import AddTask from "../pages/AddTasks";
import MyTasks from "../pages/MyTasks";
import TaskDetail from "../pages/TaskDetail";
import Requests from "../pages/Requests";
import MyRequests from "../pages/MyRequests";
import Chat from "../pages/Chat";

import AppLayout from "../layouts/AppLayout";

const AppRoutes = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ⭐ Check login ONLY once on load
  useEffect(() => {
    const checkAuth = () => {
      const logged = localStorage.getItem("isLoggedIn") === "true";
      setIsLoggedIn(logged);
    };

    checkAuth();

    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  return (
    <Routes>
      {/* ⭐ Public Routes */}
      <Route
        path="/"
        element={isLoggedIn ? <Navigate to="/dashboard" /> : <Landing />}
      />
      <Route
        path="/login"
        element={isLoggedIn ? <Navigate to="/dashboard" /> : <Login />}
      />
      <Route
        path="/register"
        element={isLoggedIn ? <Navigate to="/dashboard" /> : <Register />}
      />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-verify-otp" element={<ResetVerifyOtp />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* ⭐ Protected Routes */}
      <Route
        element={isLoggedIn ? <AppLayout /> : <Navigate to="/login" />}
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/add-task" element={<AddTask />} />
        <Route path="/my-tasks" element={<MyTasks />} />
        <Route path="/task/:id" element={<TaskDetail />} />
        <Route path="/requests" element={<Requests />} />
        <Route path="/my-requests" element={<MyRequests />} />

        {/* ⭐ CHAT PAGE */}
        <Route path="/chat/:taskId" element={<Chat />} />
      </Route>

      {/* ⭐ Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;