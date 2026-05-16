# X Toolkit – Temp Email Chrome Extension

A production-ready Chrome Extension (Manifest V3) for instant disposable email inboxes, built on the X Toolkit backend.

## Features

- **3 temp email providers** — mail.tm, Guerrilla Mail, 1secmail
- **Gmail dot-trick addresses** — via temp.tf (Gmail, Outlook, Hotmail)
- **Auto-refresh inbox** every 15 seconds (even when popup is closed)
- **OTP/code detection** — highlights verification codes with 1-click copy
- **Unread badge** on extension icon
- **Desktop notifications** when new email arrives
- **Inbox history** — last 20 addresses with copy & delete
- **Right-click menu** — "Copy active temp email"
- **Keyboard shortcut** — `Alt+Shift+C` to copy active email
- **Persistent state** — survives browser restart

## Quick Start (Development)

```bash
# From workspace root:
pnpm install

# Build the extension:
pnpm --filter @workspace/x-toolkit-extension run build

# Output: artifacts/x-toolkit-extension/dist/
```

## Load in Chrome

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select the `artifacts/x-toolkit-extension/dist/` folder
5. The X Toolkit icon appears in your toolbar

## Production Build

```bash
pnpm --filter @workspace/x-toolkit-extension run build
```

This generates a `dist/` folder ready for Chrome Web Store submission.

## Chrome Web Store Packaging

```bash
# Zip the dist folder (from extension root):
cd artifacts/x-toolkit-extension
zip -r x-toolkit-extension.zip dist/
```

Upload `x-toolkit-extension.zip` to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).

## Architecture

```
src/
├── popup/          # React popup UI (400×580px)
│   ├── index.html
│   ├── index.css   # Tailwind v4 + dark theme
│   └── main.tsx
├── background/
│   └── service-worker.ts  # MV3 service worker (polling, badge, notifications)
├── components/
│   ├── App.tsx            # Root with tab navigation
│   ├── EmailHeader.tsx    # Email address + copy/refresh/new buttons
│   ├── InboxList.tsx      # Message list with skeleton loaders
│   ├── MessageView.tsx    # Full message + OTP highlight
│   ├── OTPCard.tsx        # Quick OTP card shown above inbox
│   ├── ProviderSwitcher.tsx
│   └── tabs/
│       ├── TempMailTab.tsx  # mail.tm / Guerrilla / 1secmail
│       ├── GmailTab.tsx     # temp.tf Gmail/Outlook/Hotmail
│       └── HistoryTab.tsx   # Inbox history
├── hooks/
│   ├── useStorage.ts  # chrome.storage.local wrapper
│   └── useInbox.ts    # Inbox fetching + auto-refresh
├── lib/
│   ├── api.ts   # All API calls to xtoolkit.live
│   └── otp.ts   # OTP extraction + HTML stripping
└── types/
    └── index.ts
```

## Permissions Used

| Permission | Reason |
|---|---|
| `storage` | Persist active inbox state across sessions |
| `notifications` | Alert when new email arrives |
| `alarms` | Background polling every 15 seconds |
| `contextMenus` | Right-click "Copy active temp email" |
| `clipboardWrite` | Copy email/OTP to clipboard |
| `host_permissions: xtoolkit.live` | API calls to the backend |

## Upcoming

- Content script for autofill on signup forms
- Quick OTP paste into focused input
- Compact mode (mini popup)
- Firefox support (MV3 compatible)
