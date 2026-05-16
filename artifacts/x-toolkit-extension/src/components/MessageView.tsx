import { useState, useEffect } from "react";
import { Message } from "../types";
import { extractOTP, formatDate, stripHtml } from "../lib/otp";

interface MessageViewProps {
  message: Message;
  onBack: () => void;
  fetchBody?: () => Promise<{ body: string; bodyContentType: "html" | "text" }>;
}

function BackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

export function MessageView({ message, onBack, fetchBody }: MessageViewProps) {
  const [body, setBody] = useState(message.body ?? "");
  const [bodyType, setBodyType] = useState<"html" | "text">(message.bodyContentType ?? "text");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!message.body && fetchBody) {
      setLoading(true);
      fetchBody()
        .then((res) => { setBody(res.body); setBodyType(res.bodyContentType); })
        .catch(() => setBody("Failed to load message body."))
        .finally(() => setLoading(false));
    }
  }, [message.id]);

  const plainText = bodyType === "html" ? stripHtml(body) : body;
  const otp = extractOTP(plainText) ?? extractOTP(message.subject);

  const copyOTP = async () => {
    if (!otp) return;
    try {
      await navigator.clipboard.writeText(otp);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      const el = document.createElement("textarea");
      el.value = otp;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", animation: "fade-in 0.2s ease" }}>
      {/* Header */}
      <div style={{ padding: "8px 12px 8px", borderBottom: "1px solid #1e2a3a", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <button
          onClick={onBack}
          style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer", color: "#71767b", borderRadius: 6 }}
        >
          <BackIcon />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#e7e9ea", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {message.subject}
          </div>
          <div style={{ fontSize: 11, color: "#71767b" }}>
            {message.from} · {formatDate(message.date)}
          </div>
        </div>
      </div>

      {/* OTP highlight */}
      {otp && (
        <div style={{
          margin: "10px 12px 0",
          padding: "10px 12px",
          background: "#0c2a1e",
          border: "1px solid #00ba7c44",
          borderRadius: 10,
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 16 }}>🔑</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: "#71767b", marginBottom: 1, textTransform: "uppercase" }}>Verification Code</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#00ba7c", fontFamily: "monospace", letterSpacing: "4px" }}>{otp}</div>
          </div>
          <button
            onClick={() => void copyOTP()}
            style={{
              padding: "6px 12px", background: copied ? "#00ba7c22" : "#1a3a2a",
              border: `1px solid ${copied ? "#00ba7c" : "#00ba7c66"}`,
              borderRadius: 7, color: "#00ba7c", fontSize: 12, fontWeight: 600, cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      )}

      {/* Body */}
      <div style={{ flex: 1, overflow: "auto", padding: "10px 12px 12px" }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 4 }}>
            {[1, 0.7, 0.85, 0.5, 0.9].map((w, i) => (
              <div key={i} style={{ width: `${w * 100}%`, height: 11, background: "#1e2a3a", borderRadius: 4, animation: "pulse 1.5s infinite" }} />
            ))}
          </div>
        ) : bodyType === "html" ? (
          <div
            style={{ fontSize: 12, color: "#c5cdd4", lineHeight: 1.6 }}
            dangerouslySetInnerHTML={{ __html: body
              .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
              .replace(/style="[^"]*background[^"]*"/gi, "")
            }}
          />
        ) : (
          <pre style={{ fontSize: 12, color: "#c5cdd4", lineHeight: 1.6, whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
            {body || "No content"}
          </pre>
        )}
      </div>
    </div>
  );
}
