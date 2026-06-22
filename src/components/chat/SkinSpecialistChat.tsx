import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { X, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import specialistAvatar from "@/assets/specialist-avatar.jpg";

const SESSION_KEY = "lumiere_chat_session_id";
const ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/skin-specialist-chat`;

const QUICK_REPLIES = [
  "Fine lines & wrinkles",
  "Sagging skin",
  "Dull, tired skin",
  "Just exploring",
];

const WELCOME_MESSAGE: UIMessage = {
  id: "welcome",
  role: "assistant",
  parts: [
    {
      type: "text",
      text:
        "Hi, I'm Sofia one of the skin specialists at the GLO+ clinic. I'm here to help you find the right treatment for your skin and book your spot, right inside this chat.\n\nWhat's bothering you most about your skin lately?",
    },
  ],
};

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

type DbMessage = {
  id: string;
  role: string;
  parts: unknown;
  created_at: string;
};

export default function SkinSpecialistChat() {
  const [open, setOpen] = useState(false);
  const [bootstrapped, setBootstrapped] = useState(false);
  const [initialMessages, setInitialMessages] = useState<UIMessage[]>([
    WELCOME_MESSAGE,
  ]);
  const sessionId = useMemo(() => getOrCreateSessionId(), []);

  // Load conversation history from DB on first mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("chat-history", {
          headers: { "x-session-id": sessionId },
          body: { sessionId },
        });
        if (cancelled) return;
        if (error) {
          setBootstrapped(true);
          return;
        }
        const msgs = (data?.messages ?? []) as DbMessage[];
        if (msgs.length > 0) {
          const ui: UIMessage[] = (msgs as DbMessage[]).map((m) => ({
            id: m.id,
            role: m.role as UIMessage["role"],
            parts: Array.isArray(m.parts)
              ? (m.parts as UIMessage["parts"])
              : ([{ type: "text", text: String(m.parts ?? "") }] as UIMessage["parts"]),
          }));
          setInitialMessages([WELCOME_MESSAGE, ...ui]);
        }
        setBootstrapped(true);
      } catch {
        if (!cancelled) setBootstrapped(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  if (!bootstrapped) {
    return <FloatingBubble onClick={() => setOpen(true)} hidden />;
  }

  return (
    <>
      {!open && <FloatingBubble onClick={() => setOpen(true)} />}
      {open && (
        <ChatWindow
          key={sessionId}
          sessionId={sessionId}
          initialMessages={initialMessages}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function FloatingBubble({
  onClick,
  hidden,
}: {
  onClick: () => void;
  hidden?: boolean;
}) {
  if (hidden) return null;
  return (
    <button
      onClick={onClick}
      aria-label="Chat with Sofia, our skin specialist"
      className="fixed z-[60] bottom-24 right-5 md:bottom-6 md:right-6 group flex items-center gap-3 rounded-full bg-white border border-pink-200 shadow-2xl transition-all hover:scale-105 hover:shadow-pink-200/60 pl-1.5 pr-4 py-1.5 md:py-2"
    >
      <span className="relative h-12 w-12 md:h-14 md:w-14 shrink-0">
        <img
          src={specialistAvatar}
          alt="Sofia, skin specialist"
          width={112}
          height={112}
          loading="lazy"
          className="h-full w-full rounded-full object-cover ring-2 ring-pink-100"
        />
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
      </span>
      <span className="hidden md:flex flex-col items-start text-left leading-tight">
        <span className="text-[13px] font-semibold text-gray-900">Chat with Sofia</span>
        <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Online now
        </span>
      </span>
    </button>
  );
}

function ChatWindow({
  sessionId,
  initialMessages,
  onClose,
}: {
  sessionId: string;
  initialMessages: UIMessage[];
  onClose: () => void;
}) {
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: ENDPOINT,
        headers: {
          "x-session-id": sessionId,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      }),
    [sessionId],
  );

  const { messages, sendMessage, status, error } = useChat({
    id: sessionId,
    messages: initialMessages,
    transport,
  });

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isLoading = status === "submitted" || status === "streaming";

  // Auto-scroll on new content
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, status]);

  // Auto-focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, [status]);

  const onSubmit = async (text: string) => {
    const value = text.trim();
    if (!value || isLoading) return;
    setInput("");
    await sendMessage({ text: value });
  };

  const showQuickReplies = messages.length <= 1 && !isLoading;

  return (
    <div className="fixed inset-0 md:inset-auto md:bottom-6 md:right-6 z-[70] md:w-[400px] md:h-[640px] md:max-h-[85vh] flex flex-col bg-white md:rounded-3xl shadow-2xl overflow-hidden border border-pink-100">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-br from-pink-500 to-pink-600 text-white">
        <div className="relative h-11 w-11 shrink-0">
          <img
            src={specialistAvatar}
            alt="Sofia"
            width={88}
            height={88}
            className="h-11 w-11 rounded-full object-cover ring-2 ring-white/30"
          />
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-pink-500" />
        </div>
        <div className="flex-1 min-w-0 leading-tight">
          <div className="font-medium text-[15px]">Sofia · Skin Specialist</div>
          <div className="text-[11px] opacity-90 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Online now · GLO+ clinic
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close chat"
          className="p-2 rounded-full hover:bg-white/15 transition"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-5 space-y-4 bg-pink-50/40"
      >
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        {isLoading && <TypingIndicator />}
        {error && (
          <div className="text-xs text-red-600 px-3 py-2 bg-red-50 rounded-lg">
            Sorry, something went wrong. Please try again in a moment.
          </div>
        )}

        {showQuickReplies && (
          <div className="flex flex-wrap gap-2 pt-2">
            {QUICK_REPLIES.map((q) => (
              <button
                key={q}
                onClick={() => onSubmit(q)}
                className="text-xs px-3 py-2 rounded-full bg-white border border-pink-200 text-pink-700 hover:bg-pink-100 transition"
              >
                {q}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(input);
        }}
        className="border-t border-pink-100 bg-white p-3 flex items-end gap-2"
      >
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSubmit(input);
            }
          }}
          rows={1}
          placeholder="Type your message…"
          disabled={isLoading}
          className="flex-1 resize-none max-h-32 rounded-2xl border border-pink-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="h-10 w-10 shrink-0 rounded-full bg-pink-500 hover:bg-pink-600 text-white flex items-center justify-center transition disabled:opacity-40"
          aria-label="Send"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

function MessageBubble({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";
  const text = message.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join("")
    .trim();
  const toolParts = message.parts.filter((p) => p.type?.startsWith("tool-"));

  if (!text && toolParts.length === 0) return null;

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] text-sm leading-relaxed",
          isUser
            ? "bg-pink-500 text-white px-4 py-2.5 rounded-2xl rounded-br-md"
            : "text-gray-800",
        )}
      >
        {!isUser && text && (
          <div className="px-1">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => (
                  <p className="mb-2 last:mb-0">{children}</p>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-pink-700">
                    {children}
                  </strong>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>
                ),
                a: ({ children, href }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-pink-600 underline"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {text}
            </ReactMarkdown>
          </div>
        )}
        {isUser && <span className="whitespace-pre-wrap">{text}</span>}

        {toolParts.map((p, idx) => (
          <ToolPartRender key={idx} part={p} />
        ))}
      </div>
    </div>
  );
}

function ToolPartRender({ part }: { part: UIMessage["parts"][number] }) {
  const type = part.type ?? "";
  // Booking success card
  if (type === "tool-book_appointment") {
    const state = (part as { state?: string }).state;
    const output = (part as { output?: { success?: boolean; treatmentName?: string; datetime?: string } }).output;
    if (state === "output-available" && output?.success) {
      const dt = output.datetime ? new Date(output.datetime) : null;
      return (
        <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
            <span className="h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center">
              ✓
            </span>
            You're booked
          </div>
          <div className="mt-2 text-sm text-gray-700">
            <div className="font-medium">{output.treatmentName}</div>
            {dt && (
              <div className="text-xs text-gray-600 mt-0.5">
                {dt.toLocaleString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  timeZone: "America/Los_Angeles",
                })}{" "}
                PT
              </div>
            )}
            <div className="text-[11px] text-gray-500 mt-2">
              A confirmation is on its way to your email.
            </div>
          </div>
        </div>
      );
    }
  }
  return null;
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-white rounded-2xl rounded-bl-md px-4 py-2.5 shadow-sm flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Dot delay="0s" />
          <Dot delay="0.15s" />
          <Dot delay="0.3s" />
        </div>
        <span className="text-[12px] text-pink-600/80">Sofia is typing…</span>
      </div>
    </div>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="h-2 w-2 rounded-full bg-pink-400 animate-bounce"
      style={{ animationDelay: delay }}
    />
  );
}
