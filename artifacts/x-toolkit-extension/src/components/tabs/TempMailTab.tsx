import { useState, useCallback } from "react";
import { StoredState, Provider, HistoryEntry } from "../../types";
import { useStorage } from "../../hooks/useStorage";
import { useTempMailInbox, fetchFullMessage } from "../../hooks/useInbox";
import { EmailHeader } from "../EmailHeader";
import { ProviderSwitcher } from "../ProviderSwitcher";
import { InboxList } from "../InboxList";
import { OTPCard } from "../OTPCard";
import { MessageView } from "../MessageView";
import {
  mailtmCreate,
  guerrillaNew,
  onesecmailNew,
} from "../../lib/api";

interface Props {
  state: StoredState;
  setState: (s: Partial<StoredState>) => void;
  patch: <K extends keyof StoredState>(key: K, val: StoredState[K]) => void;
  ready: boolean;
}

function getActiveEmail(state: StoredState): string {
  const { tempMailProvider, mailtm, guerrilla, onesecmail } = state;
  if (tempMailProvider === "mailtm") return mailtm?.address ?? "";
  if (tempMailProvider === "guerrilla") return guerrilla?.email ?? "";
  return onesecmail?.email ?? "";
}

export function TempMailTab({ state, setState, patch, ready }: Props) {
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
      const provider = state.tempMailProvider;
      const historyEntry: HistoryEntry = {
        address: "",
        provider,
        createdAt: Date.now(),
      };

      if (provider === "mailtm") {
        const acc = await mailtmCreate();
        historyEntry.address = acc.address;
        setState({
          mailtm: acc,
          history: [historyEntry, ...state.history.slice(0, 19)],
        });
      } else if (provider === "guerrilla") {
        const acc = await guerrillaNew();
        historyEntry.address = acc.email;
        setState({
          guerrilla: acc,
          history: [historyEntry, ...state.history.slice(0, 19)],
        });
      } else {
        const acc = await onesecmailNew();
        historyEntry.address = acc.email;
        setState({
          onesecmail: acc,
          history: [historyEntry, ...state.history.slice(0, 19)],
        });
      }
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create inbox");
    } finally {
      setCreating(false);
    }
  }, [state, setState]);

  const handleProviderChange = useCallback(async (p: Provider) => {
    patch("tempMailProvider", p);
    setSelectedId(null);

    const hasInbox =
      (p === "mailtm" && state.mailtm) ||
      (p === "guerrilla" && state.guerrilla) ||
      (p === "onesecmail" && state.onesecmail);

    if (!hasInbox) {
      setCreating(true);
      setCreateError(null);
      try {
        const historyEntry: HistoryEntry = { address: "", provider: p, createdAt: Date.now() };
        if (p === "mailtm") {
          const acc = await mailtmCreate();
          historyEntry.address = acc.address;
          setState({ mailtm: acc, tempMailProvider: p, history: [historyEntry, ...state.history.slice(0, 19)] });
        } else if (p === "guerrilla") {
          const acc = await guerrillaNew();
          historyEntry.address = acc.email;
          setState({ guerrilla: acc, tempMailProvider: p, history: [historyEntry, ...state.history.slice(0, 19)] });
        } else {
          const acc = await onesecmailNew();
          historyEntry.address = acc.email;
          setState({ onesecmail: acc, tempMailProvider: p, history: [historyEntry, ...state.history.slice(0, 19)] });
        }
      } catch (err) {
        setCreateError(err instanceof Error ? err.message : "Failed to create inbox");
      } finally {
        setCreating(false);
      }
    }
  }, [state, setState, patch]);

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
      <ProviderSwitcher
        provider={state.tempMailProvider}
        onChange={handleProviderChange}
        disabled={creating}
      />
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
