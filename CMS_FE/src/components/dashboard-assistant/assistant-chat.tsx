import { useEffect, useRef, useState } from "react";
import { Bot, Send, Sparkles, X } from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";
import {
  assistantLoginPrompts,
  assistantQuickPrompts,
  createMessage,
  getAssistantReply,
  type AssistantMessage,
  type AssistantContext,
} from "@/lib/assistant-responses";
import { useCaseStore } from "@/lib/cases/case-store";
import { cn } from "@/lib/utils";

type AssistantChatProps = {
  open: boolean;
  onClose: () => void;
  variant?: "login" | "dashboard";
};

const introMessages = {
  login:
    "IPS-7 online. Welcome to IPS Legal CRM.\nAsk me about courts, case categories, reminders, roles, or how to sign in.",
  dashboard:
    "IPS-7 online. Welcome back.\nI can explain live case totals, internal vs external courts, reminders, and role permissions.",
};

export function AssistantChat({ open, onClose, variant = "dashboard" }: AssistantChatProps) {
  const { cases, countByLayer, countByCategory, ready } = useCaseStore();
  const [messages, setMessages] = useState<AssistantMessage[]>([
    createMessage("bot", introMessages[variant]),
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const context: AssistantContext | undefined =
    variant === "dashboard" && ready
      ? {
          total: cases.length,
          internal: countByLayer("internal"),
          external: countByLayer("external"),
          pending: countByCategory("pending-cases"),
          decided: countByCategory("decided-cases"),
          restraining: countByCategory("restraining-order"),
          direction: countByCategory("direction-cases"),
        }
      : undefined;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing, open]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || typing) return;

    setMessages((prev) => [...prev, createMessage("user", trimmed)]);
    setInput("");
    setTyping(true);

    window.setTimeout(() => {
      setMessages((prev) => [...prev, createMessage("bot", getAssistantReply(trimmed, context))]);
      setTyping(false);
    }, 650 + Math.min(trimmed.length * 12, 900));
  };

  if (!open) return null;

  const quickPrompts = variant === "login" ? assistantLoginPrompts : assistantQuickPrompts;

  return (
    <div className="assistant-chat-panel" role="dialog" aria-label="IPS dashboard assistant">
      <header className="assistant-chat-header">
        <div className="assistant-chat-header-meta">
          <span className="assistant-chat-status" />
          <div>
            <p className="assistant-chat-title">IPS-7 Neural Assist</p>
            <p className="assistant-chat-subtitle">Dashboard query module · v1.0</p>
          </div>
        </div>
        <button type="button" className="assistant-chat-close" onClick={onClose} aria-label="Close chat">
          <X className="size-4" />
        </button>
      </header>

      <ScrollArea className="assistant-chat-messages flex-1">
        <div className="assistant-chat-thread">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "assistant-chat-bubble",
                message.role === "user" ? "assistant-chat-bubble-user" : "assistant-chat-bubble-bot",
              )}
            >
              {message.role === "bot" && (
                <span className="assistant-chat-bot-icon">
                  <Bot className="size-3.5" />
                </span>
              )}
              <p className="assistant-chat-text whitespace-pre-line">{message.text}</p>
            </div>
          ))}
          {typing && (
            <div className="assistant-chat-bubble assistant-chat-bubble-bot assistant-chat-typing">
              <span className="assistant-chat-bot-icon">
                <Bot className="size-3.5" />
              </span>
              <span className="assistant-typing-dots">
                <span />
                <span />
                <span />
              </span>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </ScrollArea>

      <div className="assistant-chat-prompts">
        {quickPrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            className="assistant-chat-prompt"
            onClick={() => send(prompt)}
            disabled={typing}
          >
            <Sparkles className="size-3 shrink-0" />
            {prompt}
          </button>
        ))}
      </div>

      <form
        className="assistant-chat-input-row"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about courts, cases, reminders…"
          className="assistant-chat-input"
          disabled={typing}
        />
        <button type="submit" className="assistant-chat-send" disabled={typing || !input.trim()}>
          <Send className="size-4" />
        </button>
      </form>
    </div>
  );
}
