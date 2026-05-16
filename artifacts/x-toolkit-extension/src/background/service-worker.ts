import { StoredState, DEFAULT_STATE } from "../types";
import {
  mailtmMessages, normaliseMailTm,
  guerrillaInbox, normaliseGuerrilla,
  onesecmailInbox, normaliseOnesec,
  temptfMessages, normaliseTemptf,
} from "../lib/api";
import { extractOTP, stripHtml } from "../lib/otp";

const ALARM_NAME = "poll-inbox";
const POLL_PERIOD_MINUTES = 0.25; // every 15 seconds

// ── Bootstrap ─────────────────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(() => {
  setupAlarm();
  setupContextMenus();
});

chrome.runtime.onStartup.addListener(() => {
  setupAlarm();
});

function setupAlarm() {
  chrome.alarms.get(ALARM_NAME, (existing) => {
    if (!existing) {
      chrome.alarms.create(ALARM_NAME, { periodInMinutes: POLL_PERIOD_MINUTES });
    }
  });
}

function setupContextMenus() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "copy-temp-email",
      title: "Copy active temp email",
      contexts: ["all"],
    });
    chrome.contextMenus.create({
      id: "open-xtoolkit",
      title: "Open X Toolkit",
      contexts: ["all"],
    });
  });
}

// ── Context menu ──────────────────────────────────────────────────────────

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "copy-temp-email") {
    void getState().then((state) => {
      const email = getActiveEmail(state);
      if (email) {
        void chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const tab = tabs[0];
          if (tab?.id) {
            void chrome.scripting
              .executeScript({
                target: { tabId: tab.id },
                func: (text: string) => navigator.clipboard.writeText(text),
                args: [email],
              })
              .catch(() => {});
          }
        });
      }
    });
  } else if (info.menuItemId === "open-xtoolkit") {
    void chrome.tabs.create({ url: "https://xtoolkit.live" });
  }
});

// ── Keyboard shortcut ────────────────────────────────────────────────────

chrome.commands.onCommand.addListener((command) => {
  if (command === "copy-active-email") {
    void getState().then((state) => {
      const email = getActiveEmail(state);
      if (!email) return;
      void chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        if (tab?.id) {
          void chrome.scripting
            .executeScript({
              target: { tabId: tab.id },
              func: (text: string) => navigator.clipboard.writeText(text),
              args: [email],
            })
            .catch(() => {});
        }
      });
    });
  }
});

// ── Polling ───────────────────────────────────────────────────────────────

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) {
    void pollInbox();
  }
});

async function getState(): Promise<StoredState> {
  const result = await chrome.storage.local.get(null);
  return { ...DEFAULT_STATE, ...(result as Partial<StoredState>) };
}

function getActiveEmail(state: StoredState): string {
  const { tempMailProvider, mailtm, guerrilla, onesecmail } = state;
  if (tempMailProvider === "mailtm") return mailtm?.address ?? "";
  if (tempMailProvider === "guerrilla") return guerrilla?.email ?? "";
  return onesecmail?.email ?? "";
}

async function pollInbox(): Promise<void> {
  const state = await getState();
  const { tempMailProvider, mailtm, guerrilla, onesecmail, gmail, seenMessageIds } = state;

  const allSeen = new Set(seenMessageIds ?? []);
  const newMessages: Array<{ from: string; subject: string; body: string }> = [];

  // Poll temp mail
  try {
    let msgs: Array<{ id: string; from: string; subject: string; body?: string; bodyContentType?: string }> = [];

    if (tempMailProvider === "mailtm" && mailtm) {
      const data = await mailtmMessages(mailtm.token);
      msgs = data.messages.map(normaliseMailTm);
    } else if (tempMailProvider === "guerrilla" && guerrilla) {
      const data = await guerrillaInbox(guerrilla.sid_token);
      msgs = data.messages.map((m) => normaliseGuerrilla(m as Parameters<typeof normaliseGuerrilla>[0]));
    } else if (tempMailProvider === "onesecmail" && onesecmail) {
      const data = await onesecmailInbox(onesecmail.login, onesecmail.domain);
      msgs = data.messages.map((m) => normaliseOnesec(m as Parameters<typeof normaliseOnesec>[0]));
    }

    for (const msg of msgs) {
      if (!allSeen.has(`tm-${msg.id}`)) {
        allSeen.add(`tm-${msg.id}`);
        newMessages.push({ from: msg.from, subject: msg.subject, body: msg.body ?? "" });
      }
    }
  } catch {
    // silently ignore poll errors
  }

  // Poll gmail
  try {
    if (gmail?.email) {
      const data = await temptfMessages(gmail.email);
      for (const msg of data.messages) {
        const norm = normaliseTemptf(msg as Parameters<typeof normaliseTemptf>[0]);
        if (!allSeen.has(`gm-${norm.id}`)) {
          allSeen.add(`gm-${norm.id}`);
          newMessages.push({ from: norm.from, subject: norm.subject, body: norm.body });
        }
      }
    }
  } catch {
    // silently ignore
  }

  if (newMessages.length === 0) return;

  // Update badge
  const totalNew = newMessages.length;
  await chrome.action.setBadgeText({ text: totalNew > 0 ? String(totalNew > 99 ? "99+" : totalNew) : "" });
  await chrome.action.setBadgeBackgroundColor({ color: "#1d9bf0" });

  // Persist seen IDs (keep last 200)
  const updatedSeen = [...allSeen].slice(-200);
  await chrome.storage.local.set({ seenMessageIds: updatedSeen, lastPollAt: Date.now() });

  // Send notification for latest message
  const latest = newMessages[0];
  const text = stripHtml(latest.body);
  const otp = extractOTP(text) ?? extractOTP(latest.subject);

  const notificationBody = otp
    ? `Code: ${otp} — from ${latest.from}`
    : `${latest.subject} — from ${latest.from}`;

  chrome.notifications.create(`msg-${Date.now()}`, {
    type: "basic",
    iconUrl: chrome.runtime.getURL("icons/icon48.png"),
    title: totalNew > 1 ? `${totalNew} new messages` : "New email arrived",
    message: notificationBody,
    priority: 2,
  });
}

// Clear badge when popup opens
chrome.action.onClicked.addListener(() => {
  void chrome.action.setBadgeText({ text: "" });
});
