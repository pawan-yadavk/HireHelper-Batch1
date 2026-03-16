import { io } from "socket.io-client";
import { API_BASE_URL } from "./api";

let socket;

export function getSocket() {
  if (!socket) {
    const token = localStorage.getItem("auth_token") || "";
    socket = io(API_BASE_URL, {
      transports: ["websocket"],
      auth: { token },
    });
  }
  return socket;
}

