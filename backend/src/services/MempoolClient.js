// backend/src/services/MempoolClient.js
const WebSocket = require("ws");

let ws = null;

function start(onTx) {
  const url = "wss://mempool.space/api/v1/ws";

  console.log("[MEMPOOL] Connecting to mempool.space ws...");
  ws = new WebSocket(url);

  ws.on("open", () => {
    console.log("[MEMPOOL] Connected! Subscribing to live transactions...");
    ws.send(JSON.stringify({ action: "want", data: ["transactions"] }));
  });

  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg);

      // ✔ Mempool WS format
      if (data.event === "transaction" && data.data) {
        onTx({
          txid: data.data.txid,
          fee: data.data.fee,
          value: data.data.value,
          vsize: data.data.vsize,
          ...data.data
        });
      }
    } catch (err) {
      console.error("[MEMPOOL] JSON parse error:", err);
    }
  });

  ws.on("close", () => {
    console.log("[MEMPOOL] WS closed. Reconnecting in 3s...");
    setTimeout(() => start(onTx), 3000);
  });

  ws.on("error", (err) => {
    console.error("[MEMPOOL] WS error:", err);
  });
}

module.exports = { start };


