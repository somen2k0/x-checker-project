import { useState, useEffect, useCallback, useRef } from "react";
import { Message, StoredState } from "../types";
import {
  mailtmMessages, normaliseMailTm,
  guerrillaInbox, normaliseGuerrilla,
  onesecmailInbox, normaliseOnesec,
  temptfMessages, normaliseTemptf,
  guerrillaMessage, onesecmailMessage, mailtmMessage, temptfMessages as _temptf,
} from "../lib/api";
import { stripHtml, getIntro } from "../lib/otp";

const REFRESH_INTERVAL = 15_000;

export function useTempMailInbox(state: StoredState, ready: boolean) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetch = useCallback(async (isRefresh = false) => {
    const { tempMailProvider, mailtm, guerrilla, onesecmail } = state;

    if (tempMailProvider === "mailtm" && !mailtm) return;
    if (tempMailProvider === "guerrilla" && !guerrilla) return;
    if (tempMailProvider === "onesecmail" && !onesecmail) return;

    isRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);

    try {
      let msgs: Message[] = [];

      if (tempMailProvider === "mailtm" && mailtm) {
        const data = await mailtmMessages(mailtm.token);
        msgs = data.messages.map((m) => {
          const norm = normaliseMailTm(m);
          return { ...norm, intro: norm.intro || getIntro(stripHtml(norm.body)) };
        });
      } else if (tempMailProvider === "guerrilla" && guerrilla) {
        const data = await guerrillaInbox(guerrilla.sid_token);
        msgs = data.messages.map((m) => {
          const norm = normaliseGuerrilla(m as Parameters<typeof normaliseGuerrilla>[0]);
          return { ...norm, intro: norm.intro || getIntro(stripHtml(norm.body)) };
        });
      } else if (tempMailProvider === "onesecmail" && onesecmail) {
        const data = await onesecmailInbox(onesecmail.login, onesecmail.domain);
        msgs = data.messages.map((m) => {
          const norm = normaliseOnesec(m as Parameters<typeof normaliseOnesec>[0]);
          return { ...norm };
        });
      }

      setMessages(msgs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch inbox");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [state]);

  useEffect(() => {
    if (!ready) return;
    void fetch(false);
    timerRef.current = setInterval(() => void fetch(true), REFRESH_INTERVAL);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [fetch, ready]);

  const refresh = useCallback(() => void fetch(true), [fetch]);

  return { messages, loading, refreshing, error, refresh };
}

export function useGmailInbox(state: StoredState, ready: boolean) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetch = useCallback(async (isRefresh = false) => {
    const { gmail } = state;
    if (!gmail) return;

    isRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);

    try {
      const data = await temptfMessages(gmail.email);
      const msgs: Message[] = data.messages.map((m) => {
        const norm = normaliseTemptf(m as Parameters<typeof normaliseTemptf>[0]);
        return { ...norm, intro: norm.intro || getIntro(stripHtml(norm.body)) };
      });
      setMessages(msgs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch inbox");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [state]);

  useEffect(() => {
    if (!ready) return;
    void fetch(false);
    timerRef.current = setInterval(() => void fetch(true), REFRESH_INTERVAL);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [fetch, ready]);

  const refresh = useCallback(() => void fetch(true), [fetch]);

  return { messages, loading, refreshing, error, refresh };
}

export async function fetchFullMessage(
  msgId: string,
  state: StoredState
): Promise<{ body: string; bodyContentType: "html" | "text" }> {
  const { tempMailProvider, mailtm, guerrilla, onesecmail } = state;
  if (tempMailProvider === "mailtm" && mailtm) {
    const m = await mailtmMessage(msgId, mailtm.token);
    const norm = normaliseMailTm(m as Parameters<typeof normaliseMailTm>[0]);
    return { body: norm.body, bodyContentType: norm.bodyContentType };
  }
  if (tempMailProvider === "guerrilla" && guerrilla) {
    const m = await guerrillaMessage(msgId, guerrilla.sid_token);
    return { body: m.body, bodyContentType: "html" };
  }
  if (tempMailProvider === "onesecmail" && onesecmail) {
    const m = await onesecmailMessage(msgId, onesecmail.login, onesecmail.domain);
    return { body: m.htmlBody ?? m.textBody ?? m.body, bodyContentType: "html" };
  }
  throw new Error("No active inbox");
}

export async function fetchFullGmailMessage(
  email: string,
  _msgId: string
): Promise<{ body: string; bodyContentType: "html" | "text" }> {
  const data = await _temptf(email);
  const msg = data.messages.find((m) => (m as { id: string }).id === _msgId);
  if (!msg) throw new Error("Message not found");
  return { body: (msg as { body: string }).body, bodyContentType: (msg as { bodyContentType: "html" | "text" }).bodyContentType };
}
