import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MessageSquare, Send, CheckCheck } from "lucide-react";

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY as string | undefined;

export function FeedbackModal({ open, onOpenChange }: FeedbackModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!message.trim()) return;
    if (!WEB3FORMS_KEY) {
      setError("Feedback is not configured. Please contact the site owner.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          name: name.trim() || "Anonymous",
          email: email.trim() || "no-reply@xtoolkit.live",
          message: message.trim(),
          subject: "New feedback — X Toolkit",
        }),
      });

      const data = (await res.json()) as { success?: boolean; message?: string };

      if (!data.success) {
        setError(data.message ?? "Failed to send. Please try again.");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setTimeout(() => {
        setSubmitted(false);
        setName("");
        setEmail("");
        setMessage("");
        setError("");
      }, 300);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md border-border/60 bg-card shadow-xl">
        {!submitted ? (
          <>
            <DialogHeader className="space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-primary" />
                </div>
                <DialogTitle className="text-base font-semibold">Contact / Feedback</DialogTitle>
              </div>
              <DialogDescription>
                Found a bug, have a suggestion, or just want to say hi? We read every message.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
                    Name <span className="font-normal normal-case tracking-normal text-muted-foreground">(optional)</span>
                  </label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="text-sm bg-background/60 border-border/60 focus-visible:ring-primary/40" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
                    Email <span className="font-normal normal-case tracking-normal text-muted-foreground">(optional)</span>
                  </label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="text-sm bg-background/60 border-border/60 focus-visible:ring-primary/40" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
                  Message <span className="text-destructive">*</span>
                </label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what's on your mind — bug reports, feature ideas, or general feedback..."
                  className="min-h-[110px] text-sm bg-background/60 border-border/60 focus-visible:ring-primary/40 resize-none"
                />
                <p className="text-[11px] text-muted-foreground/50">{message.length} characters</p>
              </div>

              {error && (
                <p className="text-xs text-destructive bg-destructive/8 border border-destructive/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <div className="flex items-center justify-between pt-1">
                <p className="text-xs text-muted-foreground/60">We typically respond within 24–48 hours.</p>
                <Button onClick={handleSubmit} disabled={!message.trim() || loading} className="text-xs min-w-[110px] shadow-sm shadow-primary/20">
                  {loading
                    ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Sending...</>
                    : <><Send className="h-3.5 w-3.5 mr-1.5" />Send Message</>}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="py-8 flex flex-col items-center gap-4 text-center">
            <div className="h-14 w-14 rounded-full bg-success/10 border border-success/25 flex items-center justify-center">
              <CheckCheck className="h-6 w-6 text-success" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-semibold">Message sent!</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Thanks for reaching out{name ? `, ${name}` : ""}. We'll get back to you{email ? ` at ${email}` : ""} within 24–48 hours.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => handleClose(false)} className="mt-2 text-xs border-border/60">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
