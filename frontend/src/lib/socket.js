// frontend/src/lib/socket.js
import { io } from "socket.io-client";

// Local development
const LOCAL_URL = "ws://localhost:8080";

// Railway production auto-detect
const PROD_URL = window.location.origin.replace("http", "ws");

// Final backend URL logic
const BACKEND =
  import.meta.env.VITE_BACKEND_URL ||
  (window.location.hostname.includes("localhost") ? LOCAL_URL : PROD_URL);

console.log("🔌 Connecting to backend websocket:", BACKEND);

export const socket = io(BACKEND, {
  transports: ["websocket"],
  reconnection: true,
});

// IMPORTANT: Needed for the Vite build (default export)
export default socket;






