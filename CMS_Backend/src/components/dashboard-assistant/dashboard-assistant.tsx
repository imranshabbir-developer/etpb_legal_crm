import { lazy, Suspense, useEffect, useState } from "react";

import { AssistantChat } from "@/components/dashboard-assistant/assistant-chat";
import { cn } from "@/lib/utils";

const RobotCanvas = lazy(() =>
  import("@/components/dashboard-assistant/robot-canvas").then((m) => ({ default: m.RobotCanvas })),
);

function RobotFallback() {
  return (
    <div className="assistant-robot-fallback" aria-hidden>
      <div className="assistant-robot-fallback-head" />
      <div className="assistant-robot-fallback-body" />
    </div>
  );
}

export function DashboardAssistant({ variant = "dashboard" }: { variant?: "login" | "dashboard" }) {
  const [mounted, setMounted] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const isLogin = variant === "login";

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div
      className={cn(
        "dashboard-assistant",
        isLogin && "dashboard-assistant-login",
        chatOpen && "dashboard-assistant-chat-open",
      )}
    >
      <AssistantChat open={chatOpen} onClose={() => setChatOpen(false)} variant={variant} />

      <div className="assistant-robot-wrap">
        {!chatOpen && (
          <div className="assistant-welcome-bubble">
            <span className="assistant-welcome-pulse" />
            <p className="assistant-welcome-text">
              {isLogin ? "Welcome to IPS CRM!" : "Welcome back!"}
              <span>
                {isLogin ? "Tap IPS-7 for a quick platform tour" : "Tap IPS-7 for dashboard intel"}
              </span>
            </p>
          </div>
        )}

        <button
          type="button"
          className={cn("assistant-robot-trigger", chatOpen && "assistant-robot-trigger-active")}
          onClick={() => setChatOpen((open) => !open)}
          aria-label={chatOpen ? "Close IPS assistant" : "Open IPS assistant"}
          aria-expanded={chatOpen}
        >
          <span className="assistant-robot-ring" />
          <span className="assistant-robot-ring assistant-robot-ring-delay" />
          <Suspense fallback={<RobotFallback />}>
            <RobotCanvas chatting={chatOpen} />
          </Suspense>
        </button>
      </div>
    </div>
  );
}
