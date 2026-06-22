import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { X, Send, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { getTreatmentBySlug, getActiveTreatments } from "@/config/treatmentRegistry";
import type { IntakeField, TreatmentConfig } from "@/config/treatments";
import specialistAvatar from "@/assets/specialist-avatar.jpg";

const SESSION_KEY = "lumiere_chat_session_id";
const ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/skin-specialist-chat`;

const WELCOME_MESSAGE: UIMessage = {
  id: "welcome",
  role: "assistant",
  parts: [
    {
      type: "text",
      text:
        "Hi, I'm Sofia, one of the skin specialists at Pearl Med Spa. I'm here to help you find the right treatment and book your spot, right inside this chat.\n\nWhat's bothering you most about your skin lately?",
    },
  ],
};

const DEFAULT_QUICK_REPLIES = [
  "Fine lines & wrinkles",
  "Sagging skin",
  "Dull, tired skin",
  "I have a question",
];

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
          const ui: UIMessage[] = msgs.map((m) => ({
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

type ToolPart = UIMessage["parts"][number] & {
  type: string;
  state?: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
};

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

  const { messages, sendMessage, status, error, stop, regenerate } = useChat({
    id: sessionId,
    messages: initialMessages,
    transport,
  });

  const [input, setInput] = useState("");
  const [submittedForms, setSubmittedForms] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  // Only "submitted" / "streaming" should disable input. "error" must re-enable
  // it so the visitor can retry instead of being stuck.
  const isLoading = status === "submitted" || status === "streaming";

  // Safety net: if the stream stalls (no status change for 45s while still
  // marked streaming) abort it so the textarea recovers.
  useEffect(() => {
    if (!isLoading) return;
    const t = setTimeout(() => {
      try {
        stop();
      } catch {
        /* noop */
      }
    }, 45000);
    return () => clearTimeout(t);
  }, [isLoading, messages.length, stop]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, status]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [status]);

  const onSubmit = async (text: string) => {
    const value = text.trim();
    if (!value || isLoading) return;
    setInput("");
    await sendMessage({ text: value });
  };

  // Determine the most recent quick-reply set from the latest assistant message.
  const latestAssistant = [...messages].reverse().find((m) => m.role === "assistant");
  const latestQuickReplies = useMemo<string[]>(() => {
    if (!latestAssistant) return [];
    const parts = (latestAssistant.parts ?? []) as ToolPart[];
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      if (p.type === "tool-suggest_quick_replies" && p.state === "output-available") {
        const out = p.output as { replies?: string[] } | undefined;
        if (out?.replies?.length) return out.replies;
      }
    }
    return [];
  }, [latestAssistant]);

  const showInitialQuickReplies = messages.length <= 1 && !isLoading;
  const chips = showInitialQuickReplies
    ? [...getActiveTreatments().map((t) => `Tell me about the ${t.label}`), ...DEFAULT_QUICK_REPLIES]
    : !isLoading
      ? latestQuickReplies
      : [];

  const handleBookingFormSubmit = async (
    treatment: TreatmentConfig,
    payload: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      intakeAnswers: Record<string, string | string[]>;
      datetime: string;
    },
    formInstanceKey: string,
  ) => {
    setSubmittedForms((prev) => new Set(prev).add(formInstanceKey));
    const text = `[BOOKING_FORM_SUBMISSION] ${JSON.stringify({
      ...payload,
      treatmentSlug: treatment.slug,
    })}`;
    await sendMessage({ text });
  };

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
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Online now · Pearl Med Spa
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
          <MessageBubble
            key={m.id}
            message={m}
            submittedForms={submittedForms}
            onBookingFormSubmit={handleBookingFormSubmit}
          />
        ))}
        {isLoading && <TypingIndicator />}
        {error && (
          <div className="flex items-center justify-between gap-3 text-xs text-red-700 px-3 py-2 bg-red-50 border border-red-100 rounded-lg">
            <span>Connection hiccup. Tap retry to continue.</span>
            <button
              type="button"
              onClick={() => regenerate()}
              className="px-2 py-1 rounded-md bg-red-100 hover:bg-red-200 font-medium"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Quick replies */}
      {chips.length > 0 && (
        <div className="px-3 pt-2 pb-1 flex flex-wrap gap-2 border-t border-pink-100 bg-white">
          {chips.map((q) => (
            <button
              key={q}
              onClick={() => onSubmit(q)}
              className="text-xs px-3 py-1.5 rounded-full bg-pink-50 border border-pink-200 text-pink-700 hover:bg-pink-100 transition"
            >
              {q}
            </button>
          ))}
        </div>
      )}

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

function MessageBubble({
  message,
  submittedForms,
  onBookingFormSubmit,
}: {
  message: UIMessage;
  submittedForms: Set<string>;
  onBookingFormSubmit: (
    treatment: TreatmentConfig,
    payload: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      intakeAnswers: Record<string, string | string[]>;
      datetime: string;
    },
    formInstanceKey: string,
  ) => Promise<void>;
}) {
  const isUser = message.role === "user";
  const text = message.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join("")
    .trim();

  // Hide the [BOOKING_FORM_SUBMISSION] message from the visitor — it's an internal payload.
  const isFormSubmissionMsg = isUser && text.startsWith("[BOOKING_FORM_SUBMISSION]");

  const toolParts = (message.parts as ToolPart[]).filter((p) =>
    typeof p.type === "string" && p.type.startsWith("tool-"),
  );

  if (!text && toolParts.length === 0) return null;
  if (isFormSubmissionMsg && toolParts.length === 0) return null;

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[88%] text-sm leading-relaxed",
          isUser && !isFormSubmissionMsg
            ? "bg-pink-500 text-white px-4 py-2.5 rounded-2xl rounded-br-md"
            : "text-gray-800 w-full",
        )}
      >
        {!isUser && text && (
          <div className="px-1">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                strong: ({ children }) => (
                  <strong className="font-semibold text-pink-700">{children}</strong>
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
        {isUser && !isFormSubmissionMsg && (
          <span className="whitespace-pre-wrap">{text}</span>
        )}

        {toolParts.map((p, idx) => (
          <ToolPartRender
            key={`${message.id}-${idx}`}
            messageId={message.id}
            part={p}
            partIndex={idx}
            submittedForms={submittedForms}
            onBookingFormSubmit={onBookingFormSubmit}
          />
        ))}
      </div>
    </div>
  );
}

function ToolPartRender({
  messageId,
  part,
  partIndex,
  submittedForms,
  onBookingFormSubmit,
}: {
  messageId: string;
  part: ToolPart;
  partIndex: number;
  submittedForms: Set<string>;
  onBookingFormSubmit: (
    treatment: TreatmentConfig,
    payload: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      intakeAnswers: Record<string, string | string[]>;
      datetime: string;
    },
    formInstanceKey: string,
  ) => Promise<void>;
}) {
  const type = part.type;

  // Booking form card
  if (type === "tool-request_booking_form") {
    if (part.state !== "output-available") return null;
    const out = part.output as
      | { ready?: boolean; treatmentSlug?: string; datetime?: string; date?: string; time?: string }
      | undefined;
    if (!out?.ready || !out.treatmentSlug || !out.datetime) return null;
    const treatment = getTreatmentBySlug(out.treatmentSlug);
    if (!treatment.intakeFields?.length) return null;
    const formKey = `${messageId}-${partIndex}`;
    return (
      <BookingFormCard
        treatment={treatment}
        datetime={out.datetime}
        dateLabel={out.date}
        timeLabel={out.time}
        submitted={submittedForms.has(formKey)}
        onSubmit={(payload) => onBookingFormSubmit(treatment, payload, formKey)}
      />
    );
  }

  // Booking success card
  if (type === "tool-book_appointment") {
    if (part.state !== "output-available") return null;
    const output = part.output as
      | {
          success?: boolean;
          treatmentName?: string;
          datetime?: string;
          appointmentId?: number | string;
          error?: string;
        }
      | undefined;
    if (!output) return null;

    if (output.success === false) {
      return (
        <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          {output.error || "Could not complete the booking."}
        </div>
      );
    }

    if (output.success) {
      const dt = output.datetime ? new Date(output.datetime) : null;
      return (
        <BookingSuccessCard
          treatmentName={output.treatmentName ?? "Your appointment"}
          datetime={dt}
          appointmentId={output.appointmentId}
        />
      );
    }
  }

  // Quick replies are rendered above the composer, not inline.
  return null;
}

function BookingSuccessCard({
  treatmentName,
  datetime,
  appointmentId,
}: {
  treatmentName: string;
  datetime: Date | null;
  appointmentId?: number | string;
}) {
  // Fire Meta Pixel Schedule event, deduped per-appointment.
  useEffect(() => {
    if (!appointmentId) return;
    const key = `pixel_schedule_sent_${appointmentId}`;
    if (typeof window === "undefined") return;
    try {
      if (sessionStorage.getItem(key)) return;
      const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
      if (typeof fbq === "function") {
        fbq(
          "track",
          "Schedule",
          {
            content_name: treatmentName,
            content_category: "Booking",
            appointment_id: String(appointmentId),
            source: "sofia_chatbot",
          },
          { eventID: `schedule_${appointmentId}` },
        );
      }
      sessionStorage.setItem(key, "1");
    } catch {
      // ignore
    }
  }, [appointmentId, treatmentName]);

  return (
    <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
      <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
        <CheckCircle2 className="h-5 w-5" />
        You're booked
      </div>
      <div className="mt-2 text-sm text-gray-700">
        <div className="font-medium">{treatmentName}</div>
        {datetime && (
          <div className="text-xs text-gray-600 mt-0.5">
            {datetime.toLocaleString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
              timeZone: "America/Toronto",
            })}{" "}
            ET
          </div>
        )}
        <div className="text-[11px] text-gray-500 mt-2">
          A confirmation is on its way to your email and phone.
        </div>
      </div>
    </div>
  );
}

// ---------- Booking Form Card (dynamic per treatment) ----------

type BookingFormPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  intakeAnswers: Record<string, string | string[]>;
  datetime: string;
};

function BookingFormCard({
  treatment,
  datetime,
  dateLabel,
  timeLabel,
  submitted,
  onSubmit,
}: {
  treatment: TreatmentConfig;
  datetime: string;
  dateLabel?: string;
  timeLabel?: string;
  submitted: boolean;
  onSubmit: (payload: BookingFormPayload) => Promise<void> | void;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const fields = treatment.intakeFields ?? [];

  const setAnswer = (id: number, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [String(id)]: value }));
    setErrors((prev) => {
      if (!prev[String(id)]) return prev;
      const { [String(id)]: _, ...rest } = prev;
      return rest;
    });
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!firstName.trim()) next.firstName = "Required";
    if (!lastName.trim()) next.lastName = "Required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      next.email = "Enter a valid email";
    if (!/^\+?[\d\s().-]{7,}$/.test(phone.trim())) next.phone = "Enter a valid phone";

    for (const f of fields) {
      if (!f.required) continue;
      const v = answers[String(f.acuityFieldId)];
      const empty =
        v === undefined ||
        v === null ||
        (typeof v === "string" && v.trim() === "") ||
        (Array.isArray(v) && v.length === 0);
      if (empty) next[String(f.acuityFieldId)] = "Required";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (submitted || submitting) return;
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        intakeAnswers: answers,
        datetime,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="mt-3 rounded-2xl border border-pink-200 bg-white p-4 text-sm text-gray-600">
        Form submitted — booking your slot now…
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-2xl border border-pink-200 bg-white p-4 space-y-3 shadow-sm">
      <div>
        <div className="text-[11px] uppercase tracking-wide text-pink-600 font-semibold">
          Booking form
        </div>
        <div className="text-sm font-semibold text-gray-900">{treatment.label}</div>
        {(dateLabel || timeLabel) && (
          <div className="text-xs text-gray-600 mt-0.5">
            {[dateLabel, timeLabel].filter(Boolean).join(" · ")}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <TextInput
          label="First name"
          value={firstName}
          onChange={setFirstName}
          error={errors.firstName}
          required
        />
        <TextInput
          label="Last name"
          value={lastName}
          onChange={setLastName}
          error={errors.lastName}
          required
        />
      </div>
      <TextInput
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        error={errors.email}
        required
      />
      <TextInput
        label="Phone"
        type="tel"
        value={phone}
        onChange={setPhone}
        error={errors.phone}
        required
      />

      {fields.map((f) => (
        <IntakeFieldInput
          key={f.acuityFieldId}
          field={f}
          value={answers[String(f.acuityFieldId)]}
          onChange={(v) => setAnswer(f.acuityFieldId, v)}
          error={errors[String(f.acuityFieldId)]}
        />
      ))}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full mt-1 h-10 rounded-full bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold transition disabled:opacity-50"
      >
        {submitting ? "Booking…" : "Confirm my booking"}
      </button>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  error,
  required,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  required?: boolean;
  type?: "text" | "email" | "tel";
}) {
  return (
    <label className="block text-xs">
      <span className="text-gray-700">
        {label} {required && <span className="text-pink-500">*</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300",
          error ? "border-rose-400" : "border-pink-200",
        )}
      />
      {error && <span className="mt-0.5 block text-[11px] text-rose-600">{error}</span>}
    </label>
  );
}

function IntakeFieldInput({
  field,
  value,
  onChange,
  error,
}: {
  field: IntakeField;
  value: string | string[] | undefined;
  onChange: (v: string | string[]) => void;
  error?: string;
}) {
  const label = (
    <span className="text-gray-700 text-xs">
      {field.label} {field.required && <span className="text-pink-500">*</span>}
    </span>
  );

  if (field.type === "checkboxes") {
    const current = Array.isArray(value) ? value : [];
    return (
      <div>
        {label}
        {field.helpText && (
          <div className="text-[11px] text-gray-500 mt-0.5">{field.helpText}</div>
        )}
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {(field.options ?? []).map((opt) => {
            const active = current.includes(opt);
            return (
              <button
                type="button"
                key={opt}
                onClick={() =>
                  onChange(
                    active
                      ? current.filter((c) => c !== opt)
                      : [...current, opt],
                  )
                }
                className={cn(
                  "text-xs px-2.5 py-1 rounded-full border transition",
                  active
                    ? "bg-pink-500 text-white border-pink-500"
                    : "bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100",
                )}
              >
                {opt}
              </button>
            );
          })}
        </div>
        {error && <span className="mt-1 block text-[11px] text-rose-600">{error}</span>}
      </div>
    );
  }

  if (field.type === "radio") {
    const current = typeof value === "string" ? value : "";
    return (
      <div>
        {label}
        {field.helpText && (
          <div className="text-[11px] text-gray-500 mt-0.5">{field.helpText}</div>
        )}
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {(field.options ?? []).map((opt) => {
            const active = current === opt;
            return (
              <button
                type="button"
                key={opt}
                onClick={() => onChange(opt)}
                className={cn(
                  "text-xs px-3 py-1 rounded-full border transition",
                  active
                    ? "bg-pink-500 text-white border-pink-500"
                    : "bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100",
                )}
              >
                {opt}
              </button>
            );
          })}
        </div>
        {error && <span className="mt-1 block text-[11px] text-rose-600">{error}</span>}
      </div>
    );
  }

  if (field.type === "yesno") {
    const current = typeof value === "string" ? value : "";
    return (
      <div>
        {label}
        {field.helpText && (
          <div className="text-[11px] text-gray-500 mt-0.5">{field.helpText}</div>
        )}
        <div className="mt-1.5 inline-flex rounded-full border border-pink-200 overflow-hidden text-xs">
          {["Yes", "No"].map((opt) => {
            const active = current === opt;
            return (
              <button
                type="button"
                key={opt}
                onClick={() => onChange(opt)}
                className={cn(
                  "px-4 py-1.5 transition",
                  active
                    ? "bg-pink-500 text-white"
                    : "bg-white text-pink-700 hover:bg-pink-50",
                )}
              >
                {opt}
              </button>
            );
          })}
        </div>
        {error && <span className="mt-1 block text-[11px] text-rose-600">{error}</span>}
      </div>
    );
  }

  if (field.type === "select") {
    const current = typeof value === "string" ? value : "";
    return (
      <label className="block">
        {label}
        <select
          value={current}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300",
            error ? "border-rose-400" : "border-pink-200",
          )}
        >
          <option value="">Select...</option>
          {(field.options ?? []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {error && <span className="mt-0.5 block text-[11px] text-rose-600">{error}</span>}
      </label>
    );
  }

  if (field.type === "textarea") {
    const current = typeof value === "string" ? value : "";
    return (
      <label className="block">
        {label}
        <textarea
          value={current}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className={cn(
            "mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300",
            error ? "border-rose-400" : "border-pink-200",
          )}
        />
        {error && <span className="mt-0.5 block text-[11px] text-rose-600">{error}</span>}
      </label>
    );
  }

  // text
  const current = typeof value === "string" ? value : "";
  return (
    <label className="block">
      {label}
      <input
        type="text"
        value={current}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300",
          error ? "border-rose-400" : "border-pink-200",
        )}
      />
      {error && <span className="mt-0.5 block text-[11px] text-rose-600">{error}</span>}
    </label>
  );
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
