export type Provider = "guerrilla" | "onesecmail" | "freemail";
export type GmailProvider = "gmail" | "outlook" | "hotmail";

export interface GuerrillaAccount {
  email: string;
  user: string;
  domain: string;
  sid_token: string;
  domains: string[];
}

export interface OnesecmailAccount {
  email: string;
  login: string;
  domain: string;
  domains: string[];
}

export interface FreemailAccount {
  email: string;
  login: string;
  domain: string;
  token: string;
}

export interface GmailAccount {
  email: string;
}

export interface Message {
  id: string;
  from: string;
  subject: string;
  date: string;
  body?: string;
  bodyContentType?: "html" | "text";
  intro?: string;
  seen?: boolean;
}

export interface HistoryEntry {
  address: string;
  provider: Provider | "gmail";
  createdAt: number;
}

export interface StoredState {
  tempMailProvider: Provider;
  guerrilla: GuerrillaAccount | null;
  onesecmail: OnesecmailAccount | null;
  freemail: FreemailAccount | null;
  gmail: GmailAccount | null;
  gmailProvider: GmailProvider;
  history: HistoryEntry[];
  seenMessageIds: string[];
  lastPollAt: number;
}

export const DEFAULT_STATE: StoredState = {
  tempMailProvider: "guerrilla",
  guerrilla: null,
  onesecmail: null,
  freemail: null,
  gmail: null,
  gmailProvider: "gmail",
  history: [],
  seenMessageIds: [],
  lastPollAt: 0,
};

export interface InboxState {
  messages: Message[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
}
