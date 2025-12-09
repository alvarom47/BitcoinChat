// backend/src/services/MempoolClient.js
const WebSocket = require("ws");

class MempoolClient {
  constructor(onTxCallback) {
    this.onTxCallback = onTxCallback;
    this.ws = null;
    this.url = "wss://mempool.space/api/v1/ws";
  }

  start() {
    console.log("[MEMPOOL] Connecting to mempool.space ws...");

    this.ws = new WebSocket(this.url);

    this.ws.on("open", () => {
      console.log("[MEMPOOL] Connected! Subscribing to live transactions...");
      this.ws.send(JSON.stringify({ action: "want", data: ["mempool-blocks", "transactions"] }));
    });

    this.ws.on("message", (msg) => {
      try {
        const data = JSON.parse(msg.toString());

        if (data?.transaction) {
          this.onTxCallback(data.transaction);
        }
      } catch (e) {
        console.error("[MEMPOOL] Message parse error:", e);
      }
    });

    this.ws.on("error", (err) => {
      console.error("[MEMPOOL] WS Error:", err.message);
    });

    this.ws.on("close", () => {
      console.warn("[MEMPOOL] Disconnected. Reconnecting in 3s...");
      setTimeout(() => this.start(), 3000);
    });
  }
}

module.exports = MempoolClient;
