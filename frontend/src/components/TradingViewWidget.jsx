import { useEffect, useRef } from "react";

export default function TradingViewWidget() {
  const container = useRef();

  useEffect(() => {
    container.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;

    script.innerHTML = JSON.stringify({
      autosize: false,          // 🔥 DESACTIVAMOS autosize
      width: "100%",            // 🔥 Ancho completo
      height: 430,              // 🔥 Ajusta este número para subir/bajar tamaño
      symbol: "BINANCE:BTCUSDT",
      interval: "60",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      enable_publishing: false,
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false
    });

    container.current.appendChild(script);
  }, []);

  return (
    <div
      ref={container}
      className="w-full bg-[#0d0d0d] rounded-xl shadow-xl overflow-hidden"
      style={{ height: "430px" }}  // 🔥 Altura controlada desde Tailwind + inline
    />
  );
}




