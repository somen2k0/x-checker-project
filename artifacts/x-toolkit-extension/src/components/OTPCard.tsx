import { useState, useCallback } from "react";
import { extractOTP, stripHtml } from "../lib/otp";
import { Message } from "../types";

interface OTPCardProps {
  messages: Message[];
  onViewMessage: (id: string) => void;
}

export function OTPCard({ messages, onViewMessage }: OTPCardProps) {
  const [copied, setCopied] = useState(false);

  const latest = messages[0];
  if (!latest) return null;

  const text = latest.body
    ? stripHtml(latest.bodyContentType === "html" ? latest.body : latest.body)
    : latest.intro ?? "";

  const otp = extractOTP(text) ?? extractOTP(latest.subject);
  if (!otp) return null;

  const copyOTP = useCallback(async () => {
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
  }, [otp]);

  return (
    <div
      style={{
        margin: "10px 12px 0",
        padding: "10px 12px",
        background: "linear-gradient(135deg, #0c2a1e 0%, #0a1f2e 100%)",
        border: "1px solid #00ba7c44",
        borderRadius: 10,
        display: "flex",
        alignItems: "center",
        gap: 10,
        cursor: "pointer",
        animation: "fade-in 0.25s ease",
      }}
      onClick={() => onViewMessage(latest.id)}
    >
      <div style={{ fontSize: 18 }}>🔑</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, color: "#71767b", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.5px" }}>
          Latest Code
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#00ba7c", fontFamily: "monospace", letterSpacing: "3px" }}>
          {otp}
        </div>
        <div style={{ fontSize: 11, color: "#71767b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>
          From {latest.from || "unknown"}
        </div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); void copyOTP(); }}
        style={{
          padding: "6px 10px",
          background: copied ? "#00ba7c22" : "#1a3a2a",
          border: `1px solid ${copied ? "#00ba7c" : "#00ba7c66"}`,
          borderRadius: 7,
          color: "#00ba7c",
          fontSize: 11,
          fontWeight: 600,
          cursor: "pointer",
          flexShrink: 0,
          transition: "all 0.15s",
        }}
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}
