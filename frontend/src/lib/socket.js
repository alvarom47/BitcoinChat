import { io } from "socket.io-client";

const BACKEND =
  import.meta.env.VITE_BACKEND_URL ||
  window.location.origin.replace(/$/, ":3001"); // fallback if local

console.log("🌐 Connecting to backend:", BACKEND);

export const socket = io(BACKEND, {
  transports: ["websocket"],
  reconnection: true,
});

export default socket;


