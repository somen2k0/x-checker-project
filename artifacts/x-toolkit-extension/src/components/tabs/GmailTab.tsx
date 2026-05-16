import { useState, useCallback } from "react";
import { StoredState, HistoryEntry } from "../../types";
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

type GmailSubTab = "inbox" | "tricks";

function dotVariants(name: string): string[] {
  const x = name.replace(/\./g, "").toLowerCase();
  if (x.length < 2) return [`${x}@gmail.com`];
  const results: string[] = [];
  const slots = x.length - 1;
  const total = Math.min(Math.pow(2, slots), 32);
  for (let mask = 0; mask < total; mask++) {
    let v = x[0];
    for (let i = 0; i < slots; i++) { if (mask & (1 << i)) v += "."; v += x[i + 1]; }
    results.push(`${v}@gmail.com`);
  }
  return results;
}

const PLUS_TAGS = ["newsletters", "shopping", "social", "spam", "work", "promo", "alerts", "updates", "receipts", "travel", "finance", "gaming", "news", "signup", "deals", "temp", "dev", "backup"];

function GmailTricksPanel() {
  const [input, setInput] = useState("");
  const [username, setUsername] = useState("");
  const [dots, setDots] = useState<string[]>([]);
  const [plusList, setPlusList] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [customTag, setCustomTag] = useState("");

  const generate = () => {
    const raw = input.trim().toLowerCase();
    if (!raw) return;
    const user = raw.includes("@") ? raw.split("@")[0] : raw;
    const clean = user.replace(/\./g, "");
    setUsername(clean);
    setDots(dotVariants(clean));
    setPlusList(PLUS_TAGS.map((t) => `${clean}+${t}@gmail.com`));
    setShowAll(false);
  };

  const copy = (addr: string) => {
    void navigator.clipboard.writeText(addr);
    setCopied(addr);
    setTimeout(() => setCopied(null), 1500);
  };

  const displayed = showAll ? dots : dots.slice(0, 12);

  const inputStyle: React.CSSProperties = {
    flex: 1, background: "#0f1623", border: "1px solid #1e2a3a",
    borderRadius: 8, padding: "7px 10px", color: "#e7e9ea",
    fontSize: 12, outline: "none",
  };
  const btn = (active = true): React.CSSProperties => ({
    padding: "7px 14px", background: active ? "#1d9bf0" : "#1a2436",
    border: active ? "none" : "1px solid #1e2a3a",
    borderRadius: 8, color: active ? "#fff" : "#71767b",
    fontSize: 12, fontWeight: 600, cursor: "pointer", flexShrink: 0,
  });

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Input */}
      <div style={{ display: "flex", gap: 6 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && generate()}
          placeholder="yourname@gmail.com"
          style={inputStyle}
        />
        <button onClick={generate} disabled={!input.trim()} style={btn(!(!input.trim()))}>
          Generate
        </button>
      </div>

      {!username && (
        <div style={{ textAlign: "center", padding: "24px 0", color: "#3d4753", fontSize: 12 }}>
          Enter your Gmail address to generate dot & plus variants
        </div>
      )}

      {username && (
        <>
          {/* Dot trick */}
          <div style={{ background: "#0a1020", border: "1px solid #1e2a3a", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ padding: "8px 12px", borderBottom: "1px solid #1e2a3a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#1d9bf0" }}>Dot Trick</span>
              <span style={{ fontSize: 10, color: "#71767b" }}>{dots.length} variants</span>
            </div>
            <div style={{ padding: "6px 8px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
              {displayed.map((addr) => (
                <button key={addr} onClick={() => copy(addr)} style={{
                  background: "#0f1623", border: "1px solid #1e2a3a", borderRadius: 6,
                  padding: "4px 6px", cursor: "pointer", textAlign: "left", display: "flex",
                  justifyContent: "space-between", alignItems: "center", gap: 4,
                }}>
                  <span style={{ fontSize: 10, color: copied === addr ? "#00ba7c" : "#e7e9ea", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {addr}
                  </span>
                  <span style={{ fontSize: 9, color: copied === addr ? "#00ba7c" : "#71767b", flexShrink: 0 }}>
                    {copied === addr ? "✓" : "⧉"}
                  </span>
                </button>
              ))}
            </div>
            {dots.length > 12 && (
              <div style={{ padding: "4px 12px 8px", textAlign: "center" }}>
                <button onClick={() => setShowAll(!showAll)} style={{ background: "none", border: "none", color: "#1d9bf0", fontSize: 11, cursor: "pointer" }}>
                  {showAll ? "Show less" : `Show all ${dots.length}`}
                </button>
              </div>
            )}
          </div>

          {/* Plus trick */}
          <div style={{ background: "#0a1020", border: "1px solid #1e2a3a", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ padding: "8px 12px", borderBottom: "1px solid #1e2a3a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#9b59b6" }}>Plus Trick</span>
            </div>
            <div style={{ padding: "6px 8px 4px" }}>
              <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                <div style={{ flex: 1, display: "flex", alignItems: "center", background: "#0f1623", border: "1px solid #1e2a3a", borderRadius: 7, padding: "5px 8px", gap: 4 }}>
                  <span style={{ fontSize: 10, color: "#71767b", fontFamily: "monospace", flexShrink: 0 }}>{username}+</span>
                  <input
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value.replace(/[^a-z0-9._-]/gi, ""))}
                    placeholder="customtag"
                    style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: 10, color: "#e7e9ea", fontFamily: "monospace" }}
                  />
                  <span style={{ fontSize: 10, color: "#71767b", fontFamily: "monospace", flexShrink: 0 }}>@gmail.com</span>
                </div>
                <button
                  onClick={() => customTag && copy(`${username}+${customTag.toLowerCase()}@gmail.com`)}
                  disabled={!customTag}
                  style={{ ...btn(!!customTag), padding: "5px 10px", fontSize: 11 }}
                >
                  Copy
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, paddingBottom: 6 }}>
                {plusList.map((addr) => (
                  <button key={addr} onClick={() => copy(addr)} style={{
                    background: "#0f1623", border: "1px solid #1e2a3a", borderRadius: 6,
                    padding: "4px 6px", cursor: "pointer", textAlign: "left", display: "flex",
                    justifyContent: "space-between", alignItems: "center", gap: 4,
                  }}>
                    <span style={{ fontSize: 10, color: copied === addr ? "#00ba7c" : "#e7e9ea", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {addr}
                    </span>
                    <span style={{ fontSize: 9, color: copied === addr ? "#00ba7c" : "#71767b", flexShrink: 0 }}>
                      {copied === addr ? "✓" : "⧉"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function GmailTab({ state, setState, patch: _patch, ready }: Props) {
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [subTab, setSubTab] = useState<GmailSubTab>("inbox");

  const { messages, loading, refreshing, error, refresh } = useGmailInbox(state, ready);
  const email = state.gmail?.email ?? "";
  const selectedMsg = messages.find((m) => m.id === selectedId) ?? null;

  const handleNew = useCallback(async () => {
    setCreating(true);
    setCreateError(null);
    setSelectedId(null);
    try {
      const res = await temptfGenerate("gmail", "dot");
      const entry: HistoryEntry = { address: res.email, provider: "gmail", createdAt: Date.now() };
      setState({
        gmail: { email: res.email },
        gmailProvider: "gmail",
        history: [entry, ...state.history.slice(0, 19)],
      });
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to generate address");
    } finally {
      setCreating(false);
    }
  }, [state, setState]);

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

  const subTabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: "5px 4px",
    background: active ? "#1d2e42" : "#0f1623",
    border: `1px solid ${active ? "#1d9bf0" : "#1e2a3a"}`,
    borderRadius: 7, cursor: "pointer",
    color: active ? "#1d9bf0" : "#71767b",
    fontSize: 11, fontWeight: active ? 600 : 400,
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Sub-tabs */}
      <div style={{ display: "flex", gap: 4, padding: "8px 12px", borderBottom: "1px solid #1e2a3a", flexShrink: 0 }}>
        <button onClick={() => setSubTab("inbox")} style={subTabStyle(subTab === "inbox")}>
          Temp Gmail
        </button>
        <button onClick={() => setSubTab("tricks")} style={subTabStyle(subTab === "tricks")}>
          Gmail Tricks
        </button>
      </div>

      {subTab === "tricks" ? (
        <GmailTricksPanel />
      ) : (
        <>
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

          {email && !creating && (
            <div style={{
              margin: "8px 12px 0", padding: "8px 10px",
              background: "#0a1f2e", border: "1px solid #1d9bf022",
              borderRadius: 8, fontSize: 11, color: "#71767b", flexShrink: 0,
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
                <div style={{ color: "#3d4753", fontSize: 11, marginBottom: 16 }}>Works with Gmail dot-trick — receive emails instantly</div>
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
        </>
      )}
    </div>
  );
}
