import { io } from "socket.io-client";

// FRONTEND uses this env in production
const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

console.log("Connecting to backend:", BACKEND);

export const socket = io(BACKEND, {
  transports: ["websocket"], 
  secure: true,
  reconnection: true,
  reconnectionDelay: 500,
});

export default socket;


