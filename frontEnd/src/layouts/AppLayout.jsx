import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import { toast } from "react-toastify";
import { getSocket } from "../lib/socket";
import "./AppLayout.css";

const pageTitles = {
  "/dashboard": "Dashboard",
  "/feed": "Feed",
  "/my-tasks": "My Tasks",
  "/add-task": "Add Task",
  "/requests": "Requests",
  "/my-requests": "My Requests",
  "/settings": "Settings",
};

const AppLayout = () => {
  const location = useLocation();
  const title = pageTitles[location.pathname] || "HireHelper";

  useEffect(() => {
    const socket = getSocket();

    const handleTaskRequested = (payload) => {
      const { taskTitle, helper } = payload || {};
      const helperName =
        (helper?.first_name && helper?.last_name && `${helper.first_name} ${helper.last_name}`) ||
        helper?.first_name ||
        "Someone";

      toast.info(`${helperName} requested to help with "${taskTitle || "your task"}"`);

      try {
        const audio = new Audio("/notification.mp3");
        audio.play().catch(() => {});
      } catch {
        // ignore audio errors
      }
    };

    socket.on("task:requested", handleTaskRequested);

    return () => {
      socket.off("task:requested", handleTaskRequested);
    };
  }, []);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-content">
        <TopBar title={title} />
        <div className="app-page">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;