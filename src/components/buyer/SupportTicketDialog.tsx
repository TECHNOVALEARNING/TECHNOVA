import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Send, MessageCircle } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  productId: string;
  customerId: string;
}

interface Ticket {
  id: string;
  subject: string;
  status: string;
}
interface Message {
  id: string;
  sender_type: "customer" | "seller";
  content: string;
  created_at: string;
}

const SupportTicketDialog = ({ open, onOpenChange, orderId, productId, customerId }: Props) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [displayOrderId, setDisplayOrderId] = useState(`#${orderId.slice(0, 8).toUpperCase()}`);
  const [sending, setSending] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data: t } = await supabase
      .from("support_tickets")
      .select("id, subject, status")
      .eq("order_id", orderId)
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });
      
    if (t && t.length > 0) {
      setTickets(t as Ticket[]);
      // Si le dernier ticket est toujours ouvert, on l'affiche par défaut
      if (t[0].status !== "closed") {
        setActiveTicket(t[0] as Ticket);
        loadMessages(t[0].id);
      } else {
        setActiveTicket(null);
        setMessages([]);
      }
    } else {
      setTickets([]);
      setActiveTicket(null);
      setMessages([]);
    }
    
    // Load customer details for prepopulation
    const { data: cust } = await supabase.from("customers").select("email, phone").eq("id", customerId).maybeSingle();
    if (cust) {
      if (!customerEmail) setCustomerEmail(cust.email || "");
      if (!phoneNumber) setPhoneNumber(cust.phone || "");
    }
    
    setLoading(false);
  };

  const loadMessages = async (ticketId: string) => {
    const { data: msgs } = await supabase
      .from("support_ticket_messages")
      .select("id, sender_type, content, created_at")
      .eq("ticket_id", ticketId)
      .order("created_at");
    setMessages((msgs as Message[]) || []);
  };

  useEffect(() => {
    if (open) void load();
  }, [open, orderId]);

  useEffect(() => {
    if (!activeTicket) return;
    const channel = supabase
      .channel(`buyer-ticket-msgs-${activeTicket.id}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "support_ticket_messages",
        filter: `ticket_id=eq.${activeTicket.id}`,
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeTicket]);

  const createTicket = async () => {
    if (!subject.trim() || !content.trim()) {
      toast.error("Sujet et message requis");
      return;
    }
    setSending(true);
    try {
      // store_owner_id pulled via product
      const { data: prod } = await supabase
        .from("products").select("creator_id").eq("id", productId).single();
      const { data: t, error } = await supabase
        .from("support_tickets")
        .insert({
          order_id: orderId,
          product_id: productId,
          customer_id: customerId,
          store_owner_id: (prod as any).creator_id,
          subject: subject.trim(),
        } as any)
        .select("id, subject, status")
        .single();
      if (error) throw error;
      const ticketRow = t as Ticket;
      await supabase.from("support_ticket_messages").insert({
        ticket_id: ticketRow.id,
        sender_type: "customer",
        sender_id: customerId,
        content: content.trim(),
      } as any);

      // Notify seller
      await supabase.from("notifications").insert({
        user_id: (prod as any).creator_id,
        title: "Nouveau ticket de support acheteur",
        message: `L'acheteur ${customerEmail} a ouvert un ticket pour la commande #${orderId.slice(0,8).toUpperCase()}`,
        type: "support"
      } as any);

      // Send email via notify-support-ticket to alert seller
      await supabase.functions.invoke("notify-support-ticket", {
        body: {
          action: "new_ticket",
          userId: customerId,
          userName: "Acheteur - Commande #" + orderId.slice(0, 8).toUpperCase(),
          userEmail: customerEmail,
          subject: subject.trim(),
          transcript: content.trim()
        }
      });

      setActiveTicket(ticketRow);
      setContent("");
      setSubject("");
      await load();
      toast.success("Ticket envoyé au vendeur. Il vous répondra par email.");
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de l'envoi");
    } finally {
      setSending(false);
    }
  };

  const sendReply = async () => {
    if (!activeTicket || !content.trim()) return;
    setSending(true);
    const { error } = await supabase.from("support_ticket_messages").insert({
      ticket_id: activeTicket.id,
      sender_type: "customer",
      sender_id: customerId,
      content: content.trim(),
    } as any);
    setSending(false);
    if (error) {
      toast.error("Envoi impossible");
      return;
    }
    setContent("");
    await loadMessages(activeTicket.id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg w-[95vw] p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" /> Support pour cette commande
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : activeTicket ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => setActiveTicket(null)} className="text-xs">
                &larr; Retour
              </Button>
            </div>
            <div className="rounded-lg border border-border bg-secondary/40 p-3">
              <p className="text-xs text-muted-foreground">Sujet</p>
              <p className="text-sm font-semibold text-foreground">{activeTicket.subject}</p>
              <p className="mt-1 text-[11px] uppercase text-muted-foreground">Statut: {activeTicket.status}</p>
            </div>
            <div className="max-h-60 sm:max-h-72 space-y-2 overflow-y-auto pr-1">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`rounded-xl p-3 text-sm ${
                    m.sender_type === "customer"
                      ? "bg-primary/10 ml-6 sm:ml-12"
                      : "bg-secondary mr-6 sm:mr-12"
                  }`}
                >
                  <p className="text-[10px] uppercase text-muted-foreground mb-1">
                    {m.sender_type === "customer" ? "Vous" : "Vendeur"}
                  </p>
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
              ))}
              {messages.length === 0 && (
                <p className="text-center text-sm text-muted-foreground">Aucun message.</p>
              )}
            </div>
            {activeTicket.status !== "closed" ? (
              <>
                <Textarea
                  placeholder="Votre réponse…"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-20 text-sm"
                />
                <Button onClick={sendReply} disabled={sending} className="w-full gap-2 mt-2">
                  <Send className="h-4 w-4" /> Envoyer
                </Button>
              </>
            ) : (
              <div className="rounded-lg bg-destructive/10 p-3 text-center text-sm text-destructive font-medium">
                Ce ticket est fermé. Vous ne pouvez plus y répondre.
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Numéro de commande</label>
                <Input 
                  value={displayOrderId} 
                  onChange={(e) => setDisplayOrderId(e.target.value)} 
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Email d'achat</label>
                <Input 
                  placeholder="Votre email..."
                  value={customerEmail} 
                  onChange={(e) => setCustomerEmail(e.target.value)} 
                  className="h-9 text-sm"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Numéro utilisé pour l'achat (Optionnel)</label>
              <Input
                placeholder="Votre numéro de téléphone..."
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Sujet du problème</label>
              <Input
                placeholder="Ex: Problème de téléchargement"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Détails du problème</label>
              <Textarea
                placeholder="Décrivez votre problème en détail..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-24 text-sm"
              />
            </div>
            <Button onClick={createTicket} disabled={sending} className="w-full gap-2 mt-2 h-10">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Ouvrir un ticket
            </Button>

            {tickets.length > 0 && (
              <div className="mt-6 border-t pt-4">
                <h4 className="text-sm font-semibold text-foreground mb-3">Historique de vos tickets</h4>
                <div className="space-y-2">
                  {tickets.map(t => (
                    <div 
                      key={t.id} 
                      onClick={() => {
                        setActiveTicket(t);
                        loadMessages(t.id);
                      }}
                      className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/20 hover:bg-secondary/50 cursor-pointer transition-colors"
                    >
                      <div className="truncate pr-3">
                        <p className="text-sm font-medium truncate">{t.subject}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{t.status === 'closed' ? 'Fermé' : 'Ouvert'}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="shrink-0 text-xs h-7 px-2">
                        Voir
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SupportTicketDialog;
