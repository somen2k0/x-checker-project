import { Message } from "../types";
import { formatDate, isVerificationEmail } from "../lib/otp";

interface InboxListProps {
  messages: Message[];
  loading: boolean;
  error: string | null;
  onSelect: (id: string) => void;
  onRetry: () => void;
  emptyText?: string;
}

function VerifyBadge() {
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, padding: "1px 5px",
      background: "#1a2e4a", color: "#1d9bf0",
      borderRadius: 9999, border: "1px solid #1d9bf044",
      textTransform: "uppercase", letterSpacing: "0.3px",
      flexShrink: 0,
    }}>
      Verify
    </span>
  );
}

function Skeleton() {
  return (
    <div style={{ padding: "0 12px" }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            padding: "12px 0",
            borderBottom: "1px solid #1e2a3a",
            display: "flex",
            flexDirection: "column",
            gap: 6,
            animation: "pulse 1.5s infinite",
            animationDelay: `${i * 0.15}s`,
          }}
        >
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#1e2a3a", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ width: "60%", height: 11, background: "#1e2a3a", borderRadius: 4, marginBottom: 5 }} />
              <div style={{ width: "85%", height: 10, background: "#151f2e", borderRadius: 4 }} />
            </div>
            <div style={{ width: 30, height: 9, background: "#1e2a3a", borderRadius: 4 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Avatar({ from }: { from: string }) {
  const char = (from.split("@")[0]?.[0] ?? "?").toUpperCase();
  const hue = from.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <div style={{
      width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
      background: `hsl(${hue}, 50%, 20%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 12, fontWeight: 700, color: `hsl(${hue}, 70%, 70%)`,
    }}>
      {char}
    </div>
  );
}

export function InboxList({ messages, loading, error, onSelect, onRetry, emptyText = "No messages yet" }: InboxListProps) {
  if (loading) return <Skeleton />;

  if (error) {
    return (
      <div style={{ padding: "32px 20px", textAlign: "center" }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>⚠️</div>
        <div style={{ color: "#f4212e", fontSize: 13, marginBottom: 12 }}>{error}</div>
        <button
          onClick={onRetry}
          style={{
            padding: "7px 16px", background: "#1e2a3a",
            border: "1px solid #2f3a4a", borderRadius: 8,
            color: "#e7e9ea", fontSize: 12, cursor: "pointer",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!messages.length) {
    return (
      <div style={{ padding: "36px 20px", textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 10 }}>📭</div>
        <div style={{ color: "#71767b", fontSize: 13 }}>{emptyText}</div>
        <div style={{ color: "#3d4753", fontSize: 11, marginTop: 6 }}>Refreshes every 15s automatically</div>
      </div>
    );
  }

  return (
    <div style={{ overflow: "auto", flex: 1 }}>
      {messages.map((msg, idx) => {
        const isVerify = isVerificationEmail(msg.subject, msg.from);
        return (
          <button
            key={msg.id}
            onClick={() => onSelect(msg.id)}
            style={{
              width: "100%", display: "flex", gap: 9, alignItems: "flex-start",
              padding: "10px 12px",
              borderBottom: "1px solid #1e2a3a",
              background: "none", border: "none", cursor: "pointer",
              textAlign: "left",
              transition: "background 0.1s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#0d1827")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
          >
            <Avatar from={msg.from} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
                <span style={{
                  fontSize: 12, fontWeight: 600, color: "#e7e9ea",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1,
                }}>
                  {msg.from || "Unknown sender"}
                </span>
                {isVerify && <VerifyBadge />}
                <span style={{ fontSize: 10, color: "#71767b", flexShrink: 0 }}>
                  {formatDate(msg.date)}
                </span>
              </div>
              <div style={{
                fontSize: 12, color: "#b0b8c1", fontWeight: 500,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 2,
              }}>
                {msg.subject}
              </div>
              {msg.intro && (
                <div style={{
                  fontSize: 11, color: "#71767b",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {msg.intro}
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
