import { io } from "socket.io-client";

const BACKEND =
  import.meta.env.VITE_BACKEND_URL ||
  window.location.origin.replace(/^https/, "ws");

export const socket = io(BACKEND, {
  transports: ["websocket"],
});

export default socket;

