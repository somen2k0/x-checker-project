import { useState } from "react";
import { useStorage } from "../hooks/useStorage";
import { TempMailTab } from "./tabs/TempMailTab";
import { GmailTab } from "./tabs/GmailTab";
import { HistoryTab } from "./tabs/HistoryTab";

type Tab = "tempmail" | "gmail" | "history";

function MailIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function GmailIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 18h-2V9.25L12 13 6 9.25V18H4V6h1.2l6.8 4.25L18.8 6H20v12z" />
    </svg>
  );
}

function ClockIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

const TABS: { id: Tab; label: string; icon: (p: { active: boolean }) => React.ReactNode }[] = [
  {
    id: "tempmail",
    label: "Temp Mail",
    icon: ({ active }) => <MailIcon size={active ? 20 : 18} />,
  },
  {
    id: "gmail",
    label: "Gmail",
    icon: ({ active }) => <GmailIcon size={active ? 20 : 18} />,
  },
  {
    id: "history",
    label: "History",
    icon: ({ active }) => <ClockIcon size={active ? 20 : 18} />,
  },
];

export function App() {
  const [tab, setTab] = useState<Tab>("tempmail");
  const { state, setState, patch, ready } = useStorage();

  return (
    <div
      style={{ width: 400, height: 580, background: "#080c14", color: "#e7e9ea", display: "flex", flexDirection: "column", overflow: "hidden" }}
    >
      {/* Top logo bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 14px 8px",
          borderBottom: "1px solid #1e2a3a",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 22, height: 22, background: "#1d9bf0", borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 13, lineHeight: 1 }}>X</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: 14, color: "#e7e9ea", letterSpacing: "-0.2px" }}>Toolkit</span>
        </div>
        <span style={{ fontSize: 11, color: "#71767b", marginLeft: 2, marginTop: 1 }}>Temp Email</span>
        <div style={{ flex: 1 }} />
        <a
          href="https://xtoolkit.live"
          target="_blank"
          rel="noopener noreferrer"
          title="Open xtoolkit.live"
          style={{ color: "#71767b", display: "flex", alignItems: "center", cursor: "pointer", textDecoration: "none" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        {tab === "tempmail" && <TempMailTab state={state} setState={setState} patch={patch} ready={ready} />}
        {tab === "gmail" && <GmailTab state={state} setState={setState} patch={patch} ready={ready} />}
        {tab === "history" && <HistoryTab state={state} patch={patch} setTab={setTab} />}
      </div>

      {/* Bottom tab bar */}
      <div
        style={{
          display: "flex",
          borderTop: "1px solid #1e2a3a",
          background: "#080c14",
          flexShrink: 0,
        }}
      >
        {TABS.map(({ id, label, icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                padding: "8px 4px 7px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: active ? "#1d9bf0" : "#71767b",
                transition: "color 0.15s",
                borderTop: active ? "2px solid #1d9bf0" : "2px solid transparent",
                marginTop: -1,
              }}
            >
              {icon({ active })}
              <span style={{ fontSize: 10, fontWeight: active ? 600 : 400, letterSpacing: "0.2px" }}>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
