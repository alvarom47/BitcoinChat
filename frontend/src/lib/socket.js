import { io } from "socket.io-client";

// Auto-detect Railway production URL
const PROD_URL = window.location.origin.replace("https://", "wss://");

// Local development
const LOCAL_URL = "ws://localhost:3001";

// Use env variable if exists, else auto-detect
const BACKEND =
  import.meta.env.VITE_BACKEND_URL ||
  (window.location.hostname.includes("localhost") ? LOCAL_URL : `${PROD_URL}`);

console.log("🔌 Socket connecting to:", BACKEND);

export const socket = io(BACKEND, {
  transports: ["websocket"],
  reconnection: true,
});

export default socket;




