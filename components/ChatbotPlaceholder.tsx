"use client";

/**
 * ChatbotPlaceholder
 * ===================
 * FlowDesk is a fake customer SaaS app whose purpose is to serve as an
 * external integration/E2E testing target for a separate chatbot platform
 * (built in another repository). This component is a clearly-marked
 * placeholder for that widget — it renders a small, inert "widget bubble"
 * so the layout and visual space it will occupy is realistic, but it does
 * NOT implement any real chat functionality.
 *
 * How the real widget will be wired in later:
 * 1. The chatbot platform will provide a `<script>` embed snippet, e.g.
 *      <script src="https://cdn.example-chatbot.com/widget.js" data-org="flowdesk-demo" async></script>
 * 2. Set NEXT_PUBLIC_CHATBOT_WIDGET_URL in `.env.local` (see `.env.example`)
 *    to that script URL.
 * 3. Replace the placeholder <button> below with a <script> tag injected via
 *    `next/script`, reading its `src` from `process.env.NEXT_PUBLIC_CHATBOT_WIDGET_URL`.
 *    Example:
 *
 *      import Script from "next/script";
 *      const widgetUrl = process.env.NEXT_PUBLIC_CHATBOT_WIDGET_URL;
 *      if (widgetUrl) {
 *        return <Script src={widgetUrl} strategy="lazyOnload" data-org="flowdesk-demo" />;
 *      }
 *
 * 4. Remove this placeholder component and its import from `app/layout.tsx`.
 *
 * See docs/CHATBOT-INTEGRATION-TEST-PLAN.md section K for the full swap-in
 * instructions, including the selectors this app exposes for guided
 * navigation (`data-ai-target` attributes throughout the UI).
 */
export function ChatbotPlaceholder() {
  const widgetUrl = process.env.NEXT_PUBLIC_CHATBOT_WIDGET_URL;

  return (
    <div
      data-testid="chatbot-placeholder"
      data-ai-target="chatbot-placeholder"
      data-widget-url={widgetUrl ?? ""}
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
