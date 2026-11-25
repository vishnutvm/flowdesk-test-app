"use client";

import Script from "next/script";

declare global {
  interface Window {
    ChatbotMakerWidget?: { init: (config: Record<string, string>) => void };
  }
}

export default function ChatWidget() {
  return (
    <Script
      src="https://genie-dev-widget-057691001873.s3.ap-southeast-2.amazonaws.com/widget.js"
      strategy="afterInteractive"
      onLoad={() => {
        window.ChatbotMakerWidget?.init({
          apiKey: "pk_live_rCrQtBXBrjeSCktuyUV7z0wiqNa3mX4E5Zs9PNzdYik",
          assistantId: "d6be0f1e-4d2f-4356-bdd6-af795c6115fc",
          apiBaseUrl: "https://www.chatbotmaker.in",
          theme: "auto",
          title: "Flow Desk",
        });
      }}
    />
  );
}