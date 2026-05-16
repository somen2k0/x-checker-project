import { useState, useCallback } from "react";
import { StoredState, GmailProvider, HistoryEntry } from "../../types";
import { useGmailInbox, fetchFullGmailMessage } from "../../hooks/useInbox";
import { EmailHeader } from "../EmailHeader";
import { InboxList } from "../InboxList";
import { OTPCard } from "../OTPCard";
import { MessageView } from "../MessageView";
import { temptfGenerate } from "../../lib/api";

interface Props {
  state: StoredState;
  setState: (s: Partial<StoredState>) => void;
  patch: <K extends keyof StoredState>(key: K, val: StoredState[K]) => void;
  ready: boolean;
}

const GMAIL_PROVIDERS: { id: GmailProvider; label: string }[] = [
  { id: "gmail", label: "Gmail" },
  { id: "outlook", label: "Outlook" },
  { id: "hotmail", label: "Hotmail" },
];

export function GmailTab({ state, setState, patch, ready }: Props) {
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { messages, loading, refreshing, error, refresh } = useGmailInbox(state, ready);
  const email = state.gmail?.email ?? "";
  const selectedMsg = messages.find((m) => m.id === selectedId) ?? null;

  const handleNew = useCallback(async (providerOverride?: GmailProvider) => {
    setCreating(true);
    setCreateError(null);
    setSelectedId(null);
    const provider = providerOverride ?? state.gmailProvider;
    try {
      const type = provider === "gmail" ? "dot" : "plus";
      const res = await temptfGenerate(provider, type);
      const entry: HistoryEntry = { address: res.email, provider: "gmail", createdAt: Date.now() };
      setState({
        gmail: { email: res.email },
        gmailProvider: provider,
        history: [entry, ...state.history.slice(0, 19)],
      });
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to generate address");
    } finally {
      setCreating(false);
    }
  }, [state, setState]);

  const handleProviderChange = useCallback((p: GmailProvider) => {
    patch("gmailProvider", p);
    void handleNew(p);
  }, [patch, handleNew]);

  if (selectedMsg) {
    return (
      <MessageView
        message={selectedMsg}
        onBack={() => setSelectedId(null)}
        fetchBody={
          selectedMsg.body
            ? undefined
            : () => fetchFullGmailMessage(email, selectedMsg.id)
        }
      />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Provider sub-tabs */}
      <div style={{ display: "flex", gap: 4, padding: "8px 12px", borderBottom: "1px solid #1e2a3a", flexShrink: 0 }}>
        {GMAIL_PROVIDERS.map((p) => {
          const active = state.gmailProvider === p.id;
          return (
            <button
              key={p.id}
              onClick={() => handleProviderChange(p.id)}
              disabled={creating}
              style={{
                flex: 1, padding: "5px 4px",
                background: active ? "#1d2e42" : "#0f1623",
                border: `1px solid ${active ? "#1d9bf0" : "#1e2a3a"}`,
                borderRadius: 7, cursor: "pointer",
                color: active ? "#1d9bf0" : "#71767b",
                fontSize: 11, fontWeight: active ? 600 : 400,
              }}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      <EmailHeader
        email={email}
        loading={creating}
        refreshing={refreshing}
        onNew={() => void handleNew()}
        onRefresh={refresh}
        badge={messages.length}
      />

      {createError && (
        <div style={{ margin: "8px 12px 0", padding: "8px 10px", background: "#2a1515", border: "1px solid #f4212e44", borderRadius: 8, fontSize: 12, color: "#f4212e" }}>
          {createError}
        </div>
      )}

      {/* Gmail info banner */}
      {email && !creating && (
        <div style={{
          margin: "8px 12px 0",
          padding: "8px 10px",
          background: "#0a1f2e",
          border: "1px solid #1d9bf022",
          borderRadius: 8,
          fontSize: 11,
          color: "#71767b",
          flexShrink: 0,
        }}>
          💡 Emails sent to any dot/plus variation of this address will appear here
        </div>
      )}

      {!creating && email && messages.length > 0 && (
        <OTPCard messages={messages} onViewMessage={setSelectedId} />
      )}

      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", marginTop: 8 }}>
        {!email && !creating ? (
          <div style={{ padding: "32px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📧</div>
            <div style={{ color: "#71767b", fontSize: 13, marginBottom: 6 }}>Generate a temp Gmail address</div>
            <div style={{ color: "#3d4753", fontSize: 11, marginBottom: 16 }}>Works with Gmail dot-trick</div>
            <button
              onClick={() => void handleNew()}
              style={{
                padding: "8px 20px", background: "#1d9bf0",
                border: "none", borderRadius: 20,
                color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}
            >
              Generate Gmail Address
            </button>
          </div>
        ) : (
          <InboxList
            messages={messages}
            loading={loading && !creating}
            error={error}
            onSelect={setSelectedId}
            onRetry={refresh}
            emptyText="No messages yet · inbox updates every 15s"
          />
        )}
      </div>
    </div>
  );
}
