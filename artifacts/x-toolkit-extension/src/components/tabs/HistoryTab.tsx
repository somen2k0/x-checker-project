import { useState, useCallback } from "react";
import { StoredState, HistoryEntry } from "../../types";
import { formatDate } from "../../lib/otp";

type Tab = "tempmail" | "gmail" | "history";

interface Props {
  state: StoredState;
  patch: <K extends keyof StoredState>(key: K, val: StoredState[K]) => void;
  setTab: (t: Tab) => void;
}

const PROVIDER_LABELS: Record<string, string> = {
  mailtm: "mail.tm",
  guerrilla: "Guerrilla",
  onesecmail: "1secmail",
  gmail: "Gmail",
};

function CopyIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function HistoryItem({ entry, onCopy, onDelete }: {
  entry: HistoryEntry;
  onCopy: () => void;
  onDelete: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(entry.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      onCopy();
    } catch {
      const el = document.createElement("textarea");
      el.value = entry.address;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div
      style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "9px 12px",
        borderBottom: "1px solid #1e2a3a",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 12, color: "#e7e9ea", fontFamily: "monospace",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          marginBottom: 2,
        }}>
          {entry.address}
        </div>
        <div style={{ fontSize: 10, color: "#71767b" }}>
          {PROVIDER_LABELS[entry.provider] ?? entry.provider} · {formatDate(new Date(entry.createdAt).toISOString())}
        </div>
      </div>
      <button
        onClick={() => void copy()}
        title="Copy"
        style={{
          width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center",
          background: "none", border: "1px solid #1e2a3a", borderRadius: 6,
          color: copied ? "#00ba7c" : "#71767b", cursor: "pointer",
        }}
      >
        <CopyIcon />
      </button>
      <button
        onClick={onDelete}
        title="Remove"
        style={{
          width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center",
          background: "none", border: "1px solid #1e2a3a", borderRadius: 6,
          color: "#71767b", cursor: "pointer",
        }}
      >
        <TrashIcon />
      </button>
    </div>
  );
}

export function HistoryTab({ state, patch, setTab }: Props) {
  const { history } = state;

  const deleteEntry = useCallback((idx: number) => {
    const next = history.filter((_, i) => i !== idx);
    patch("history", next);
  }, [history, patch]);

  const clearAll = useCallback(() => {
    patch("history", []);
  }, [patch]);

  if (!history.length) {
    return (
      <div style={{ padding: "48px 20px", textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 10 }}>🕐</div>
        <div style={{ color: "#71767b", fontSize: 13, marginBottom: 8 }}>No inbox history yet</div>
        <div style={{ color: "#3d4753", fontSize: 11, marginBottom: 20 }}>
          Your generated addresses will appear here
        </div>
        <button
          onClick={() => setTab("tempmail")}
          style={{
            padding: "7px 18px", background: "#1d9bf0",
            border: "none", borderRadius: 20,
            color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer",
          }}
        >
          Generate Inbox
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "8px 12px", borderBottom: "1px solid #1e2a3a", flexShrink: 0 }}>
        <span style={{ fontSize: 12, color: "#71767b", flex: 1 }}>{history.length} address{history.length !== 1 ? "es" : ""}</span>
        <button
          onClick={clearAll}
          style={{
            fontSize: 11, color: "#f4212e", background: "none", border: "none",
            cursor: "pointer", padding: "2px 6px",
          }}
        >
          Clear all
        </button>
      </div>
      <div style={{ flex: 1, overflow: "auto" }}>
        {history.map((entry, idx) => (
          <HistoryItem
            key={`${entry.address}-${entry.createdAt}`}
            entry={entry}
            onCopy={() => {}}
            onDelete={() => deleteEntry(idx)}
          />
        ))}
      </div>
    </div>
  );
}
