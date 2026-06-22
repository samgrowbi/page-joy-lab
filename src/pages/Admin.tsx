import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, MessageSquare, RefreshCw, User } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

type Conversation = {
  id: string;
  session_id: string;
  started_at: string;
  last_message_at: string;
  lead_name: string | null;
  lead_email: string | null;
  lead_phone: string | null;
  lead_concern: string | null;
  booked_appointment_id: string | null;
  booked_treatment_slug: string | null;
  booked_datetime: string | null;
};

type Message = {
  id: string;
  conversation_id: string;
  role: string;
  parts: unknown;
  created_at: string;
};

export default function Admin() {
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingConvs, setLoadingConvs] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  useEffect(() => {
    document.title = "GLO+ | Admin Conversations";
  }, []);

  useEffect(() => {
    const init = async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        navigate("/auth", { replace: true });
        return;
      }
      setUserEmail(sess.session.user.email ?? null);
      const { data: roleRow } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", sess.session.user.id)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!roleRow);
      setCheckingAuth(false);
    };
    init();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate("/auth", { replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const loadConversations = async () => {
    setLoadingConvs(true);
    const { data, error } = await supabase
      .from("chat_conversations")
      .select("*")
      .order("last_message_at", { ascending: false })
      .limit(500);
    if (error) toast.error(error.message);
    else setConversations((data ?? []) as Conversation[]);
    setLoadingConvs(false);
  };

  useEffect(() => {
    if (isAdmin) loadConversations();
  }, [isAdmin]);

  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }
    setLoadingMsgs(true);
    supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", activeId)
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (error) toast.error(error.message);
        else setMessages((data ?? []) as Message[]);
        setLoadingMsgs(false);
      });
  }, [activeId]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth", { replace: true });
  };

  const activeConv = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId],
  );

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-pink-50/60 px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-8 max-w-md text-center">
          <h1 className="text-2xl font-serif text-gray-900 mb-2">Not authorized</h1>
          <p className="text-sm text-gray-600 mb-6">
            Your account ({userEmail}) doesn't have admin access yet. Ask the site owner to grant you admin role.
          </p>
          <Button onClick={handleSignOut} variant="outline" className="w-full">
            <LogOut className="h-4 w-4 mr-2" /> Sign out
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-pink-50/40">
      <header className="bg-white border-b border-pink-100 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif text-gray-900">Conversations</h1>
          <p className="text-xs text-gray-500">Signed in as {userEmail}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadConversations} disabled={loadingConvs}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loadingConvs ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-1" /> Sign out
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[360px_1fr] gap-4 p-4 h-[calc(100vh-72px)]">
        {/* Conversations list */}
        <aside className="bg-white rounded-xl border border-pink-100 overflow-y-auto">
          {conversations.length === 0 && !loadingConvs && (
            <div className="p-6 text-sm text-gray-500 text-center">No conversations yet.</div>
          )}
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={`w-full text-left px-4 py-3 border-b border-pink-50 hover:bg-pink-50/60 transition ${
                activeId === c.id ? "bg-pink-50" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-sm text-gray-900 truncate">
                  {c.lead_name || c.lead_email || c.lead_phone || `Visitor ${c.session_id.slice(0, 8)}`}
                </span>
                <span className="text-[10px] text-gray-400 shrink-0">
                  {format(new Date(c.last_message_at), "MMM d, HH:mm")}
                </span>
              </div>
              {c.lead_concern && (
                <div className="text-xs text-gray-500 truncate mt-0.5">{c.lead_concern}</div>
              )}
              <div className="flex gap-1 mt-1">
                {c.booked_appointment_id && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">
                    Booked
                  </span>
                )}
                {c.lead_email && (
                  <span className="text-[10px] bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded">
                    Lead
                  </span>
                )}
              </div>
            </button>
          ))}
        </aside>

        {/* Messages panel */}
        <section className="bg-white rounded-xl border border-pink-100 flex flex-col overflow-hidden">
          {!activeConv ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              <MessageSquare className="h-5 w-5 mr-2" /> Select a conversation
            </div>
          ) : (
            <>
              <div className="px-5 py-4 border-b border-pink-50 bg-pink-50/40">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="font-medium text-gray-900 flex items-center gap-2">
                      <User className="h-4 w-4 text-pink-500" />
                      {activeConv.lead_name || "Anonymous visitor"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 space-x-3">
                      {activeConv.lead_email && <span>📧 {activeConv.lead_email}</span>}
                      {activeConv.lead_phone && <span>📱 {activeConv.lead_phone}</span>}
                    </div>
                    {activeConv.lead_concern && (
                      <div className="text-xs text-gray-600 mt-1">
                        <span className="font-medium">Concern:</span> {activeConv.lead_concern}
                      </div>
                    )}
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    <div>Started {format(new Date(activeConv.started_at), "MMM d, yyyy HH:mm")}</div>
                    {activeConv.booked_appointment_id && (
                      <div className="text-emerald-600 font-medium mt-1">
                        ✓ Booked {activeConv.booked_treatment_slug}
                        {activeConv.booked_datetime &&
                          ` · ${format(new Date(activeConv.booked_datetime), "MMM d, HH:mm")}`}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {loadingMsgs && <div className="text-xs text-gray-400">Loading messages...</div>}
                {messages.map((m) => (
                  <MessageRow key={m.id} message={m} />
                ))}
                {!loadingMsgs && messages.length === 0 && (
                  <div className="text-xs text-gray-400">No messages.</div>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

function MessageRow({ message }: { message: Message }) {
  const text = extractText(message.parts);
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
          isUser
            ? "bg-pink-500 text-white rounded-br-md"
            : "bg-pink-50 text-gray-800 rounded-bl-md"
        }`}
      >
        {text || <span className="opacity-60 text-xs">[no text]</span>}
        <div className={`text-[10px] mt-1 opacity-70`}>
          {format(new Date(message.created_at), "HH:mm:ss")}
        </div>
      </div>
    </div>
  );
}

function extractText(parts: unknown): string {
  if (!Array.isArray(parts)) return "";
  return parts
    .map((p) => {
      if (p && typeof p === "object" && "type" in p) {
        const part = p as { type: string; text?: string };
        if (part.type === "text" && part.text) return part.text;
      }
      return "";
    })
    .join("")
    .trim();
}
