import { io } from "socket.io-client";

const BACKEND =
  import.meta.env.VITE_BACKEND_URL ||
  window.location.origin.replace(/\/$/, "").replace("https://", "https://api."); 
// Example: front → https://bitcoinchat.online
// backend → https://api.bitcoinchat.online (recommended setup)

console.log("🌐 Connecting to backend:", BACKEND);

export const socket = io(BACKEND, {
  transports: ["websocket"],
  reconnection: true,
});

export default socket;



