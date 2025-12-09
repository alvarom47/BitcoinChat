const WebSocket = require('ws');

module.exports = {
  start(onTx) {
    console.log("[MEMPOOL] Connecting to mempool.space ws...");

    const ws = new WebSocket("wss://mempool.space/api/v1/ws");

    ws.on("open", () => {
      console.log("[MEMPOOL] Connected! Subscribing to live transactions...");
      ws.send(JSON.stringify({ action: "want", data: ["transactions"] }));
    });

    ws.on("message", (msg) => {
      try {
        const data = JSON.parse(msg);
        if (data?.transaction) {
          onTx(data.transaction);
        }
      } catch (e) {
        console.error("WS parse error:", e);
      }
    });

    ws.on("close", () => {
      console.log("[MEMPOOL] Connection closed. Reconnecting in 3s...");
      setTimeout(() => this.start(onTx), 3000);
    });

    ws.on("error", (e) => {
      console.error("[MEMPOOL] WS error", e);
    });
  }
};

