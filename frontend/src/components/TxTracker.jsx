// frontend/src/components/TxTracker.jsx
import React, { useEffect, useState } from "react";
import socket from "../lib/socket";

export default function TxTracker() {
  const [txs, setTxs] = useState([]);

  useEffect(() => {
    console.log("📡 TxTracker mounted, listening for tx...");

    socket.on("tx", (tx) => {
      console.log("🔥 Live TX:", tx);

      setTxs((prev) => [tx, ...prev].slice(0, 50)); // keep last 50
    });

    return () => {
      socket.off("tx");
    };
  }, []);

  return (
    <div className="tx-tracker">
      <h2>🔥 Live Bitcoin Transactions</h2>

      {txs.length === 0 ? (
        <p>No transactions yet...</p>
      ) : (
        <ul>
          {txs.map((t, i) => (
            <li key={i}>
              <strong>TXID:</strong> {t.txid || t}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

