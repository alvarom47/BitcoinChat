import { io } from "socket.io-client";

// ✔ En producción usa la variable del backend
// ✔ En local usa http://localhost:4000
const BACKEND =
  import.meta.env.VITE_BACKEND_URL ||
  "http://localhost:4000";

console.log("🌐 Connecting to backend:", BACKEND);

export const socket = io(BACKEND, {
  transports: ["websocket", "polling"],
  path: "/socket.io",
  reconnection: true,
});

export default socket;



