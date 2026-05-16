import { Provider } from "../types";

interface ProviderSwitcherProps {
  provider: Provider;
  onChange: (p: Provider) => void;
  disabled?: boolean;
}

const PROVIDERS: { id: Provider; label: string; desc: string }[] = [
  { id: "guerrilla", label: "Guerrilla", desc: "Fast, no signup" },
  { id: "onesecmail", label: "1secmail", desc: "Instant, simple" },
];

export function ProviderSwitcher({ provider, onChange, disabled }: ProviderSwitcherProps) {
  return (
    <div style={{ display: "flex", gap: 4, padding: "8px 12px", borderBottom: "1px solid #1e2a3a", flexShrink: 0 }}>
      {PROVIDERS.map((p) => {
        const active = provider === p.id;
        return (
          <button
            key={p.id}
            onClick={() => !disabled && onChange(p.id)}
            title={p.desc}
            style={{
              flex: 1, padding: "5px 4px",
              background: active ? "#1d2e42" : "#0f1623",
              border: `1px solid ${active ? "#1d9bf0" : "#1e2a3a"}`,
              borderRadius: 7, cursor: disabled ? "default" : "pointer",
              color: active ? "#1d9bf0" : "#71767b",
              fontSize: 11, fontWeight: active ? 600 : 400,
              transition: "all 0.15s",
            }}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}
