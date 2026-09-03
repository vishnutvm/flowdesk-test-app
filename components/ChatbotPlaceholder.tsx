"use client";

import Script from "next/script";

/**
 * ChatbotPlaceholder
 * ===================
 * FlowDesk is a fake customer SaaS app whose purpose is to serve as an
 * external integration/E2E testing target for the Genie chatbot platform
 * (built in a separate repository — https://www.chatbotmaker.in).
 *
 * This component now embeds the REAL Genie widget, using the org's
 * publishable key (safe to expose client-side — that's what "publishable"
 * keys are for, same convention as Stripe's `pk_live_...`). If the widget
 * script URL isn't configured (e.g. a fork with no Genie assistant set up
 * yet), it falls back to an inert placeholder bubble so the layout stays
 * realistic.
 *
 * Config comes from env vars (see `.env.example`), with the values from the
 * live Genie test assistant as defaults so this works out of the box for
 * this test app's own integration testing.
 */
const WIDGET_SCRIPT_URL =
  process.env.NEXT_PUBLIC_CHATBOT_WIDGET_URL ??
  "https://genie-dev-widget-473488813879.s3.ap-south-1.amazonaws.com/widget.js";
const WIDGET_API_KEY =
  process.env.NEXT_PUBLIC_CHATBOT_API_KEY ?? "pk_live_1ZD5HgAQRvZaWCWxRLi5zLjo4OPGj9jfnF-goxV4ZmI";
const WIDGET_ASSISTANT_ID =
  process.env.NEXT_PUBLIC_CHATBOT_ASSISTANT_ID ?? "9e72a322-cebc-43ec-ba1b-56dad7af39c3";
const WIDGET_API_BASE_URL =
  process.env.NEXT_PUBLIC_CHATBOT_API_BASE_URL ?? "https://www.chatbotmaker.in";

export function ChatbotPlaceholder() {
  if (!WIDGET_SCRIPT_URL || !WIDGET_API_KEY || !WIDGET_ASSISTANT_ID) {
    return (
      <div
        data-testid="chatbot-placeholder"
        data-ai-target="chatbot-placeholder"
        className="fixed bottom-5 right-5 z-30"
        aria-hidden="true"
      >
        <div
          title="Chatbot widget placeholder — a real widget will be embedded here"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg opacity-70"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
            <path
              fillRule="evenodd"
              d="M4.804 21.644A6.707 6.707 0 006 21.75a33.4 33.4 0 003.44-.176A9.72 9.72 0 0012 21.75c5.385 0 9.75-3.978 9.75-8.9s-4.365-8.9-9.75-8.9-9.75 3.978-9.75 8.9c0 1.941.673 3.732 1.815 5.19a4.65 4.65 0 01-1.06 2.526 3.63 3.63 0 001.549 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <Script
      id="genie-widget-loader"
      data-testid="chatbot-widget-script"
      data-ai-target="chatbot-widget-script"
      src={WIDGET_SCRIPT_URL}
      strategy="afterInteractive"
      onLoad={() => {
        window.GenieWidget?.init({
          apiKey: WIDGET_API_KEY,
          assistantId: WIDGET_ASSISTANT_ID,
          apiBaseUrl: WIDGET_API_BASE_URL,
          theme: "auto",
          title: "FlowDesk Support",
        });
      }}
    />
  );
}

declare global {
  interface Window {
    GenieWidget?: {
      init: (config: {
        apiKey: string;
        assistantId: string;
        apiBaseUrl: string;
        theme?: string;
        title?: string;
      }) => void;
    };
  }
}
