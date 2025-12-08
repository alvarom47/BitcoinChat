import { io } from "socket.io-client";

// Automatically detect backend URL depending on environment
const BACKEND =
  import.meta.env.PROD
    ? window.location.origin // Railway serves frontend + backend on same domain
    : (import.meta.env.VITE_BACKEND_URL || "http://localhost:4000");

console.log("🔌 Connecting to backend:", BACKEND);

const socket = io(BACKEND, {
  transports: ["websocket", "polling"],
  withCredentials: false
});

export default socket;
