import { useState, useCallback } from "react";

interface EmailHeaderProps {
  email: string;
  loading: boolean;
  refreshing: boolean;
  onNew: () => void;
  onRefresh: () => void;
  badge?: number;
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00ba7c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function RefreshIcon({ spin }: { spin: boolean }) {
  return (
    <svg
      width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ animation: spin ? "spin 0.8s linear infinite" : "none" }}
    >
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export function EmailHeader({ email, loading, refreshing, onNew, onRefresh, badge = 0 }: EmailHeaderProps) {
  const [copied, setCopied] = useState(false);

  const copyEmail = useCallback(async () => {
    if (!email) return;
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      const el = document.createElement("textarea");
      el.value = email;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  }, [email]);

  const [local, domain] = email.split("@");

  return (
    <div
      style={{
        padding: "10px 12px 8px",
        borderBottom: "1px solid #1e2a3a",
        background: "#0a1020",
      }}
    >
      {/* Email address row */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div
          style={{
            flex: 1,
            background: "#0f1623",
            border: "1px solid #1e2a3a",
            borderRadius: 8,
            padding: "6px 10px",
            display: "flex",
            alignItems: "center",
            gap: 4,
            minWidth: 0,
          }}
        >
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 140, height: 12, background: "#1e2a3a", borderRadius: 4, animation: "pulse 1.5s infinite" }} />
              <div style={{ width: 60, height: 12, background: "#1e2a3a", borderRadius: 4, animation: "pulse 1.5s infinite" }} />
            </div>
          ) : email ? (
            <span style={{ fontSize: 13, fontFamily: "monospace", color: "#e7e9ea", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              <span style={{ color: "#1d9bf0", fontWeight: 600 }}>{local}</span>
              <span style={{ color: "#71767b" }}>@{domain}</span>
            </span>
          ) : (
            <span style={{ fontSize: 12, color: "#71767b" }}>No inbox yet — click New</span>
          )}
        </div>

        {/* Copy */}
        <button
          onClick={copyEmail}
          disabled={!email || loading}
          title="Copy email"
          style={{
            width: 32, height: 32,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "#0f1623", border: "1px solid #1e2a3a",
            borderRadius: 8, cursor: "pointer",
            color: copied ? "#00ba7c" : "#71767b",
            flexShrink: 0,
            transition: "color 0.15s",
          }}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
        </button>

        {/* Refresh */}
        <button
          onClick={onRefresh}
          disabled={loading || refreshing}
          title="Refresh inbox"
          style={{
            width: 32, height: 32,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "#0f1623", border: "1px solid #1e2a3a",
            borderRadius: 8, cursor: "pointer",
            color: "#71767b", flexShrink: 0,
            position: "relative",
          }}
        >
          <RefreshIcon spin={refreshing} />
          {badge > 0 && (
            <span style={{
              position: "absolute", top: -4, right: -4,
              background: "#1d9bf0", color: "#fff",
              borderRadius: 9999, fontSize: 9, fontWeight: 700,
              minWidth: 14, height: 14, display: "flex", alignItems: "center", justifyContent: "center",
              padding: "0 3px",
            }}>
              {badge > 99 ? "99+" : badge}
            </span>
          )}
        </button>

        {/* New */}
        <button
          onClick={onNew}
          disabled={loading}
          title="Generate new inbox"
          style={{
            height: 32, padding: "0 10px",
            display: "flex", alignItems: "center", gap: 4,
            background: "#1d2e42", border: "1px solid #1d9bf0",
            borderRadius: 8, cursor: "pointer",
            color: "#1d9bf0", fontSize: 12, fontWeight: 600, flexShrink: 0,
          }}
        >
          <PlusIcon /> New
        </button>
      </div>
    </div>
  );
}
