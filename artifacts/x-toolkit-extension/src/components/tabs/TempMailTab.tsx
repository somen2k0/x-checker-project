import { useState, useCallback } from "react";
import { StoredState, HistoryEntry } from "../../types";
import { useTempMailInbox, fetchFullMessage } from "../../hooks/useInbox";
import { EmailHeader } from "../EmailHeader";
import { InboxList } from "../InboxList";
import { OTPCard } from "../OTPCard";
import { MessageView } from "../MessageView";
import { guerrillaNew, onesecmailNew } from "../../lib/api";

interface Props {
  state: StoredState;
  setState: (s: Partial<StoredState>) => void;
  patch: <K extends keyof StoredState>(key: K, val: StoredState[K]) => void;
  ready: boolean;
}

function getActiveEmail(state: StoredState): string {
  const { tempMailProvider, guerrilla, onesecmail } = state;
  if (tempMailProvider === "guerrilla") return guerrilla?.email ?? "";
  return onesecmail?.email ?? "";
}

async function createInbox(setState: (s: Partial<StoredState>) => void, history: StoredState["history"]) {
  // Try Guerrilla first, fall back to 1secmail
  try {
    const acc = await guerrillaNew();
    const entry: HistoryEntry = { address: acc.email, provider: "guerrilla", createdAt: Date.now() };
    setState({ guerrilla: acc, tempMailProvider: "guerrilla", history: [entry, ...history.slice(0, 19)] });
    return;
  } catch {
    // fall through to backup
  }
  const acc = await onesecmailNew();
  const entry: HistoryEntry = { address: acc.email, provider: "onesecmail", createdAt: Date.now() };
  setState({ onesecmail: acc, tempMailProvider: "onesecmail", history: [entry, ...history.slice(0, 19)] });
}

export function TempMailTab({ state, setState, patch: _patch, ready }: Props) {
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { messages, loading, refreshing, error, refresh } = useTempMailInbox(state, ready);
  const email = getActiveEmail(state);
  const selectedMsg = messages.find((m) => m.id === selectedId) ?? null;

  const handleNew = useCallback(async () => {
    setCreating(true);
    setCreateError(null);
    setSelectedId(null);
    try {
      await createInbox(setState, state.history);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Could not create inbox. Please try again.");
    } finally {
      setCreating(false);
    }
  }, [state.history, setState]);

  if (selectedMsg) {
    return (
      <MessageView
        message={selectedMsg}
        onBack={() => setSelectedId(null)}
        fetchBody={
          selectedMsg.body
            ? undefined
            : () => fetchFullMessage(selectedMsg.id, state)
        }
      />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <EmailHeader
        email={email}
        loading={creating}
        refreshing={refreshing}
        onNew={handleNew}
        onRefresh={refresh}
        badge={messages.length}
      />

      {createError && (
        <div style={{ margin: "8px 12px 0", padding: "8px 10px", background: "#2a1515", border: "1px solid #f4212e44", borderRadius: 8, fontSize: 12, color: "#f4212e" }}>
          {createError}
        </div>
      )}

      {!creating && email && messages.length > 0 && (
        <OTPCard messages={messages} onViewMessage={setSelectedId} />
      )}

      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", marginTop: 8 }}>
        {!email && !creating ? (
          <div style={{ padding: "32px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📬</div>
            <div style={{ color: "#71767b", fontSize: 13, marginBottom: 12 }}>No inbox yet</div>
            <button
              onClick={handleNew}
              style={{
                padding: "8px 20px", background: "#1d9bf0",
                border: "none", borderRadius: 20,
                color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}
            >
              Generate Inbox
            </button>
          </div>
        ) : (
          <InboxList
            messages={messages}
            loading={loading && !creating}
            error={error}
            onSelect={setSelectedId}
            onRetry={refresh}
          />
        )}
      </div>
    </div>
  );
}
