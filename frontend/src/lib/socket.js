import { io } from "socket.io-client";

// Local development
const LOCAL_URL = "ws://localhost:8080";

// Production (Railway auto-detect)
const PROD_URL = window.location.origin.replace("http", "ws");

// If env variable exists → use it
const BACKEND =
  import.meta.env.VITE_BACKEND_URL ||
  (window.location.hostname.includes("localhost") ? LOCAL_URL : PROD_URL);

console.log("🔌 Socket connecting to:", BACKEND);

export const socket = io(BACKEND, {
  transports: ["websocket"],
  reconnection: true,
});





