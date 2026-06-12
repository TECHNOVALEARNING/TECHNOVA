import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { MessageCircle, Send, Loader2, User, Store, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface BuyerTicket {
  id: string;
  subject: string;
  status: string;
  created_at: string;
  customers: {
    name: string;
    email: string;
  };
}

interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_type: string;
  content: string;
  created_at: string;
}

const DashboardBuyerTicketsTab = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<BuyerTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<BuyerTicket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) loadTickets();
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!selectedTicket) return;
    const channel = supabase
      .channel(`support-ticket-msgs-${selectedTicket.id}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "support_ticket_messages",
        filter: `ticket_id=eq.${selectedTicket.id}`,
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as TicketMessage]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedTicket]);

  const loadTickets = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("support_tickets")
      .select("id, subject, status, created_at, customers(name, email)")
      .eq("store_owner_id", user?.id)
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error fetching tickets:", error);
      toast.error("Erreur de chargement des tickets: " + error.message);
    }
    setTickets((data as any) || []);
    setLoading(false);
  };

  const selectTicket = async (ticket: BuyerTicket) => {
    setSelectedTicket(ticket);
    const { data } = await supabase
      .from("support_ticket_messages")
      .select("*")
      .eq("ticket_id", ticket.id)
      .order("created_at", { ascending: true });
    setMessages((data as any) || []);
  };

  const sendReply = async () => {
    if (!input.trim() || !selectedTicket || !user) return;
    setSending(true);

    try {
      await supabase.from("support_ticket_messages").insert({
        ticket_id: selectedTicket.id,
        sender_type: "seller",
        sender_id: user.id,
        content: input.trim(),
      } as any);

      // Send email to buyer via store-contact
      await supabase.functions.invoke("store-contact", {
        body: {
          action: "reply",
          store_owner_id: user.id,
          recipient_email: selectedTicket.customers.email,
          recipient_name: selectedTicket.customers.name,
          reply_message: input.trim(),
          original_message: "Vous avez reçu une réponse concernant votre ticket : " + selectedTicket.subject,
        },
      });

      setInput("");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'envoi");
    } finally {
      setSending(false);
    }
  };

  const closeTicket = async (ticketId: string) => {
    await supabase
      .from("support_tickets")
      .update({ status: "closed" } as any)
      .eq("id", ticketId);
      
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: "closed" } : t))
    );
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, status: "closed" });
    }
    toast.success("Ticket fermé");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-280px)]">
      <div className="border border-border rounded-xl bg-card overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-border">
          <p className="text-sm font-semibold text-foreground">Tickets Commandes</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Aucun ticket reçu</p>
            </div>
          ) : (
            tickets.map((ticket) => (
              <button
                key={ticket.id}
                onClick={() => selectTicket(ticket)}
                className={`w-full text-left px-4 py-3 border-b border-border transition-colors hover:bg-muted/50 ${
                  selectedTicket?.id === ticket.id ? "bg-primary/5" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-foreground truncate">{ticket.customers?.name || "Client"}</p>
                  <Badge variant={ticket.status === "open" ? "default" : "secondary"} className="text-[10px]">
                    {ticket.status === "open" ? "Ouvert" : "Fermé"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">{ticket.subject}</p>
                <p className="text-[10px] text-muted-foreground/60 mt-1">
                  {new Date(ticket.created_at).toLocaleDateString("fr", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="lg:col-span-2 border border-border rounded-xl bg-card overflow-hidden flex flex-col">
        {!selectedTicket ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <MessageCircle className="h-12 w-12 mb-3 opacity-20" />
            <p className="text-sm">Sélectionnez un ticket pour répondre</p>
          </div>
        ) : (
          <>
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">{selectedTicket.customers?.name || "Client"}</p>
                <p className="text-[11px] text-muted-foreground">{selectedTicket.customers?.email}</p>
              </div>
              <div className="flex items-center gap-2">
                {selectedTicket.status === "open" && (
                  <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => closeTicket(selectedTicket.id)}>
                    <CheckCircle className="h-3 w-3" />
                    Fermer
                  </Button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender_type === "seller" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex items-start gap-2 max-w-[80%] ${msg.sender_type === "seller" ? "flex-row-reverse" : ""}`}>
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${
                      msg.sender_type === "customer" ? "bg-primary/10 text-primary" : "bg-emerald-500/10 text-emerald-600"
                    }`}>
                      {msg.sender_type === "customer" ? <User className="h-3 w-3" /> : <Store className="h-3 w-3" />}
                    </div>
                    <div className={`rounded-2xl px-3 py-2 text-sm ${
                      msg.sender_type === "seller"
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-muted text-foreground rounded-tl-sm"
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {selectedTicket.status === "open" && (
              <div className="border-t border-border px-3 py-3 bg-muted/30">
                <form onSubmit={(e) => { e.preventDefault(); sendReply(); }} className="flex items-center gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Votre réponse (sera envoyée par email au client)..."
                    className="flex-1 bg-white dark:bg-black border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || sending}
                    className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50"
                  >
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </button>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardBuyerTicketsTab;
